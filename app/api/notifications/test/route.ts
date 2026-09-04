import { NextResponse } from "next/server"

import { getApiSession, serverError, unauthorized } from "@/lib/api-utils"
import { isPushConfigured, sendToAll } from "@/lib/notifications/push"

/**
 * Send a real push to every registered device.
 *
 * This is the only honest way to test the feature end to end: it exercises the
 * VAPID keys, the stored subscription and the service worker's push handler,
 * rather than showing a local notification that would work even with push
 * completely broken.
 */
export async function POST() {
  try {
    const session = await getApiSession()
    if (!session) return unauthorized()

    if (!isPushConfigured) {
      return NextResponse.json(
        { error: "Push is not configured on this server (VAPID keys missing)." },
        { status: 503 }
      )
    }

    const result = await sendToAll({
      title: "SurvTrack test",
      body: "Push notifications are working. You can close the app and still get these.",
      url: "/dashboard",
      tag: "test-notification",
    })

    if (result.sent === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            result.removed > 0
              ? "The stored subscription had expired. Enable notifications again."
              : "No device is subscribed yet. Enable notifications first.",
          ...result,
        },
        { status: 409 }
      )
    }

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return serverError("send test push", error)
  }
}
