import { ZodError, z } from 'zod'
import { checkRateLimit } from '@/lib/api/rate-limit'
import { jsonError, jsonOk, logError, requestIdFromHeaders } from '@/lib/api/http'
import { listRecentConversations } from '@/lib/db/queries'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

export async function GET(req: Request) {
  const requestId = requestIdFromHeaders(req.headers)

  const rateLimit = checkRateLimit(req, 'conversations:list', 60, 60_000)
  if (!rateLimit.allowed) {
    return jsonError('Too many requests. Please retry shortly.', requestId, 429)
  }

  try {
    const url = new URL(req.url)
    const query = querySchema.parse({ limit: url.searchParams.get('limit') ?? undefined })
    const conversations = await listRecentConversations(query.limit)
    return jsonOk({ conversations }, requestId)
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.issues[0]?.message ?? 'Invalid query', requestId, 400)
    }

    logError(requestId, 'conversations.list', error)
    return jsonError('Failed to list conversations', requestId, 500)
  }
}
