# About
NextJS chatbot for information about me. Forked from the starter `NextJS chatbot` template. Some components removed. See project description in main branch README. Lots of unused code, for example for Vercel KV. We use the OpenAI Embeddings API, inspired from `nextjs-doc-search` project, implemented through the generate embeddings command. Use `Supabase` for the backend.

## Implmenentation
**[nextjs-openai-doc-search](https://github.com/supabase-community/nextjs-openai-doc-search)** forked, modify their `generate-embeddings.ts` script to not only look at the `.mdx` files. 
0. Use the embeddings API and Supabase Cloud (see associated project on the dashboard) [TESTED]
1. Instead, use `pdf-parse` to parse a PDF (resume) and generate embeddings from that. [TESTED]
	1. TODO automate this step away by creating a storage bucket that can be uploaded to. This storage bucket serves as the source of the main website's resume pdf download button, as well as the embeddings for the chatbot. Attach a lambda function to the bucket to trigger a rebuild of the chatbot on Netlify.
  2. TODO Generate a story based on the text of the Resume, and use the story as an embedding.
2. Use `Notion integrations` to parse unpublished text. For any page in Notion, add a `Connection` to the chatbot. Then use the Notion API key and `@notionhq/client`, retrieving the block children of the page id.[TESTED]
3. Use `npm-html-parser` CSS selectors and `got` to get and parse webpage bodies for job descriptions, removing all styles, scripts, newlines, etc. and performing additional parsing as needed. [TESTED]
	1. TODO refer to ChatGPT to perform more parsing as needed.
5. TODO Use Notion and use just the built in MDX parser, not just Notion itself since it's hard to parse. We could use Notion for its readability and ability to be edited easily, have an integration that converts it into MDX. Convert everything into Notion/Markdown for simplicity. Use `notion-to-md`.
5. TODO Implement serverless or edge function to perform with OpenAI functions. 
6. Use the pre-written `generate-embeddings` script to parse my `mdx` blog posts and project READMEs.

# Dev
See `package.json` for run instructions for the website and how to generate the embeddings.

# Prod
Deployed on Netlify.

## Env vars
In prod, environment variables are set in Netlify. Otherwise, see the main branch for the `.env.example` template and rename to `.env.local` and populate values for test. Do not commit the env vars.