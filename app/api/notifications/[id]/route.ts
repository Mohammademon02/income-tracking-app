import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { notificationStore } from "@/lib/notification-store"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Delete notification using shared store
    notificationStore.deleteNotification(id);

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}