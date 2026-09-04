import { prisma } from "@/lib/prisma"

import { deriveNotifications, type NotificationEvent } from "./events"

/**
 * Read/dismissed state for derived notifications, stored in MongoDB.
 *
 * The previous implementation kept this in a module-level `Map` guarded by
 * `typeof window !== 'undefined'`. Because it was only ever imported from route
 * handlers, that check was always false on the server, so both the load and
 * save paths were dead code: marking something read returned `{success:true}`
 * and changed nothing that outlived the process.
 */

export type NotificationWithState = NotificationEvent & {
  read: boolean
}

/** Derived notifications, minus dismissed ones, with read state applied. */
export async function getVisibleNotifications(limit = 20): Promise<NotificationWithState[]> {
  const events = await deriveNotifications()
  if (events.length === 0) return []

  const states = await prisma.notificationState.findMany({
    where: { key: { in: events.map((event) => event.id) } },
    select: { key: true, read: true, dismissed: true },
  })

  const byKey = new Map(states.map((state) => [state.key, state]))

  return events
    .filter((event) => !byKey.get(event.id)?.dismissed)
    .map((event) => ({ ...event, read: byKey.get(event.id)?.read ?? false }))
    .slice(0, limit)
}

export async function countUnread(): Promise<number> {
  const visible = await getVisibleNotifications(100)
  return visible.filter((notification) => !notification.read).length
}

/**
 * Mark one notification read.
 *
 * Upserts on `key` because the state row only comes into existence the first
 * time the user touches a notification — there is no row to update before that.
 */
export async function markRead(key: string): Promise<void> {
  const now = new Date()

  await prisma.notificationState.upsert({
    where: { key },
    create: { key, read: true, readAt: now },
    update: { read: true, readAt: now },
  })
}

/**
 * Mark every currently visible notification read.
 *
 * The keys are derived from live data rather than accepted from the client.
 * The old route fell back to a hardcoded list of ids pinned to February 2026
 * when no body was sent, then reported `markedCount: 25` having matched
 * nothing real.
 */
export async function markAllRead(): Promise<number> {
  const visible = await getVisibleNotifications(100)
  const unread = visible.filter((notification) => !notification.read)

  for (const notification of unread) {
    await markRead(notification.id)
  }

  return unread.length
}

/** Hide a notification. It stays hidden even though the event still derives. */
export async function dismiss(key: string): Promise<void> {
  await prisma.notificationState.upsert({
    where: { key },
    create: { key, dismissed: true, read: true, readAt: new Date() },
    update: { dismissed: true },
  })
}

/**
 * Drop state rows whose notification can no longer be produced.
 *
 * Without this the collection grows one row per notification ever seen. The
 * previous cleanup route called `deleteMany` on the unused `Notification`
 * model, so it always reported zero deletions.
 */
export async function pruneOrphanedState(): Promise<number> {
  const [events, states] = await Promise.all([
    deriveNotifications(),
    prisma.notificationState.findMany({ select: { id: true, key: true, updatedAt: true } }),
  ])

  const liveKeys = new Set(events.map((event) => event.id))
  // Keep recent rows even when the event is not currently deriving: a goal
  // notification stops deriving the moment the day rolls over, and deleting
  // its state immediately would make it reappear as unread.
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const orphaned = states.filter(
    (state) => !liveKeys.has(state.key) && state.updatedAt < cutoff
  )

  if (orphaned.length === 0) return 0

  const result = await prisma.notificationState.deleteMany({
    where: { id: { in: orphaned.map((state) => state.id) } },
  })

  return result.count
}
