import { OpenAIStream, StreamingTextResponse } from 'ai'
import { createClient } from '@supabase/supabase-js'
import { codeBlock, oneLine } from 'common-tags'
import GPT3Tokenizer from 'gpt3-tokenizer'
import {
  Configuration,
  OpenAIApi,
  CreateModerationResponse,
  CreateEmbeddingResponse,
  ChatCompletionRequestMessage,
} from 'openai-edge'
import { ApplicationError, UserError } from '@/lib/errors'
import HTMLParser from 'node-html-parser';
import fetch from 'node-fetch';

export const runtime = 'edge'

const openAiKey = process.env.OPENAI_API_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)

/**
 * Take `req` matched with an embedding, optionally including past messages, to pre-prompt a Chat Completion request to GPT-3.
 * @param req Everytime enter is pressed, a POST request is sent to the server with the current messages in the chat. This includes all messages, including past messages in the current session.
 * @returns GPT-3 response
 */
export async function POST(req: Request) {
  try {
    if (!openAiKey) {
      throw new ApplicationError('Missing environment variable OPENAI_KEY')
    }    
    if (!supabaseUrl) {
      throw new ApplicationError('Missing environment variable SUPABASE_URL')
    }
    if (!supabaseServiceKey) {
      throw new ApplicationError('Missing environment variable SUPABASE_SERVICE_ROLE_KEY')
    }

    const requestData = await req.json()
    console.debug(requestData, '\n\n\n\n\n\n\n')
    if (!requestData) {
      throw new UserError('Missing request data')
    }

    let contextText = ''

    const { messages } = requestData

    // incoroporate assistant messages into context text    
    // incorporate web scraping into context
    for (const message of messages) {
      const { role, content } = message
      if (role === 'assistant') {
        contextText += `${content.trim()}\n---\n`
      } else if (role === 'user') {
        // match out urls
        const urlRegex = /^(?:https?:\/\/)?(?:www\.)?[\w.-]+\.[a-z]{2,}(?:\/[^/#?]+)*\/?(?:#[\w.-]*)?(?:\?(?:\w+=[^&]*&?)*)?$/g
        const matches = []
        let match
        while ((match = urlRegex.exec(content)) !== null) {
          matches.push(match[0]);
        }
        // scrape urls
        for (const match of matches) {
          const response = await fetch(match)
          const root = HTMLParser.parse(await response.text())
          const allText: string[] = [];
          const textNodes = root.querySelectorAll('*:not(script):not(style)')
          textNodes.forEach((node) => {
            const text = node.innerText.trim();
            if (text.length > 0 && !text.match(/[\n\r]/)) {
              allText.push(text);
            }
          });
          contextText += `${allText.join('\n')}\n---\n`
        }
      }
    }

    
    const latestMessage = messages[messages.length - 1]
    const { content } = latestMessage
    const query = content
    if (!query) {
      throw new UserError('Missing query in request data')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    const sanitizedQuery = query.trim()
    const moderationResponse: CreateModerationResponse = await openai
      .createModeration({ input: sanitizedQuery })
      .then((res) => res.json())
    const [results] = moderationResponse.results
    if (results.flagged) {
      throw new UserError('Flagged content', {
        flagged: true,
        categories: results.categories,
      })
    }

    const embeddingResponse = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: sanitizedQuery.replaceAll('\n', ' '),
    })

    if (embeddingResponse.status !== 200) {
      throw new ApplicationError('Failed to create embedding for question', embeddingResponse)
    }

    const {
      data: [{ embedding }],
    }: CreateEmbeddingResponse = await embeddingResponse.json()

    const { error: matchError, data: pageSections } = await supabaseClient.rpc(
      'match_page_sections',
      {
        embedding,
        match_threshold: 0.78,
        match_count: 10,
        min_content_length: 50,
      }
    )

    if (matchError) {
      throw new ApplicationError('Failed to match page sections', matchError)
    }

    const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
    let tokenCount = 0

    for (let i = 0; i < pageSections.length; i++) {
      const pageSection = pageSections[i]
      const content = pageSection.content
      const encoded = tokenizer.encode(content)
      tokenCount += encoded.text.length

      if (tokenCount >= 1500) {
        break
      }

      contextText += `${content.trim()}\n---\n`
    }

    // this is the prompt for every message, including continuing off of previous messages
    // context may include past messages and webscraped results, but always the most similar decoded embedding vector from the database, or none if no match
    const prompt = codeBlock`
      ${oneLine`
        You are a very enthusiastic representative for Jackie Liu speaking to a 
        potential recruiter for a software engineering role. Given the following 
        context about Jackie, try to answer the question using that information, and summarize concisely if its too long. If you are unsure and the answer is not explicitly written down, make your best guess.
      `}

      Context sections:
      ${contextText}

      Question: """
      ${sanitizedQuery}
      """
    `
    const chatMessage: ChatCompletionRequestMessage = {
      role: 'user',
      content: prompt,
    }

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [chatMessage],
      max_tokens: 512,
      temperature: 0,
      stream: true,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new ApplicationError('Failed to generate completion', error)
    }

    // Transform the response into a readable stream
    const stream = OpenAIStream(response) 

    // Return a StreamingTextResponse, which can be consumed by the client
    return new StreamingTextResponse(stream)
  } catch (err: unknown) {
    if (err instanceof UserError) {
      return new Response(
        JSON.stringify({
          error: err.message,
          data: err.data,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    } else if (err instanceof ApplicationError) {
      // Print out application errors with their additional data
      console.error(`${err.message}: ${JSON.stringify(err.data)}`)
    } else {
      // Print out unexpected errors as is to help with debugging
      console.error(err)
    }

    // TODO: include more response info in debug environments
    return new Response(
      JSON.stringify({
        error: 'There was an error processing your request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

}
