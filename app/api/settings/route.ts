import { NextResponse } from "next/server"

import { badRequest, getApiSession, serverError, unauthorized } from "@/lib/api-utils"
import { getSettings, updateSettings } from "@/lib/settings"
import { parseBody, userSettingsSchema } from "@/lib/validation"

export async function GET() {
  try {
    const session = await getApiSession()
    if (!session) return unauthorized()

    return NextResponse.json(await getSettings())
  } catch (error) {
    return serverError("get settings", error)
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getApiSession()
    if (!session) return unauthorized()

    const body = await request.json().catch(() => null)

    // Every field is validated now, not just dailyGoalPoints. The old code
    // range-checked one number and passed the rest straight to Prisma, so
    // `"abc"` slipped through (NaN comparisons are always false), threw inside
    // the update, and the catch below turned that into a fabricated 200.
    const parsed = parseBody(userSettingsSchema, body)
    if (!parsed.ok) return badRequest(parsed.error)

    // A failed write now surfaces as a 500 instead of echoing the submitted
    // values back as though they had been saved.
    return NextResponse.json(await updateSettings(parsed.data))
  } catch (error) {
    return serverError("update settings", error)
  }
}
