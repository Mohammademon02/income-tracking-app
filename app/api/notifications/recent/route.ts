import { NextResponse } from "next/server"

import { getApiSession, serverError, unauthorized } from "@/lib/api-utils"
import { getVisibleNotifications } from "@/lib/notifications/state"
import { getSettings } from "@/lib/settings"

export async function GET() {
  try {
    const session = await getApiSession()
    if (!session) return unauthorized()

    const settings = await getSettings()

    // The old route computed `notificationsEnabled` and then never read it, so
    // notifications kept arriving after the user switched them off.
    if (!settings.notificationsEnabled) {
      return NextResponse.json({ notifications: [], unreadCount: 0, enabled: false })
    }

    const notifications = await getVisibleNotifications(20)

    return NextResponse.json({
      notifications,
      unreadCount: notifications.filter((notification) => !notification.read).length,
      enabled: true,
    })
  } catch (error) {
    return serverError("recent notifications", error)
  }
}
