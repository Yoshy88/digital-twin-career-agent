import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { SYSTEM_PROMPT } from '@/lib/ai/prompt'
import { tools } from '@/lib/ai/tools'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 })
    }

    const result = await streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: SYSTEM_PROMPT,
      messages,
      tools
    })

    let fullText = ''
    for await (const chunk of result.textStream) {
      fullText += chunk
    }

    if (!fullText.trim()) {
      return new Response('Empty response from model', { status: 500 })
    }

    return new Response(fullText, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error'
    return new Response(errorMessage, { status: 500 })
  }
}