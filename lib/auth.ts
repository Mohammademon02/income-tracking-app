import { cookies } from "next/headers"
import { createHash, timingSafeEqual } from "node:crypto"
import { SignJWT, jwtVerify } from "jose"

/**
 * Resolve the JWT signing key.
 *
 * Why this throws instead of falling back: a hardcoded default secret means
 * anyone who reads the source can forge a session cookie, which bypasses
 * `verifySession()` on every route and the authenticated layout. Failing at
 * startup is loud and safe; a silent fallback is neither. `APP_PASSWORD` is
 * deliberately NOT reused here — a login password and a signing key must not
 * be the same material.
 */

/**
 * Catches a value copied straight out of .env.example.
 *
 * A fake secret long enough to pass the length test fails confusingly rather
 * than obviously: every request 401s, because tokens were signed with a
 * different secret than the one verifying them.
 *
 * Deliberately narrow: it looks for the <angle-bracket> form and for a value
 * carrying neither an uppercase letter nor a digit, which no generated base64
 * or hex secret does. Guessing at wording instead — rejecting anything
 * containing "your", say — turned out to reject roughly one real secret in
 * 645, which is worse than the problem it solves.
 *
 * A template value that happens to pass both tests will not be caught here.
 * The env-shadowing note in .env.example covers that case.
 */
function looksLikePlaceholder(secret: string): boolean {
  if (/<[^>]*>/.test(secret)) return true
  return !/[A-Z]/.test(secret) && !/[0-9]/.test(secret)
}

function getSecretKey() {
  const secret = process.env.JWT_SECRET

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET is missing or too short. Set a random value of at least 32 characters " +
        "in your environment (generate one with: openssl rand -base64 32)."
    )
  }

  if (looksLikePlaceholder(secret)) {
    throw new Error(
      "JWT_SECRET still holds a placeholder value. Note that .env.production " +
        "overrides .env in production, so a placeholder there wins over a real " +
        "value in .env."
    )
  }

  return new TextEncoder().encode(secret)
}

export async function createSession(username: string) {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey())

  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function verifySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    return payload as { username: string }
  } catch {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

/**
 * Compare two strings without leaking their contents through timing.
 *
 * Both sides are hashed first so the buffers handed to `timingSafeEqual` are
 * always the same length — the function throws on a length mismatch, and the
 * raw lengths would themselves be a side channel.
 */
function safeEquals(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest()
  const hashB = createHash("sha256").update(b).digest()
  return timingSafeEqual(hashA, hashB)
}

export function validateCredentials(username: string, password: string) {
  const validUsername = process.env.APP_USERNAME
  const validPassword = process.env.APP_PASSWORD

  if (!validUsername || !validPassword) {
    throw new Error("APP_USERNAME and APP_PASSWORD must be set in the environment.")
  }

  // Both comparisons always run so a wrong username and a wrong password take
  // the same amount of time.
  const usernameOk = safeEquals(username, validUsername)
  const passwordOk = safeEquals(password, validPassword)

  return usernameOk && passwordOk
}
