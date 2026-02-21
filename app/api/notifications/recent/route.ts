import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface Notification {
  id: string
  type: 'withdrawal' | 'milestone' | 'goal' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  priority: 'low' | 'medium' | 'high'
}

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notifications: Notification[] = []
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Check for recent withdrawal completions
    const recentCompletedWithdrawals = await prisma.withdrawal.findMany({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: last24Hours
        }
      },
      include: {
        account: { select: { name: true } }
      },
      orderBy: { completedAt: 'desc' }
    })

    recentCompletedWithdrawals.forEach(withdrawal => {
      if (withdrawal.completedAt) {
        const processingDays = Math.ceil(
          (withdrawal.completedAt.getTime() - withdrawal.date.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        notifications.push({
          id: `withdrawal-completed-${withdrawal.id}`,
          type: 'withdrawal',
          title: 'Withdrawal Approved! 🎉',
          message: `$${withdrawal.amount.toFixed(2)} from ${withdrawal.account.name} processed in ${processingDays} days`,
          timestamp: withdrawal.completedAt,
          read: false,
          actionUrl: '/withdrawals',
          priority: 'high'
        })
      }
    })

    // Check for milestone achievements (recent entries that crossed thresholds)
    const milestones = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000]
    const recentEntries = await prisma.dailyEntry.findMany({
      where: {
        createdAt: { gte: last24Hours }
      },
      orderBy: { createdAt: 'asc' }
    })

    if (recentEntries.length > 0) {
      // Get total points before recent entries
      const allEntries = await prisma.dailyEntry.findMany({
        select: { points: true, createdAt: true },
        orderBy: { createdAt: 'asc' }
      })

      const totalPoints = allEntries.reduce((sum, entry) => sum + entry.points, 0)
      const recentPoints = recentEntries.reduce((sum, entry) => sum + entry.points, 0)
      const pointsBeforeRecent = totalPoints - recentPoints

      let runningTotal = pointsBeforeRecent
      const achievedMilestones: number[] = []

      recentEntries.forEach(entry => {
        const previousTotal = runningTotal
        runningTotal += entry.points

        milestones.forEach(milestone => {
          if (previousTotal < milestone && runningTotal >= milestone) {
            achievedMilestones.push(milestone)
          }
        })
      })

      achievedMilestones.forEach(milestone => {
        const nextMilestone = milestones.find(m => m > milestone) || milestone * 2
        notifications.push({
          id: `milestone-${milestone}`,
          type: 'milestone',
          title: 'Milestone Reached! 🎯',
          message: `You've earned ${milestone.toLocaleString()} points total! Next: ${nextMilestone.toLocaleString()} pts`,
          timestamp: recentEntries[recentEntries.length - 1].createdAt,
          read: false,
          priority: 'medium'
        })
      })
    }

    // Check for daily goal achievements
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

    const todayEntries = await prisma.dailyEntry.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    const todayPoints = todayEntries.reduce((sum, entry) => sum + entry.points, 0)
    const dailyGoal = 2000 // 2000 points = $20

    if (todayPoints >= dailyGoal) {
      // Check if we already notified about today's goal
      const hasGoalNotification = notifications.some(n => 
        n.type === 'goal' && 
        n.timestamp.toDateString() === now.toDateString()
      )

      if (!hasGoalNotification) {
        notifications.push({
          id: `daily-goal-${today.toISOString().split('T')[0]}`,
          type: 'goal',
          title: 'Daily Goal Achieved! 🌟',
          message: `${todayPoints.toLocaleString()} / ${dailyGoal.toLocaleString()} points earned today ($${(todayPoints / 100).toFixed(2)})`,
          timestamp: now,
          read: false,
          priority: 'medium'
        })
      }
    }

    // Check for delayed withdrawals
    const pendingWithdrawals = await prisma.withdrawal.findMany({
      where: {
        status: 'PENDING',
        date: {
          lt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
        }
      },
      include: {
        account: { select: { name: true } }
      }
    })

    pendingWithdrawals.forEach(withdrawal => {
      const daysWaiting = Math.ceil(
        (now.getTime() - withdrawal.date.getTime()) / (1000 * 60 * 60 * 24)
      )

      notifications.push({
        id: `withdrawal-delayed-${withdrawal.id}`,
        type: 'system',
        title: 'Withdrawal Delay Alert',
        message: `${withdrawal.account.name} withdrawal ($${withdrawal.amount.toFixed(2)}) pending for ${daysWaiting} days`,
        timestamp: withdrawal.date,
        read: false,
        actionUrl: '/withdrawals',
        priority: 'high'
      })
    })

    // Sort by priority and timestamp
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const sortedNotifications = notifications
      .sort((a, b) => {
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })
      .slice(0, 20) // Limit to 20 most recent/important

    return NextResponse.json(sortedNotifications)

  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}