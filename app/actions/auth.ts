"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { createSession, deleteSession, validateCredentials } from "@/lib/auth"
import { rateLimit, resetRateLimit } from "@/lib/rate-limit"
import { loginSchema } from "@/lib/validation"

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

async function getClientIdentifier() {
  const headerList = await headers()
  const forwarded = headerList.get("x-forwarded-for")
  // x-forwarded-for is a comma-separated chain; the first entry is the client.
  return forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown"
}

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: "Invalid credentials" }
  }

  const identifier = await getClientIdentifier()
  const { limited, retryAfter } = rateLimit(identifier, {
    maxAttempts: MAX_ATTEMPTS,
    windowMs: WINDOW_MS,
  })

  if (limited) {
    const minutes = Math.ceil(retryAfter / 60)
    return { error: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` }
  }

  /*
   * Both of these throw when the deployment is missing environment variables:
   * validateCredentials() if APP_USERNAME or APP_PASSWORD is unset, and
   * createSession() -> getSecretKey() if JWT_SECRET is missing, under 32
   * characters, or still a placeholder.
   *
   * Uncaught, that surfaces as a bare 500 and React's production error digest,
   * which says only "an error occurred in the Server Components render" — the
   * message is stripped from production builds on purpose. A correctly built
   * app pointed at an unconfigured host therefore looked identical to a broken
   * one, with nothing anywhere to tell them apart.
   *
   * The real message goes to the server log, where the operator can read it in
   * the host's runtime logs. The form gets a generic version: naming the
   * missing variable to an unauthenticated visitor is not information this has
   * to give away to be useful.
   */
  try {
    if (!validateCredentials(parsed.data.username, parsed.data.password)) {
      return { error: "Invalid credentials" }
    }

    resetRateLimit(identifier)
    await createSession(parsed.data.username)
  } catch (error) {
    console.error("[auth] Login failed before a session could be created:", error)
    return {
      error:
        "The server is not configured correctly. Check the deployment's environment variables.",
    }
  }

  // redirect() throws internally, so it must stay outside the try/catch above —
  // caught, it would be reported as a configuration failure on every success.
  redirect("/dashboard")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
