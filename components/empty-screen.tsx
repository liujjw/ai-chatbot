import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

const exampleMessages = [
  {
    heading: 'Tell me about Jackie.',
    message: 'Tell me about Jackie.'
  },
  {
    heading: 'How can I contact Jackie?',
    message: 'How can I contact Jackie?'
  },
  {
    heading: 'Is Jackie a good fit for the job described by [DESCRIPTION or LINK]?', 
    message: `Is Jackie a good fit for the job described by [DESCRIPTION or LINK]`
  },
  {
    heading: 'Tell me about things that are important to Jackie in the workplace.',
    message: `Tell me about things that are important to Jackie in the workplace.`
  },
  {
    heading: 'Describe Jackie\'s experience with the software development lifecycle',
    message: 'Describe Jackie\'s experience with the software development lifecycle'
  },
  {
    heading: 'Tell me about Jackie\'s research project, Rust OS that he describes more in one of his posts',
    message: 'Tell me about Jackie\'s research project, Rust OS that he describes more in one of his posts'
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
          Pre-prompted LLM chatbot about the info on {' '}
          <ExternalLink href="https://liujjw.xyz">liujjw.xyz</ExternalLink> and yours truly.
        </p>
        <p className="leading-normal text-muted-foreground">
          Try the following examples, try some follow-up questions, and try similar questions:
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
