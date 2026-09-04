import { NextResponse } from "next/server"

import { getApiSession, serverError, unauthorized } from "@/lib/api-utils"
import {
  addDays,
  businessDaysBetween,
  hourInTimeZone,
  isWeekend,
  lastNDays,
  toDateKey,
  todayKey,
} from "@/lib/date-utils"
import { computeBalance, formatDollars, formatPoints, pointsToDollars } from "@/lib/money"
import { prisma } from "@/lib/prisma"

interface Insight {
  id: string
  type: "opportunity" | "warning" | "achievement" | "tip"
  title: string
  description: string
  action?: {
    label: string
    url: string
  }
  priority: "high" | "medium" | "low"
  impact: string
}

/** A withdrawal is flagged once it has been pending this many business days. */
const WITHDRAWAL_DELAY_THRESHOLD = 15
/** Points at which an account is worth withdrawing from ($25). */
const WITHDRAWAL_READY_THRESHOLD = 2500

export async function GET() {
  try {
    const session = await getApiSession()
    if (!session) return unauthorized()

    const insights: Insight[] = []
    const today = todayKey()
    const last7 = lastNDays(7, today)
    const last30 = lastNDays(30, today)

    const [
      accounts,
      lifetimePointsByAccount,
      withdrawalDollarsByAccount,
      recentEntries,
      pendingWithdrawals,
      last30Entries,
    ] = await Promise.all([
      prisma.account.findMany({ select: { id: true, name: true } }),
      prisma.dailyEntry.groupBy({
        by: ["accountId"],
        _sum: { points: true },
      }),
      prisma.withdrawal.groupBy({
        by: ["accountId", "status"],
        _sum: { amount: true },
      }),
      prisma.dailyEntry.findMany({
        where: { date: last7 },
        select: { points: true, date: true },
        orderBy: { date: "desc" },
      }),
      prisma.withdrawal.findMany({
        where: { status: "PENDING" },
        include: { account: { select: { name: true } } },
        orderBy: { date: "asc" },
      }),
      prisma.dailyEntry.findMany({
        where: { date: last30 },
        select: { points: true, date: true, createdAt: true },
      }),
    ])

    // 1. Withdrawals that have been pending too long
    for (const withdrawal of pendingWithdrawals) {
      const daysWaiting = businessDaysBetween(toDateKey(withdrawal.date), today)

      if (daysWaiting > WITHDRAWAL_DELAY_THRESHOLD) {
        insights.push({
          id: `withdrawal-delay-${withdrawal.id}`,
          type: "warning",
          title: "Withdrawal Delay Alert",
          description: `Your ${withdrawal.account.name} withdrawal of ${formatDollars(withdrawal.amount)} has been pending for ${daysWaiting} business days.`,
          action: { label: "Check Status", url: "/withdrawals" },
          priority: "high",
          impact: `${formatDollars(withdrawal.amount)} at risk`,
        })
      }
    }

    // 2. Account diversification opportunity
    if (accounts.length < 3) {
      insights.push({
        id: "account-diversification",
        type: "tip",
        title: "Account Diversification",
        description: `You have ${accounts.length} account${accounts.length === 1 ? "" : "s"}. Tracking more accounts spreads out slow payouts.`,
        action: { label: "Add Account", url: "/accounts" },
        priority: "medium",
        impact: "More payout sources",
      })
    }

    // 3. Streak achievement
    const activeDates = new Set(last30Entries.map((entry) => toDateKey(entry.date)))

    let streakDays = 0
    let cursor = today
    for (let i = 0; i < 30; i++) {
      if (!activeDates.has(cursor)) break
      streakDays += 1
      cursor = addDays(cursor, -1)
    }

    if (streakDays >= 7) {
      insights.push({
        id: "streak-achievement",
        type: "achievement",
        title: "Consistency Achievement",
        description: `You've logged earnings ${streakDays} days in a row. Keep it going.`,
        priority: "medium",
        impact: `${streakDays}-day streak`,
      })
    }

    // 4. Weekday versus weekend
    const weekdayPoints: number[] = []
    const weekendPoints: number[] = []

    for (const entry of recentEntries) {
      // UTC day-of-week: these are date markers, not instants.
      if (isWeekend(entry.date)) weekendPoints.push(entry.points)
      else weekdayPoints.push(entry.points)
    }

    if (weekdayPoints.length > 0 && weekendPoints.length > 0) {
      const avgWeekday = average(weekdayPoints)
      const avgWeekend = average(weekendPoints)

      if (avgWeekday > avgWeekend * 1.3) {
        const potentialIncrease = (avgWeekday - avgWeekend) * 2 // two weekend days
        insights.push({
          id: "weekend-opportunity",
          type: "opportunity",
          title: "Weekend Earnings Gap",
          description: `Your weekday earnings average ${formatPoints(avgWeekday)} points versus ${formatPoints(avgWeekend)} on weekends.`,
          priority: "low",
          impact: `${formatDollars(pointsToDollars(potentialIncrease))}/weekend potential`,
        })
      }
    }

    // 5. Accounts with enough balance to withdraw
    //
    // This used to subtract all-time pending withdrawals from only the last 30
    // days of points, which drove established accounts deeply negative and
    // suppressed the insight entirely. It now uses the same lifetime balance
    // definition as every other screen.
    const completedByAccount = new Map<string, number>()
    const pendingByAccount = new Map<string, number>()
    for (const row of withdrawalDollarsByAccount) {
      const target = row.status === "COMPLETED" ? completedByAccount : pendingByAccount
      target.set(row.accountId, row._sum.amount ?? 0)
    }

    const pointsByAccount = new Map(
      lifetimePointsByAccount.map((row) => [row.accountId, row._sum.points ?? 0])
    )

    for (const account of accounts) {
      const balance = computeBalance({
        lifetimePoints: pointsByAccount.get(account.id) ?? 0,
        completedDollars: completedByAccount.get(account.id) ?? 0,
        pendingDollars: pendingByAccount.get(account.id) ?? 0,
      })

      if (balance.availablePoints >= WITHDRAWAL_READY_THRESHOLD) {
        insights.push({
          id: `withdrawal-ready-${account.id}`,
          type: "opportunity",
          title: "Withdrawal Ready",
          description: `Your ${account.name} account has ${formatPoints(balance.availablePoints)} points (${formatDollars(pointsToDollars(balance.availablePoints))}) available to withdraw.`,
          action: { label: "Request Withdrawal", url: "/withdrawals" },
          priority: "medium",
          impact: `${formatDollars(pointsToDollars(balance.availablePoints))} available`,
        })
      }
    }

    // 6. Low activity warning
    const activeDaysInWeek = new Set(recentEntries.map((entry) => toDateKey(entry.date))).size

    if (activeDaysInWeek < 3 && recentEntries.length > 0) {
      insights.push({
        id: "low-activity-warning",
        type: "tip",
        title: "Increase Activity",
        description: `You've logged earnings on ${activeDaysInWeek} of the last 7 days.`,
        priority: "medium",
        impact: "Consistency drives totals",
      })
    }

    // 7. Peak earning hour
    //
    // `createdAt` is a real instant, so the hour is read in the app's business
    // timezone rather than whatever timezone the server happens to run in.
    if (last30Entries.length >= 10) {
      const hourlyTotals = new Map<number, number>()
      for (const entry of last30Entries) {
        const hour = hourInTimeZone(entry.createdAt)
        hourlyTotals.set(hour, (hourlyTotals.get(hour) ?? 0) + entry.points)
      }

      if (hourlyTotals.size >= 3) {
        const sortedHours = [...hourlyTotals.entries()].sort((a, b) => b[1] - a[1])
        const [bestHour, bestPoints] = sortedHours[0]
        const avgOtherHours = average(sortedHours.slice(1).map(([, points]) => points))

        if (avgOtherHours > 0 && bestPoints > avgOtherHours * 1.5) {
          insights.push({
            id: "peak-time-optimization",
            type: "opportunity",
            title: "Optimize Your Peak Hours",
            description: `You log noticeably more around ${formatHour(bestHour)}. Consider focusing your survey time there.`,
            priority: "medium",
            impact: `+${Math.round(((bestPoints - avgOtherHours) / avgOtherHours) * 100)}% in that hour`,
          })
        }
      }
    }

    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const sortedInsights = [...insights]
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 8)

    return NextResponse.json(sortedInsights)
  } catch (error) {
    return serverError("generate insights", error)
  }
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM"
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return "12 PM"
  return `${hour - 12} PM`
}
