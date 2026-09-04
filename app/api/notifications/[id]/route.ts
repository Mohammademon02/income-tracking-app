import { NextResponse } from "next/server"

import { getApiSession, serverError, unauthorized } from "@/lib/api-utils"
import { dismiss } from "@/lib/notifications/state"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession()
    if (!session) return unauthorized()

    const { id } = await params

    // Dismissal is persisted against the notification's derived key, so it now
    // survives a restart and applies on every device rather than living in one
    // process's memory.
    await dismiss(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return serverError("dismiss notification", error)
  }
}
