import { NextResponse } from "next/server"

import { getApiSession, serverError, unauthorized } from "@/lib/api-utils"
import { markRead } from "@/lib/notifications/state"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession()
    if (!session) return unauthorized()

    const { id } = await params
    await markRead(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return serverError("mark notification read", error)
  }
}
