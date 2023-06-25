import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

const exampleMessages = [
  {
    heading: 'Is Jackie the right fit for [xyz job posting]?',
    message: `What is a "serverless function"? [function call, langchain, s3, lambda]`
  },
  {
    heading: 'What\'s he working the most on now?',
    message: 'Summarize the following article for a 2nd grader: \n'
  },
  {
    heading: 'Explain his rust-os project to me. (docsearch blog posts, readmes, and pdfs)', 
    message: `Draft an email to my boss about the following: \n`
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Who is, Jackie?
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          Pre-prompted LLM chatbot about{' '}
          <ExternalLink href="https://liujjw.xyz">liujjw.xyz</ExternalLink>
          .
        </p>
        <p className="leading-normal text-muted-foreground">
          Try the following examples:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
