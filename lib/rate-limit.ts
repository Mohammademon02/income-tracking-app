/**
 * Fixed-window rate limiter kept in process memory.
 *
 * This is deliberately simple: the app is single-user and runs as one Node
 * process, so a shared store would be overkill. It does mean the window resets
 * on redeploy — acceptable for slowing down password guessing, not a substitute
 * for a real store if this ever becomes multi-instance.
 *
 * Entries are swept on write so the map cannot grow without bound.
 */

type Attempt = { count: number; resetAt: number }

const buckets = new Map<string, Attempt>()

function sweep(now: number) {
  for (const [key, attempt] of buckets) {
    if (attempt.resetAt <= now) buckets.delete(key)
  }
}

export type RateLimitResult = {
  limited: boolean
  /** Seconds until the caller may try again. Only meaningful when limited. */
  retryAfter: number
}

export function rateLimit(
  identifier: string,
  { maxAttempts, windowMs }: { maxAttempts: number; windowMs: number }
): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const existing = buckets.get(identifier)

  if (!existing || existing.resetAt <= now) {
    buckets.set(identifier, { count: 1, resetAt: now + windowMs })
    return { limited: false, retryAfter: 0 }
  }

  existing.count += 1

  if (existing.count > maxAttempts) {
    return { limited: true, retryAfter: Math.ceil((existing.resetAt - now) / 1000) }
  }

  return { limited: false, retryAfter: 0 }
}

/** Clear a bucket, e.g. after a successful login. */
export function resetRateLimit(identifier: string) {
  buckets.delete(identifier)
}
