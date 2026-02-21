import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { notificationStore } from "@/lib/notification-store"

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the current notification IDs from the request body or generate common ones
    let notificationIds: string[] = [];
    
    try {
      const body = await request.json();
      notificationIds = body.notificationIds || [];
    } catch {
      // If no body, use common notification patterns
      notificationIds = [
        'demo-notification',
        'error-notification',
        'daily-goal-2026-02-21',
        'daily-goal-2026-02-20',
        'daily-goal-2026-02-19'
      ];

      // Add withdrawal delay notifications
      for (let i = 1; i <= 10; i++) {
        notificationIds.push(`withdrawal-delayed-${i}`);
        notificationIds.push(`withdrawal-completed-${i}`);
        notificationIds.push(`milestone-${i * 1000}`);
      }
    }

    // Mark all notifications as read using shared store
    notificationStore.markAllAsRead(notificationIds);

    return NextResponse.json({ success: true, markedCount: notificationIds.length })

  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}