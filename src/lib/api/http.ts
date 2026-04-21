import { NextResponse } from 'next/server'

export function requestIdFromHeaders(headers: Headers) {
  return headers.get('x-request-id') ?? crypto.randomUUID()
}

export function jsonOk<T>(data: T, requestId: string, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'x-request-id': requestId
    }
  })
}

export function jsonError(message: string, requestId: string, status = 500) {
  return NextResponse.json(
    {
      error: message,
      requestId
    },
    {
      status,
      headers: {
        'x-request-id': requestId
      }
    }
  )
}

export function logInfo(requestId: string, scope: string, detail: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ level: 'info', requestId, scope, ...detail }))
}

export function logError(requestId: string, scope: string, error: unknown, detail: Record<string, unknown> = {}) {
  console.error(JSON.stringify({
    level: 'error',
    requestId,
    scope,
    error: error instanceof Error ? error.message : String(error),
    ...detail
  }))
}
