import { redirect } from "next/navigation"

import { verifySession } from "@/lib/auth"

/**
 * Require a signed-in user, or send them to the login page.
 *
 * Server actions used to `throw new Error("Unauthorized")`. In production Next
 * replaces a thrown server-action error with an opaque digest, so an expired
 * seven-day session surfaced to the user as a generic "something went wrong"
 * with no way forward. Redirecting puts them where they can actually recover.
 */
export async function requireSession() {
  const session = await verifySession()
  if (!session) redirect("/login")
  return session
}

/**
 * What every mutating server action returns.
 *
 * A single shape — rather than a union of `{ success }` and `{ error }` — so
 * callers can read `result.error` without narrowing first. The client code
 * already checked it that way; the union was what stopped it type-checking.
 */
export type ActionResult = { success: boolean; error?: string }

/**
 * Turn an unexpected failure into a message safe to render.
 *
 * Prisma error text can carry connection strings and query fragments, so only
 * recognised, non-sensitive cases get a specific message; everything else gets
 * a generic one and the detail goes to the server log.
 */
export function toActionError(error: unknown, fallback: string): ActionResult {
  const message = error instanceof Error ? error.message : String(error)

  // P2025: the row was already gone by the time we wrote.
  if (message.includes("P2025") || message.includes("Record to update not found")) {
    return { success: false, error: "That record no longer exists. Refresh and try again." }
  }

  // P2023 / ObjectId parse failures from a malformed id.
  if (message.includes("P2023") || message.includes("Malformed ObjectID")) {
    return { success: false, error: "Invalid record reference." }
  }

  console.error(`[action] ${fallback}:`, error)
  return { success: false, error: fallback }
}
