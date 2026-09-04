import { prisma } from "@/lib/prisma"
import { getSettings } from "@/lib/settings"

import { deriveNotifications } from "./events"
import { isPushConfigured, sendToAll, toPushPayload } from "./push"

/**
 * Push anything that has become true since the last time we looked.
 *
 * There is no scheduler in this app, so pushes are dispatched from the
 * mutations that can create a notification-worthy state: completing a
 * withdrawal, or logging an entry that crosses a goal. Each notification is
 * pushed at most once, tracked by `pushedAt` on its state row.
 *
 * Anything that becomes true purely with the passage of time — a withdrawal
 * crossing the delay threshold, say — is picked up the next time any mutation
 * runs, or by calling this from a cron against a route of your choosing.
 */

/** Only these reach the lock screen. Lower priorities stay in-app. */
const PUSHABLE_PRIORITIES = new Set(["HIGH", "MEDIUM"])

export type DispatchResult = {
  considered: number
  pushed: number
  skipped: string
}

export async function dispatchNewNotifications(): Promise<DispatchResult> {
  if (!isPushConfigured) {
    return { considered: 0, pushed: 0, skipped: "push not configured" }
  }

  const settings = await getSettings()
  if (!settings.notificationsEnabled || !settings.pushNotifications) {
    return { considered: 0, pushed: 0, skipped: "disabled in settings" }
  }

  const events = (await deriveNotifications()).filter((event) =>
    PUSHABLE_PRIORITIES.has(event.priority)
  )

  if (events.length === 0) {
    return { considered: 0, pushed: 0, skipped: "" }
  }

  const states = await prisma.notificationState.findMany({
    where: { key: { in: events.map((event) => event.id) } },
    select: { key: true, pushedAt: true, dismissed: true },
  })

  const byKey = new Map(states.map((state) => [state.key, state]))

  const unsent = events.filter((event) => {
    const state = byKey.get(event.id)
    return !state?.pushedAt && !state?.dismissed
  })

  let pushed = 0

  for (const event of unsent) {
    const result = await sendToAll(toPushPayload(event))

    // Mark it sent even when no device was subscribed. Otherwise the backlog
    // would all fire at once the moment the first device subscribes, which is
    // not what the user asked for.
    await prisma.notificationState.upsert({
      where: { key: event.id },
      create: { key: event.id, pushedAt: new Date() },
      update: { pushedAt: new Date() },
    })

    if (result.sent > 0) pushed += 1
  }

  return { considered: unsent.length, pushed, skipped: "" }
}

/**
 * Run a dispatch without letting it break the caller.
 *
 * Mutations call this after they have already committed. A push service being
 * slow or unreachable must not turn a saved withdrawal into an error the user
 * sees, so failures are logged and swallowed here rather than propagating.
 */
export async function dispatchQuietly(): Promise<void> {
  try {
    await dispatchNewNotifications()
  } catch (error) {
    console.error("[push] dispatch failed:", error)
  }
}
