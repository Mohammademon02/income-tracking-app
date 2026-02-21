import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface Insight {
  id: string
  type: 'opportunity' | 'warning' | 'achievement' | 'tip'
  title: string
  description: string
  action?: {
    label: string
    url: string
  }
  priority: 'high' | 'medium' | 'low'
  impact: string
}

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const insights: Insight[] = []

    // Get data for analysis
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      accounts,
      recentEntries,
      pendingWithdrawals,
      allEntries
    ] = await Promise.all([
      prisma.account.findMany({
        include: {
          entries: {
            where: { date: { gte: last30Days } },
            select: { points: true, date: true }
          },
          withdrawals: {
            where: { status: 'PENDING' },
            select: { amount: true, date: true }
          }
        }
      }),
      prisma.dailyEntry.findMany({
        where: { date: { gte: lastWeek } },
        include: { account: { select: { name: true } } },
        orderBy: { date: 'desc' }
      }),
      prisma.withdrawal.findMany({
        where: { status: 'PENDING' },
        include: { account: { select: { name: true } } },
        orderBy: { date: 'asc' }
      }),
      prisma.dailyEntry.findMany({
        where: { date: { gte: last30Days } },
        select: { points: true, date: true, createdAt: true }
      })
    ])

    // 1. Check for withdrawal delays
    const businessDaysAgo = (date: Date) => {
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      // Rough business days calculation (excluding weekends)
      return Math.floor(diffDays * (5/7))
    }

    pendingWithdrawals.forEach(withdrawal => {
      const daysWaiting = businessDaysAgo(withdrawal.date)
      if (daysWaiting > 15) {
        insights.push({
          id: `withdrawal-delay-${withdrawal.id}`,
          type: 'warning',
          title: 'Withdrawal Delay Alert',
          description: `Your ${withdrawal.account.name} withdrawal of $${withdrawal.amount.toFixed(2)} has been pending for ${daysWaiting} business days.`,
          action: {
            label: 'Check Status',
            url: '/withdrawals'
          },
          priority: 'high',
          impact: `$${withdrawal.amount.toFixed(2)} at risk`
        })
      }
    })

    // 2. Account diversification opportunity
    if (accounts.length < 3) {
      insights.push({
        id: 'account-diversification',
        type: 'tip',
        title: 'Account Diversification',
        description: `You have ${accounts.length} account${accounts.length === 1 ? '' : 's'}. Users with 3+ accounts typically earn 40-60% more.`,
        action: {
          label: 'Add Account',
          url: '/accounts'
        },
        priority: 'medium',
        impact: '+40-60% earning potential'
      })
    }

    // 3. Streak achievements
    const dailyTotals = new Map<string, number>()
    allEntries.forEach(entry => {
      const dateKey = entry.date.toISOString().split('T')[0]
      dailyTotals.set(dateKey, (dailyTotals.get(dateKey) || 0) + entry.points)
    })

    let streakDays = 0
    let currentDate = new Date(today)
    
    for (let i = 0; i < 30; i++) {
      const dateKey = currentDate.toISOString().split('T')[0]
      if (dailyTotals.has(dateKey)) {
        streakDays++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    if (streakDays >= 7) {
      insights.push({
        id: 'streak-achievement',
        type: 'achievement',
        title: 'Consistency Milestone',
        description: `Amazing! You've maintained a ${streakDays}-day earning streak. This puts you in the top 20% of users.`,
        priority: 'medium',
        impact: 'Top 20% performer'
      })
    }

    // 4. Weekend vs weekday analysis
    const weekdayPoints: number[] = []
    const weekendPoints: number[] = []

    recentEntries.forEach(entry => {
      const dayOfWeek = new Date(entry.date).getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        weekendPoints.push(entry.points)
      } else {
        weekdayPoints.push(entry.points)
      }
    })

    if (weekdayPoints.length > 0 && weekendPoints.length > 0) {
      const avgWeekday = weekdayPoints.reduce((sum, p) => sum + p, 0) / weekdayPoints.length
      const avgWeekend = weekendPoints.reduce((sum, p) => sum + p, 0) / weekendPoints.length
      
      if (avgWeekday > avgWeekend * 1.3) { // 30% higher on weekdays
        const potentialIncrease = (avgWeekday - avgWeekend) * 2 // 2 weekend days
        insights.push({
          id: 'weekend-opportunity',
          type: 'opportunity',
          title: 'Weekend Earnings Gap',
          description: `Your weekday earnings average ${Math.round(avgWeekday)} points vs ${Math.round(avgWeekend)} points on weekends. Weekend surveys often have higher payouts.`,
          priority: 'low',
          impact: `+$${(potentialIncrease / 100).toFixed(2)}/weekend potential`
        })
      }
    }

    // 5. High balance accounts ready for withdrawal
    accounts.forEach(account => {
      const totalPoints = account.entries.reduce((sum, entry) => sum + entry.points, 0)
      const pendingAmount = account.withdrawals.reduce((sum, w) => sum + w.amount * 100, 0)
      const availableBalance = totalPoints - pendingAmount

      if (availableBalance >= 2500) { // $25 threshold
        insights.push({
          id: `withdrawal-ready-${account.id}`,
          type: 'opportunity',
          title: 'Withdrawal Ready',
          description: `Your ${account.name} account has ${availableBalance.toLocaleString()} points ($${(availableBalance / 100).toFixed(2)}) ready for withdrawal.`,
          action: {
            label: 'Request Withdrawal',
            url: '/withdrawals'
          },
          priority: 'medium',
          impact: `$${(availableBalance / 100).toFixed(2)} available`
        })
      }
    })

    // 6. Low activity warning
    const recentDays = 7
    const activeDaysInWeek = new Set(
      recentEntries.map(entry => entry.date.toISOString().split('T')[0])
    ).size

    if (activeDaysInWeek < 3 && recentEntries.length > 0) {
      insights.push({
        id: 'low-activity-warning',
        type: 'tip',
        title: 'Increase Activity',
        description: `You've been active ${activeDaysInWeek} out of the last ${recentDays} days. Consistent daily activity can increase earnings by 25-40%.`,
        priority: 'medium',
        impact: '+25-40% earning potential'
      })
    }

    // 7. Peak performance time analysis (if we have enough data)
    if (allEntries.length >= 10) {
      const hourlyTotals = new Map<number, number>()
      allEntries.forEach(entry => {
        const hour = new Date(entry.createdAt).getHours()
        hourlyTotals.set(hour, (hourlyTotals.get(hour) || 0) + entry.points)
      })

      if (hourlyTotals.size >= 3) {
        const sortedHours = Array.from(hourlyTotals.entries())
          .sort((a, b) => b[1] - a[1])
        
        const bestHour = sortedHours[0]
        const avgOtherHours = sortedHours.slice(1).reduce((sum, [_, points]) => sum + points, 0) / (sortedHours.length - 1)
        
        if (bestHour[1] > avgOtherHours * 1.5) { // 50% better than average
          const timeStr = bestHour[0] === 0 ? '12 AM' : 
                         bestHour[0] < 12 ? `${bestHour[0]} AM` :
                         bestHour[0] === 12 ? '12 PM' : `${bestHour[0] - 12} PM`
          
          insights.push({
            id: 'peak-time-optimization',
            type: 'opportunity',
            title: 'Optimize Your Peak Hours',
            description: `You earn significantly more around ${timeStr}. Consider focusing your survey time during this period.`,
            priority: 'medium',
            impact: `+${Math.round(((bestHour[1] - avgOtherHours) / avgOtherHours) * 100)}% efficiency`
          })
        }
      }
    }

    // Sort by priority and limit results
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const sortedInsights = insights
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 8) // Limit to 8 insights

    return NextResponse.json(sortedInsights)

  } catch (error) {
    console.error("Error generating insights:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}