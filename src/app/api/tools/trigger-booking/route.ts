import { NextResponse } from 'next/server'
import { createBooking } from '@/lib/db/queries'
import { ZodError } from 'zod'
import { checkRateLimit } from '@/lib/api/rate-limit'
import { jsonError, jsonOk, logError, requestIdFromHeaders } from '@/lib/api/http'
import { triggerBookingBodySchema } from '@/lib/api/schemas'

export async function POST(req: Request) {
  const requestId = requestIdFromHeaders(req.headers)

  const rateLimit = checkRateLimit(req, 'tools:trigger-booking', 25, 60_000)
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
    const body = triggerBookingBodySchema.parse(await req.json())

    const booking = await createBooking({
      visitorId: body.visitorId,
      visitorName: body.visitorName,
      visitorEmail: body.visitorEmail
    })

    return jsonOk({
      success: true,
      bookingId: booking.id,
      status: booking.status
    }, requestId)
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(error.issues[0]?.message ?? 'Invalid payload', requestId, 400)
    }

    logError(requestId, 'tools.trigger-booking', error)
    return jsonError('Failed to trigger booking', requestId, 500)
  }
}
