import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { SYSTEM_PROMPT } from '@/lib/ai/prompt'
import { tools } from '@/lib/ai/tools'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = await streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: SYSTEM_PROMPT,
      messages,
      tools
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}