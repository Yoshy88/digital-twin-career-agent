import { ZodError, z } from 'zod'
import { checkRateLimit } from '@/lib/api/rate-limit'
import { triggerFollowUpOnce } from '@/lib/api/followup'
import { jsonError, jsonOk, logError, requestIdFromHeaders } from '@/lib/api/http'
import { endConversationBodySchema } from '@/lib/api/schemas'
import {
  getConversationById,
  getConversationMessages
} from '@/lib/db/queries'

const paramsSchema = z.object({
  conversationId: z.string().uuid()
})

export async function GET(req: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const requestId = requestIdFromHeaders(req.headers)

  const rateLimit = checkRateLimit(req, 'conversations:get', 60, 60_000)
  if (!rateLimit.allowed) {
    return jsonError('Too many requests. Please retry shortly.', requestId, 429)
  }

  try {
    const parsedParams = paramsSchema.parse(await params)
    const conversation = await getConversationById(parsedParams.conversationId)

    if (!conversation) {
      return jsonError('Conversation not found', requestId, 404)
    }

    const messages = await getConversationMessages(parsedParams.conversationId)

    return jsonOk({ conversation, messages }, requestId)
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.issues[0]?.message ?? 'Invalid conversationId', requestId, 400)
    }

    logError(requestId, 'conversations.get', error)
    return jsonError('Failed to get conversation', requestId, 500)
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const requestId = requestIdFromHeaders(req.headers)

  const rateLimit = checkRateLimit(req, 'conversations:patch', 30, 60_000)
  if (!rateLimit.allowed) {
    return jsonError('Too many requests. Please retry shortly.', requestId, 429)
  }

  try {
    const parsedParams = paramsSchema.parse(await params)
    endConversationBodySchema.parse(await req.json())

    const existingConversation = await getConversationById(parsedParams.conversationId)
    if (!existingConversation) {
      return jsonError('Conversation not found', requestId, 404)
    }

    if (existingConversation.ended_at) {
      return jsonError('Conversation already ended or not found', requestId, 409)
    }

    const followUpTriggered = await triggerFollowUpOnce(parsedParams.conversationId)
    if (!followUpTriggered) {
      return jsonError('Conversation end already in progress', requestId, 409)
    }

    return jsonOk({ success: true, conversationId: parsedParams.conversationId, ended: true }, requestId)
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.issues[0]?.message ?? 'Invalid payload', requestId, 400)
    }

    logError(requestId, 'conversations.patch', error)
    return jsonError('Failed to update conversation', requestId, 500)
  }
}
