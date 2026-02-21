import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get all entries for calculations
    const [
      allEntries,
      thisWeekEntries,
      lastWeekEntries,
      thisMonthEntries,
      accounts
    ] = await Promise.all([
      prisma.dailyEntry.findMany({
        include: { account: { select: { name: true } } },
        orderBy: { date: 'desc' }
      }),
      prisma.dailyEntry.findMany({
        where: { date: { gte: lastWeek } },
        select: { points: true, date: true }
      }),
      prisma.dailyEntry.findMany({
        where: { 
          date: { 
            gte: twoWeeksAgo,
            lt: lastWeek
          }
        },
        select: { points: true }
      }),
      prisma.dailyEntry.findMany({
        where: { date: { gte: monthStart } },
        select: { points: true }
      }),
      prisma.account.findMany({
        include: {
          entries: {
            select: { points: true }
          }
        }
      })
    ])

    // Calculate daily average (last 30 days) - Simple approach
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last30DaysEntries = allEntries.filter(entry => 
      new Date(entry.date) >= last30Days
    )
    
    // Simple calculation: Total points in last 30 days ÷ 30
    const totalPointsLast30Days = last30DaysEntries.reduce((sum, entry) => sum + entry.points, 0)
    const dailyAverage = Math.round(totalPointsLast30Days / 30)
    
    // Calculate active days for efficiency calculation
    const activeDaysInLast30 = new Set(
      last30DaysEntries.map(entry => entry.date.toISOString().split('T')[0])
    ).size
    
    console.log('Daily Average Calculation:', {
      totalPointsLast30Days,
      dailyAverage,
      entriesCount: last30DaysEntries.length,
      activeDaysInLast30
    })

    // Calculate weekly trend
    const thisWeekTotal = thisWeekEntries.reduce((sum, entry) => sum + entry.points, 0)
    const lastWeekTotal = lastWeekEntries.reduce((sum, entry) => sum + entry.points, 0)
    const weeklyTrend = lastWeekTotal > 0 
      ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100
      : 0

    // Calculate monthly goal progress (default target, can be customized in settings)
    const monthlyGoal = 14000 // This will be overridden by frontend with user's custom target
    const thisMonthTotal = thisMonthEntries.reduce((sum, entry) => sum + entry.points, 0)
    const monthlyGoalProgress = Math.min((thisMonthTotal / monthlyGoal) * 100, 100)

    // Calculate streak days
    const sortedEntries = allEntries.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    let streakDays = 0
    let currentDate = new Date(today)
    
    for (let i = 0; i < 30; i++) { // Check last 30 days max
      const dateKey = currentDate.toISOString().split('T')[0]
      const hasEntry = sortedEntries.some(entry => 
        entry.date.toISOString().split('T')[0] === dateKey
      )
      
      if (hasEntry) {
        streakDays++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    // Find top performing account
    const accountTotals = accounts.map(account => ({
      name: account.name,
      total: account.entries.reduce((sum, entry) => sum + entry.points, 0)
    }))
    
    const topPerformingAccount = accountTotals.length > 0
      ? accountTotals.reduce((max, account) => 
          account.total > max.total ? account : max
        ).name
      : "No accounts"

    // Calculate efficiency score (based on consistency, goal achievement, etc.)
    const consistencyScore = Math.min((streakDays / 7) * 100, 100) // Max 7 days for full score
    const goalScore = monthlyGoalProgress
    
    // Calculate activity score based on entries in last 30 days
    const activityScore = Math.min((activeDaysInLast30 / 30) * 100, 100)
    
    const efficiency = Math.round((consistencyScore + goalScore + activityScore) / 3)
    
    console.log('Efficiency Calculation:', {
      consistencyScore,
      goalScore,
      activityScore,
      efficiency,
      streakDays
    })

    return NextResponse.json({
      dailyAverage: dailyAverage,
      weeklyTrend: Math.round(weeklyTrend * 10) / 10, // Round to 1 decimal
      monthlyGoalProgress: Math.round(monthlyGoalProgress),
      streakDays,
      topPerformingAccount,
      efficiency
    })

  } catch (error) {
    console.error("Error fetching performance metrics:", error)
    
    // Return default values if there's an error
    return NextResponse.json({
      dailyAverage: 0,
      weeklyTrend: 0,
      monthlyGoalProgress: 0,
      streakDays: 0,
      topPerformingAccount: "No data",
      efficiency: 0
    })
  }
}