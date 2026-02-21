import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const targetDate = dateParam ? new Date(dateParam) : new Date()

    // Set to start and end of the day
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Get entries for the specified date
    const todayEntries = await prisma.dailyEntry.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      select: {
        points: true
      }
    })

    const todayPoints = todayEntries.reduce((sum, entry) => sum + entry.points, 0)

    // Define daily goal (this could be made configurable per user)
    const dailyGoalPoints = 2000 // 2000 points = $20

    const achieved = todayPoints >= dailyGoalPoints
    const progress = Math.min((todayPoints / dailyGoalPoints) * 100, 100)

    return NextResponse.json({
      todayPoints,
      goalPoints: dailyGoalPoints,
      achieved,
      progress,
      date: targetDate.toISOString().split('T')[0]
    })
  } catch (error) {
    console.error("Error fetching daily goal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}