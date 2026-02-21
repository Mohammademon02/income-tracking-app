import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Calculate total points across all accounts
    const entries = await prisma.dailyEntry.findMany({
      select: {
        points: true
      }
    })

    const totalPoints = entries.reduce((sum, entry) => sum + entry.points, 0)

    // Define milestone thresholds (in points)
    const milestones = [
      1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000
    ]

    // Find achieved milestones
    const achievedMilestones = milestones.filter(milestone => totalPoints >= milestone)
    const nextMilestone = milestones.find(milestone => totalPoints < milestone) || milestones[milestones.length - 1] * 2

    // Check for recently achieved milestones (in the last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentEntries = await prisma.dailyEntry.findMany({
      where: {
        createdAt: {
          gte: oneHourAgo
        }
      },
      select: {
        points: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "asc"
      }
    })

    // Calculate running total to find when milestones were crossed
    const totalPointsBeforeRecent = totalPoints - recentEntries.reduce((sum, entry) => sum + entry.points, 0)
    let runningTotal = totalPointsBeforeRecent
    const recentMilestones: number[] = []

    recentEntries.forEach(entry => {
      const previousTotal = runningTotal
      runningTotal += entry.points

      // Check if any milestone was crossed with this entry
      milestones.forEach(milestone => {
        if (previousTotal < milestone && runningTotal >= milestone) {
          recentMilestones.push(milestone)
        }
      })
    })

    return NextResponse.json({
      totalPoints,
      nextMilestone,
      recentMilestones: [...new Set(recentMilestones)] // Remove duplicates
    })
  } catch (error) {
    console.error("Error fetching milestones:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}