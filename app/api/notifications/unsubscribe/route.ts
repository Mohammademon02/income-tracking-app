import { NextResponse } from "next/server"
import { z } from "zod"

import { badRequest, getApiSession, serverError, unauthorized } from "@/lib/api-utils"
import { removeSubscription } from "@/lib/notifications/push"
import { formatZodError } from "@/lib/validation"

const bodySchema = z.object({
  endpoint: z.string().url(),
})

export async function POST(request: Request) {
  try {
    const session = await getApiSession()
    if (!session) return unauthorized()

    const body = await request.json().catch(() => null)
    const parsed = bodySchema.safeParse(body)

    if (!parsed.success) {
      return badRequest(formatZodError(parsed.error))
    }

    const { count } = await removeSubscription(parsed.data.endpoint)

    return NextResponse.json({ success: true, removed: count })
  } catch (error) {
    return serverError("remove push subscription", error)
  }
}
