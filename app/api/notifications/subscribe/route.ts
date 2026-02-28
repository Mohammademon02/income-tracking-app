import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subscription } = await request.json()

    if (!subscription) {
      return NextResponse.json({ error: "Subscription data required" }, { status: 400 })
    }

    // Store subscription in localStorage for now
    // In production, you'd store this in your database
    if (process.env.NODE_ENV === 'development') {
      console.log('Push subscription received:', subscription)
    }

    // Here you would typically:
    // 1. Store the subscription in your database
    // 2. Associate it with the user
    // 3. Set up server-side push notification scheduling

    return NextResponse.json({ 
      success: true, 
      message: "Subscription saved successfully" 
    })

  } catch (error) {
    console.error("Error saving push subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}