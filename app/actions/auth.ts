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

  if (!validateCredentials(parsed.data.username, parsed.data.password)) {
    return { error: "Invalid credentials" }
  }

  resetRateLimit(identifier)
  await createSession(parsed.data.username)

  // redirect() throws internally, so it must stay outside any try/catch.
  redirect("/dashboard")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
