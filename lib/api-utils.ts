import { NextResponse } from "next/server"

import { verifySession } from "@/lib/auth"

/**
 * Shared responses for route handlers.
 *
 * The point of routing every failure through here is that a route can no
 * longer answer `200 OK` with fabricated data when something went wrong. Several
 * handlers used to do exactly that — the settings PUT echoed the submitted
 * values back after a failed write, and the metrics route returned all zeros on
 * a database outage, which renders as "you earned nothing" rather than "this
 * is broken".
 */

export const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 })

export const badRequest = (message: string) =>
  NextResponse.json({ error: message }, { status: 400 })

export const notFound = (message = "Not found") =>
  NextResponse.json({ error: message }, { status: 404 })

/** Log the real cause, return a message that leaks nothing. */
export function serverError(context: string, error: unknown) {
  console.error(`[api] ${context}:`, error)
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
}

/** Resolve the current session, or null if the request is not signed in. */
export async function getApiSession() {
  return verifySession()
}
