import { NextResponse } from "next/server"
import { z } from "zod"

import { badRequest, getApiSession, serverError, unauthorized } from "@/lib/api-utils"
import { pointsToDollars } from "@/lib/money"
import { getSettings, updateSettings } from "@/lib/settings"
import { formatZodError } from "@/lib/validation"

/**
 * The monthly target used to live in a module-level `Map`, so it vanished on
 * every redeploy and differed between instances. It is the same value as
 * `UserSettings.monthlyGoalPoints`, so it is stored there now.
 *
 * `earnings` is not stored — it is always points at 100 to the dollar, and
 * keeping a second copy invites the two drifting apart.
 */

const targetSchema = z.object({
  points: z.coerce.number().int().min(1000).max(1_000_000),
})

export async function GET() {
  try {
    const session = await getApiSession()
    if (!session) return unauthorized()

    const settings = await getSettings()

    return NextResponse.json({
      points: settings.monthlyGoalPoints,
      earnings: pointsToDollars(settings.monthlyGoalPoints),
      lastUpdated: settings.updatedAt,
    })
  } catch (error) {
    return serverError("get monthly target", error)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getApiSession()
    if (!session) return unauthorized()

    const body = await request.json().catch(() => null)
    const parsed = targetSchema.safeParse(body)

    if (!parsed.success) {
      return badRequest(formatZodError(parsed.error))
    }

    const settings = await updateSettings({ monthlyGoalPoints: parsed.data.points })

    return NextResponse.json({
      success: true,
      target: {
        points: settings.monthlyGoalPoints,
        earnings: pointsToDollars(settings.monthlyGoalPoints),
        lastUpdated: settings.updatedAt,
      },
    })
  } catch (error) {
    return serverError("save monthly target", error)
  }
}
