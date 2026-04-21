import { NextResponse } from 'next/server'
import { fetchOwnerProfile } from '@/lib/db/queries'
import { checkRateLimit } from '@/lib/api/rate-limit'
import { jsonError, jsonOk, logError, requestIdFromHeaders } from '@/lib/api/http'

export async function GET(req: Request) {
  const requestId = requestIdFromHeaders(req.headers)

  const rateLimit = checkRateLimit(req, 'tools:fetch-profile', 60, 60_000)
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
    const profile = await fetchOwnerProfile()
    return jsonOk(profile, requestId)
  } catch (error) {
    logError(requestId, 'tools.fetch-profile', error)
    return jsonError('Failed to fetch profile', requestId, 500)
  }
}
