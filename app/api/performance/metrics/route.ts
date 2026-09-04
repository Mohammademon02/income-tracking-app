import { NextResponse } from "next/server"

import { getApiSession, serverError, unauthorized } from "@/lib/api-utils"
import {
  addDays,
  daysElapsedInMonth,
  lastNDays,
  monthRangeOf,
  toDateKey,
  todayKey,
} from "@/lib/date-utils"
import { prisma } from "@/lib/prisma"
import { getSettings } from "@/lib/settings"

const STREAK_LOOKBACK_DAYS = 30
const CONSISTENCY_TARGET_DAYS = 7

export async function GET() {
  try {
    const session = await getApiSession()
    if (!session) return unauthorized()

    const today = todayKey()

    // Two 7-day windows that do not overlap and are both closed at the top.
    // The previous version compared `>= lastWeek` (7 days plus today plus any
    // future-dated rows) against an exactly-7-day window, which gave the
    // weekly trend a permanent upward bias.
    const thisWeek = lastNDays(7, today)
    const previousWeek = lastNDays(7, addDays(today, -7))

    const [dailyTotals, accountTotals, thisMonthAgg, thisWeekAgg, previousWeekAgg, settings] =
      await Promise.all([
        // One row per date, rather than every entry — enough for the streak,
        // the 30-day average and the active-day count.
        prisma.dailyEntry.groupBy({
          by: ["date"],
          _sum: { points: true },
          orderBy: { date: "desc" },
        }),
        prisma.dailyEntry.groupBy({
          by: ["accountId"],
          _sum: { points: true },
        }),
        prisma.dailyEntry.aggregate({
          where: { date: monthRangeOf(today) },
          _sum: { points: true },
        }),
        prisma.dailyEntry.aggregate({
          where: { date: thisWeek },
          _sum: { points: true },
        }),
        prisma.dailyEntry.aggregate({
          where: { date: previousWeek },
          _sum: { points: true },
        }),
        getSettings(),
      ])

    /** Points keyed by calendar date, newest first. */
    const totalsByDate = new Map(
      dailyTotals.map((row) => [toDateKey(row.date), row._sum.points ?? 0])
    )

    // --- Daily average over the last 30 days ------------------------------
    const window = lastNDays(30, today)
    const windowStartKey = toDateKey(window.gte)

    let pointsInWindow = 0
    let activeDaysInWindow = 0
    for (const [dateKey, points] of totalsByDate) {
      if (dateKey >= windowStartKey && dateKey <= today) {
        pointsInWindow += points
        activeDaysInWindow += 1
      }
    }

    // Divide by the days the user has actually been tracking, capped at the
    // window. Always dividing by 30 made a brand-new account with three good
    // days look like it was averaging almost nothing.
    const earliestKey = dailyTotals.length
      ? toDateKey(dailyTotals[dailyTotals.length - 1].date)
      : null
    const daysTracked = earliestKey
      ? Math.min(30, Math.max(1, daySpan(maxKey(earliestKey, windowStartKey), today)))
      : 0
    const dailyAverage = daysTracked > 0 ? Math.round(pointsInWindow / daysTracked) : 0

    // --- Weekly trend ------------------------------------------------------
    const thisWeekTotal = thisWeekAgg._sum.points ?? 0
    const previousWeekTotal = previousWeekAgg._sum.points ?? 0
    const weeklyTrend =
      previousWeekTotal > 0
        ? ((thisWeekTotal - previousWeekTotal) / previousWeekTotal) * 100
        : 0

    // --- Monthly goal ------------------------------------------------------
    // Read from settings instead of the hardcoded 14000 that used to sit here,
    // which matched neither the schema default (60000) nor whatever the user
    // had configured — so this number and the dashboard disagreed.
    const monthlyGoal = settings.monthlyGoalPoints
    const thisMonthTotal = thisMonthAgg._sum.points ?? 0
    const monthlyGoalProgress =
      monthlyGoal > 0 ? Math.min((thisMonthTotal / monthlyGoal) * 100, 100) : 0

    // --- Streak ------------------------------------------------------------
    let streakDays = 0
    let cursor = today
    for (let i = 0; i < STREAK_LOOKBACK_DAYS; i++) {
      if (!totalsByDate.has(cursor)) break
      streakDays += 1
      cursor = addDays(cursor, -1)
    }

    // --- Top performing account -------------------------------------------
    // "Performing" means points earned, so this is lifetime points and not the
    // available balance — a different question with a different answer.
    let topPerformingAccount = "No accounts"
    if (accountTotals.length > 0) {
      const best = accountTotals.reduce((max, row) =>
        (row._sum.points ?? 0) > (max._sum.points ?? 0) ? row : max
      )
      const account = await prisma.account.findUnique({
        where: { id: best.accountId },
        select: { name: true },
      })
      topPerformingAccount = account?.name ?? "No accounts"
    }

    // --- Efficiency --------------------------------------------------------
    const consistencyScore = Math.min((streakDays / CONSISTENCY_TARGET_DAYS) * 100, 100)
    const activityScore =
      daysTracked > 0 ? Math.min((activeDaysInWindow / daysTracked) * 100, 100) : 0
    const efficiency = Math.round((consistencyScore + monthlyGoalProgress + activityScore) / 3)

    return NextResponse.json({
      dailyAverage,
      weeklyTrend: Math.round(weeklyTrend * 10) / 10,
      monthlyGoalProgress: Math.round(monthlyGoalProgress),
      monthlyGoal,
      thisMonthPoints: thisMonthTotal,
      daysElapsedThisMonth: daysElapsedInMonth(today),
      streakDays,
      topPerformingAccount,
      efficiency,
    })
  } catch (error) {
    // A failure is reported as a failure. Returning zeros here, as this used
    // to, renders a database outage as "you earned nothing".
    return serverError("performance metrics", error)
  }
}

/** Inclusive day count between two calendar dates. */
function daySpan(from: string, to: string): number {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)
  return Math.round(ms / (24 * 60 * 60 * 1000)) + 1
}

function maxKey(a: string, b: string): string {
  return a > b ? a : b
}
