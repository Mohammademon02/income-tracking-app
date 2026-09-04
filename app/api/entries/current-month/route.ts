import { NextResponse } from "next/server"

import { getApiSession, serverError, unauthorized } from "@/lib/api-utils"
import { monthRangeOf, todayKey } from "@/lib/date-utils"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getApiSession()
    if (!session) return unauthorized()

    const entries = await prisma.dailyEntry.findMany({
      where: { date: monthRangeOf(todayKey()) },
      select: {
        points: true,
        date: true,
      },
      orderBy: { date: "asc" },
    })

    return NextResponse.json(entries)
  } catch (error) {
    return serverError("current-month entries", error)
  }
}
