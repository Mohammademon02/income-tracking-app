"use server"

import { formatDate, monthRange, todayKey } from "@/lib/date-utils"
import { sumDollarsAsPoints } from "@/lib/money"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/server-utils"

export async function getMonthlyStats(year?: number, month?: number) {
  await requireSession()

  // "Which month is it" is answered in the app's business timezone, not the
  // server's — see lib/date-utils. Building the range with local-time helpers
  // is what used to push the 1st of the month out of its own month and pull
  // the next month's 1st in.
  const today = todayKey()
  const [currentYear, currentMonth] = today.split("-").map(Number)

  const targetYear = year || currentYear
  const targetMonth = month || currentMonth

  const range = monthRange(targetYear, targetMonth)

  const [monthlyEntries, monthlyCompletedWithdrawals] = await Promise.all([
    prisma.dailyEntry.findMany({
      where: { date: range },
      include: {
        account: {
          select: {
            name: true,
            color: true,
          },
        },
      },
      orderBy: { date: "asc" },
    }),
    prisma.withdrawal.findMany({
      where: {
        status: "COMPLETED",
        completedAt: range,
      },
      include: {
        account: {
          select: {
            name: true,
            color: true,
          },
        },
      },
      orderBy: { completedAt: "asc" },
    }),
  ])

  const totalMonthlyPoints = monthlyEntries.reduce((sum, entry) => sum + entry.points, 0)

  const totalMonthlyWithdrawals = monthlyCompletedWithdrawals.reduce(
    (sum, withdrawal) => sum + withdrawal.amount,
    0,
  )

  return {
    month: targetMonth,
    year: targetYear,
    monthName: formatDate(range.gte, { month: "long" }),
    totalPoints: totalMonthlyPoints,
    totalWithdrawals: totalMonthlyWithdrawals,
    /** The same payout expressed in points, rounded once. */
    totalWithdrawalPoints: sumDollarsAsPoints(
      monthlyCompletedWithdrawals.map((withdrawal) => withdrawal.amount),
    ),
    entriesCount: monthlyEntries.length,
    withdrawalsCount: monthlyCompletedWithdrawals.length,
    entries: monthlyEntries.map((entry) => ({
      id: entry.id,
      date: entry.date,
      points: entry.points,
      accountName: entry.account.name,
      accountColor: entry.account.color || "blue",
    })),
    withdrawals: monthlyCompletedWithdrawals.map((withdrawal) => ({
      id: withdrawal.id,
      date: withdrawal.date,
      completedAt: withdrawal.completedAt,
      amount: withdrawal.amount,
      accountName: withdrawal.account.name,
      accountColor: withdrawal.account.color || "blue",
    })),
  }
}
