import { NextResponse } from "next/server"

import { getApiSession, serverError, unauthorized } from "@/lib/api-utils"
import { markAllRead } from "@/lib/notifications/state"

export async function POST() {
  try {
    const session = await getApiSession()
    if (!session) return unauthorized()

    // Keys come from live data. The previous version fell back to a hardcoded
    // list of ids pinned to February 2026, matched nothing real, and reported
    // markedCount: 25.
    const markedCount = await markAllRead()

    return NextResponse.json({ success: true, markedCount })
  } catch (error) {
    return serverError("mark all notifications read", error)
  }
}
