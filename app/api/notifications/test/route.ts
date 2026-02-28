import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return a test notification to verify the system works
    const testNotifications = [
      {
        id: "test-notification-1",
        type: "SYSTEM",
        title: "Notification System Active! 🎉",
        message: "Your notification system is working correctly. This is a test notification.",
        timestamp: new Date(),
        read: false,
        priority: "MEDIUM",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "test-notification-2",
        type: "SYSTEM",
        title: "Welcome Message 🌟",
        message: "You'll receive updates about withdrawals, daily goals, and monthly goals here.",
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        priority: "LOW",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]

    return NextResponse.json(testNotifications)

  } catch (error) {
    console.error("Error generating test notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}