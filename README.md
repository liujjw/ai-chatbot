# About
NextJS chatbot for information about me. Forked from the starter `NextJS chatbot` template. Some components removed. See project description in main branch README. Lots of unused code, for example for Vercel KV. We use the OpenAI Embeddings API, inspired from `nextjs-doc-search` project, implemented through the generate embeddings command. Use `Supabase` Cloud for the backend.

## Implmenentation
There are two steps, build time and runtime. Build time uses [nextjs-openai-doc-search](https://github.com/liujjw/nextjs-openai-doc-search) and runtime uses [API endpoint](https://github.com/liujjw/ai-chatbot/blob/my-ai/app/api/chat/route.ts).
#### Build time (generate DB embeddings)
This is mostly automated, just modify Notion documents, and then rebuild the embeddings database by running [nextjs-openai-doc-search](https://github.com/liujjw/nextjs-openai-doc-search). This assumes the tables and functions in Supabase have already been created, which is most likely true.
1. Use Notion for its readability and ability to be edited easily. Convert everything into Notion for simplicity, see Recruiting folder in Notion. Use `Notion integrations` (add a connection for every page) and `notion-to-md` to generate automatically Markdown into a directory.
2. Use [nextjs-openai-doc-search](https://github.com/liujjw/nextjs-openai-doc-search) `generate-embeddings.ts` script to look at `.mdx` and `md` files and build the embeddings into [Supabase](https://github.com/liujjw/nextjs-openai-doc-search/blob/main/supabase/migrations/20230406025118_init.sql) Cloud. See Supabase Cloud project.

#### Other ideas for build time
1. Instead, use `pdf-parse` to parse a PDF (resume) and generate embeddings from that. [TESTED]
	1. We could automate this step away by creating a storage bucket that can be uploaded to. This storage bucket serves as the source of the main website's resume pdf download button, as well as the embeddings for the chatbot. Attach a lambda function to the bucket to trigger a rebuild of the chatbot on Netlify.
2. Use the Notion API key and `@notionhq/client`, retrieving the block children of the page id.[TESTED]

#### Runtime
This is handled by Netlify and NextJS Edge runtime in the [API endpoint](https://github.com/liujjw/ai-chatbot/blob/my-ai/app/api/chat/route.ts).  
1. For internet queries, use `npm-html-parser` CSS selectors and `got` to get and parse webpage bodies for job descriptions, removing all styles, scripts, newlines, etc. and performing additional parsing as needed. [TESTED]
	1. TODO refer to ChatGPT to perform more parsing as needed.
2. TODO Implement serverless or edge function to perform with OpenAI functions. 

# Prod
Deployed on Netlify.

## Env vars
In prod, environment variables are set in Netlify. Otherwise, see the main branch for the `.env.example` template and rename to `.env.local` and populate values for test. Do not commit the env vars.
