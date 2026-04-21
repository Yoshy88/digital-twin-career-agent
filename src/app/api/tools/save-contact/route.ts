import { NextResponse } from 'next/server'
import { saveVisitorContact } from '@/lib/db/queries'
import { ZodError } from 'zod'
import { checkRateLimit } from '@/lib/api/rate-limit'
import { jsonError, jsonOk, logError, requestIdFromHeaders } from '@/lib/api/http'
import { saveContactBodySchema } from '@/lib/api/schemas'

export async function POST(req: Request) {
  const requestId = requestIdFromHeaders(req.headers)

  const rateLimit = checkRateLimit(req, 'tools:save-contact', 25, 60_000)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please retry shortly.',
        requestId
      },
      {
        status: 429,
        headers: {
          'retry-after': String(rateLimit.retryAfterSeconds),
          'x-request-id': requestId
        }
      }
    )
  }

  try {
    const parsed = saveContactBodySchema.parse(await req.json())

    const visitor = await saveVisitorContact({
      name: parsed.name,
      email: parsed.email,
      intent: parsed.intent
    })

    return jsonOk({ success: true, visitorId: visitor.id }, requestId)
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.issues[0]?.message ?? 'Invalid payload', requestId, 400)
    }

    logError(requestId, 'tools.save-contact', error)
    return jsonError('Failed to save contact', requestId, 500)
  }
}
