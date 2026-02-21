import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { notificationStore } from "@/lib/notification-store"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Mark notification as read using shared store
    notificationStore.markAsRead(id);

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}