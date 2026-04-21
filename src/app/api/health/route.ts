import { jsonOk, requestIdFromHeaders } from '@/lib/api/http'

export async function GET(req: Request) {
  const requestId = requestIdFromHeaders(req.headers)

  return jsonOk(
    {
      ok: true,
      service: 'digital-twin-career-agent',
      timestamp: new Date().toISOString()
    },
    requestId
  )
}
