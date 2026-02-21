import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Delete read notifications older than 30 days
    const deletedCount = await prisma.notification.deleteMany({
      where: {
        read: true,
        timestamp: {
          lt: thirtyDaysAgo
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      deletedCount: deletedCount.count 
    })

  } catch (error) {
    console.error("Error cleaning up notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}