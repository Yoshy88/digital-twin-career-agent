import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { ZodError } from 'zod'
import { SYSTEM_PROMPT } from '@/lib/ai/prompt'
import { tools } from '@/lib/ai/tools'
import {
  fetchOwnerProfile,
  saveMessage,
  startConversation,
  type OwnerProfile
} from '@/lib/db/queries'
import { checkRateLimit } from '@/lib/api/rate-limit'
import { chatBodySchema } from '@/lib/api/schemas'
import { jsonError, logError, logInfo, requestIdFromHeaders } from '@/lib/api/http'

export const maxDuration = 30

interface ChatMessage {
  role?: string
  content?: string
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function latestUserContent(messages: ChatMessage[]) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === 'user') {
      return messages[i]?.content?.trim() ?? ''
    }
  }

  return ''
}

function buildFallbackReply(userText: string) {
  const lowerText = userText.toLowerCase()
  const hasAny = (...keywords: string[]) => keywords.some((keyword) => lowerText.includes(keyword))
  const hasWord = (...words: string[]) =>
    words.some((word) => new RegExp(`\\b${word}\\b`, 'i').test(lowerText))

  if (hasWord('hi', 'hello', 'hey') || hasAny('good morning', 'good afternoon', 'good evening')) {
    return 'Hi, thanks for reaching out. I can help with Dwight\'s background, tech stack, availability, and next steps for hiring or collaboration.'
  }

  if (hasAny('@', 'email', 'contact', 'reach me', 'reach out')) {
    return 'Thanks for sharing your contact details. I have saved them and Dwight will follow up soon.'
  }

  if (hasAny('book', 'schedule', 'meeting', 'call', 'interview')) {
    return 'Your booking request has been noted. Dwight will reach out shortly to confirm details.'
  }

  if (hasAny('hire', 'hiring', 'recruit', 'recruiter', 'opening', 'role')) {
    return 'Great to connect. Dwight is open to full-time roles, freelance projects, and collaborations. If you share the role details and timeline, I can log your interest right away.'
  }

  if (hasAny('available', 'availability', 'open to work', 'open for')) {
    return 'Dwight is currently available for full-time roles, freelance projects, and collaborations. If you share your preferred schedule, I can also log a booking request.'
  }

  if (hasAny('skill', 'stack', 'tech', 'technology')) {
    return 'Dwight\'s core stack includes Next.js, React, TypeScript, Node.js, PostgreSQL, and AI-powered web application development on Vercel.'
  }

  if (hasAny('experience', 'background', 'about you', 'about dwight', 'profile')) {
    return 'Dwight is a Full Stack Developer who builds modern AI-powered web applications, with strong experience in product-focused delivery across frontend and backend.'
  }

  if (hasAny('project', 'portfolio', 'built', 'case study')) {
    return 'Dwight has worked on modern full-stack and AI-powered applications using Next.js, TypeScript, and PostgreSQL. If you want, I can summarize relevant project experience for your use case.'
  }

  return 'Thanks for your message. Could you share what opportunity or collaboration you have in mind so I can help better?'
}

function buildProfileContext(profile: OwnerProfile) {
  return [
    '## Live Profile Data (from database)',
    `- Name: ${profile.name}`,
    `- Role: ${profile.role}`,
    `- Skills: ${profile.skills.join(', ')}`,
    `- Experience: ${profile.experience}`,
    `- Available for: ${profile.available_for.join(', ')}`,
    `- Summary: ${profile.summary}`
  ].join('\n')
}

function buildDbAwareFallbackReply(userText: string, profile: OwnerProfile) {
  const lowerText = userText.toLowerCase()
  const hasAny = (...keywords: string[]) => keywords.some((keyword) => lowerText.includes(keyword))
  const topSkills = profile.skills.slice(0, 6).join(', ')
  const availableFor = profile.available_for.join(', ')

  if (hasAny('skill', 'stack', 'tech', 'technology')) {
    return `${profile.name}'s core stack includes ${topSkills}.`
  }

  if (hasAny('experience', 'background', 'profile', 'about')) {
    return `${profile.summary} ${profile.experience}.`
  }

  if (hasAny('hire', 'hiring', 'recruit', 'recruiter', 'opening', 'role', 'available', 'availability')) {
    return `${profile.name} is currently available for ${availableFor}. If you share role details and timeline, I can log your interest right away.`
  }

  return buildFallbackReply(userText)
}

export async function POST(req: Request) {
  const requestId = requestIdFromHeaders(req.headers)

  const rateLimit = checkRateLimit(req, 'chat:post', 20, 60_000)
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please retry shortly.', requestId }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'retry-after': String(rateLimit.retryAfterSeconds),
          'x-request-id': requestId
        }
      }
    )
  }

  try {
    const body = chatBodySchema.parse(await req.json())
    const messages = body.messages as ChatMessage[]
    const incomingConversationId = body.conversationId
    const conversationId = incomingConversationId && isUuid(incomingConversationId)
      ? incomingConversationId
      : await startConversation()

    const userText = latestUserContent(messages)
    if (userText) {
      await saveMessage({
        conversationId,
        role: 'user',
        content: userText
      })
    }

    const profile = await fetchOwnerProfile()

    const result = await streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: `${SYSTEM_PROMPT}\n\n${buildProfileContext(profile)}`,
      messages,
      tools,
      maxSteps: 5
    })

    let fullText = ''
    for await (const chunk of result.textStream) {
      fullText += chunk
    }

    const reply = fullText.trim() || buildDbAwareFallbackReply(userText, profile)
    await saveMessage({
      conversationId,
      role: 'assistant',
      content: reply
    })

    logInfo(requestId, 'chat.response', {
      conversationId,
      usedModelText: Boolean(fullText.trim()),
      userChars: userText.length,
      replyChars: reply.length
    })

    return new Response(reply, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Conversation-Id': conversationId,
        'x-request-id': requestId
      }
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.issues[0]?.message ?? 'Invalid payload', requestId, 400)
    }

    logError(requestId, 'chat.post', error)
    return jsonError('Internal Server Error', requestId, 500)
  }
}