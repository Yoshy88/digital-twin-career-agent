type RateLimitBucket = {
  count: number
  resetAt: number
}

const bucketStore = new Map<string, RateLimitBucket>()

function clientKeyFromRequest(req: Request) {
  const xff = req.headers.get('x-forwarded-for')
  const firstIp = xff?.split(',')[0]?.trim()
  const userAgent = req.headers.get('user-agent') ?? 'unknown'
  return `${firstIp ?? 'local'}:${userAgent}`
}

export function checkRateLimit(req: Request, scope: string, limit: number, windowMs: number) {
  if (process.env.NODE_ENV !== 'production') {
    return { allowed: true, retryAfterSeconds: 0 }
  }

  const now = Date.now()
  const key = `${scope}:${clientKeyFromRequest(req)}`

  const existing = bucketStore.get(key)
  if (!existing || now >= existing.resetAt) {
    bucketStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    }
  }

  existing.count += 1
  bucketStore.set(key, existing)
  return { allowed: true, retryAfterSeconds: 0 }
}
