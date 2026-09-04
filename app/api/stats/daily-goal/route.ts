import { NextResponse } from "next/server"

import { badRequest, getApiSession, serverError, unauthorized } from "@/lib/api-utils"
import { dayRange, isDateKey, todayKey } from "@/lib/date-utils"
import { prisma } from "@/lib/prisma"

const DEFAULT_DAILY_GOAL = 2000

export async function GET(request: Request) {
  try {
    const session = await getApiSession()
    if (!session) return unauthorized()

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")

    // `new Date(dateParam)` used to accept anything; "?date=abc" produced an
    // Invalid Date that reached Prisma as a filter and threw a 500.
    if (dateParam && !isDateKey(dateParam)) {
      return badRequest("date must be in YYYY-MM-DD format")
    }

    const targetDate = dateParam ?? todayKey()

    const todayEntries = await prisma.dailyEntry.findMany({
      where: { date: dayRange(targetDate) },
      select: { points: true },
    })

    const todayPoints = todayEntries.reduce((sum, entry) => sum + entry.points, 0)

    const userSettings = await prisma.userSettings.findFirst()
    const dailyGoalPoints = userSettings?.dailyGoalPoints ?? DEFAULT_DAILY_GOAL

    return NextResponse.json({
      todayPoints,
      goalPoints: dailyGoalPoints,
      achieved: todayPoints >= dailyGoalPoints,
      progress: dailyGoalPoints > 0 ? Math.min((todayPoints / dailyGoalPoints) * 100, 100) : 0,
      date: targetDate,
    })
  } catch (error) {
    return serverError("daily-goal", error)
  }
}
