import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current month start and end
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    monthEnd.setHours(23, 59, 59, 999)

    const entries = await prisma.dailyEntry.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      select: {
        points: true,
        date: true
      }
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error("Error fetching current month entries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}