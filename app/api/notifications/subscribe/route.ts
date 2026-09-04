import { NextResponse } from "next/server"
import { z } from "zod"

import { badRequest, getApiSession, serverError, unauthorized } from "@/lib/api-utils"
import { isPushConfigured, saveSubscription } from "@/lib/notifications/push"
import { formatZodError } from "@/lib/validation"

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})

const bodySchema = z.object({
  subscription: subscriptionSchema,
})

export async function POST(request: Request) {
  try {
    const session = await getApiSession()
    if (!session) return unauthorized()

    // Say so rather than claiming success, which is what this route used to do
    // for a feature that had no keys, no storage and no sender behind it.
    if (!isPushConfigured) {
      return NextResponse.json(
        { error: "Push is not configured on this server (VAPID keys missing)." },
        { status: 503 }
      )
    }

    const body = await request.json().catch(() => null)
    const parsed = bodySchema.safeParse(body)

    if (!parsed.success) {
      return badRequest(formatZodError(parsed.error))
    }

    await saveSubscription(parsed.data.subscription, request.headers.get("user-agent"))

    return NextResponse.json({ success: true })
  } catch (error) {
    return serverError("save push subscription", error)
  }
}
