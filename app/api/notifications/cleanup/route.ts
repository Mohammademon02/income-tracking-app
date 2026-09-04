import { NextResponse } from "next/server"

import { getApiSession, serverError, unauthorized } from "@/lib/api-utils"
import { pruneOrphanedState } from "@/lib/notifications/state"

export async function POST() {
  try {
    const session = await getApiSession()
    if (!session) return unauthorized()

    // Prunes read/dismissed rows whose notification can no longer derive. The
    // old route deleted from the `Notification` model, which nothing ever
    // wrote to, so it always reported zero.
    const deletedCount = await pruneOrphanedState()

    return NextResponse.json({ success: true, deletedCount })
  } catch (error) {
    return serverError("notification cleanup", error)
  }
}
