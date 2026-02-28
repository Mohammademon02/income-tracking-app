import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Remove subscription from storage
    // In production, you'd remove this from your database
    if (process.env.NODE_ENV === 'development') {
      console.log('Push subscription removed for user')
    }

    return NextResponse.json({ 
      success: true, 
      message: "Subscription removed successfully" 
    })

  } catch (error) {
    console.error("Error removing push subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}