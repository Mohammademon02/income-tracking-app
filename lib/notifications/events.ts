import {
  businessDaysBetween,
  formatDate,
  monthRangeOf,
  dayRange,
  toDateKey,
  todayKey,
} from "@/lib/date-utils"
import { formatDollars, formatPoints, pointsToDollars } from "@/lib/money"
import { prisma } from "@/lib/prisma"
import { getSettings } from "@/lib/settings"

/**
 * Notifications are derived, not stored.
 *
 * Every notification this app shows is a statement about data that already
 * exists — a withdrawal that completed, a goal that was met, a request that has
 * been pending too long. Recomputing them keeps them truthful: if a withdrawal
 * is edited or deleted, its notification changes or disappears with it, which a
 * stored copy would not do.
 *
 * What does need to persist is the user's interaction — read and dismissed —
 * and that hangs off the stable `id` each event carries. See ./state.ts.
 */

export type NotificationType = "WITHDRAWAL" | "GOAL" | "SYSTEM"
export type NotificationPriority = "HIGH" | "MEDIUM" | "LOW"

export type NotificationEvent = {
  /** Stable across requests, so read state can be keyed to it. */
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  actionUrl?: string
  priority: NotificationPriority
}

/** A withdrawal pending longer than this many business days is flagged. */
const DELAY_THRESHOLD_BUSINESS_DAYS = 15
/** How far back completed withdrawals are worth announcing. */
const COMPLETION_WINDOW_HOURS = 48

const PRIORITY_ORDER: Record<NotificationPriority, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
}

/**
 * Build the current set of notifications from the database.
 *
 * Failures propagate. The previous version caught everything and pushed a
 * cheerful "Notification System Ready" card, so an outage looked like an empty
 * inbox.
 */
export async function deriveNotifications(): Promise<NotificationEvent[]> {
  const today = todayKey()
  const now = new Date()
  const completionCutoff = new Date(now.getTime() - COMPLETION_WINDOW_HOURS * 60 * 60 * 1000)

  const [settings, completedWithdrawals, pendingWithdrawals, todayAgg, monthAgg] =
    await Promise.all([
      getSettings(),
      prisma.withdrawal.findMany({
        where: {
          status: "COMPLETED",
          completedAt: { gte: completionCutoff },
        },
        include: { account: { select: { name: true } } },
        orderBy: { completedAt: "desc" },
      }),
      prisma.withdrawal.findMany({
        where: { status: "PENDING" },
        include: { account: { select: { name: true } } },
        orderBy: { date: "asc" },
      }),
      prisma.dailyEntry.aggregate({
        where: { date: dayRange(today) },
        _sum: { points: true },
      }),
      prisma.dailyEntry.aggregate({
        where: { date: monthRangeOf(today) },
        _sum: { points: true },
      }),
    ])

  const events: NotificationEvent[] = []

  // --- Completed withdrawals ---------------------------------------------
  for (const withdrawal of completedWithdrawals) {
    if (!withdrawal.completedAt) continue

    const days = businessDaysBetween(toDateKey(withdrawal.date), toDateKey(withdrawal.completedAt))

    events.push({
      id: `withdrawal-completed-${withdrawal.id}`,
      type: "WITHDRAWAL",
      title: "Withdrawal completed",
      message: `${formatDollars(withdrawal.amount)} from ${withdrawal.account.name} cleared in ${days} business day${days === 1 ? "" : "s"}.`,
      timestamp: withdrawal.completedAt,
      actionUrl: "/withdrawals",
      priority: "HIGH",
    })
  }

  // --- Withdrawals waiting too long --------------------------------------
  for (const withdrawal of pendingWithdrawals) {
    const daysWaiting = businessDaysBetween(toDateKey(withdrawal.date), today)
    if (daysWaiting <= DELAY_THRESHOLD_BUSINESS_DAYS) continue

    events.push({
      id: `withdrawal-delayed-${withdrawal.id}`,
      type: "WITHDRAWAL",
      title: "Withdrawal delayed",
      message: `${withdrawal.account.name} — ${formatDollars(withdrawal.amount)} has been pending ${daysWaiting} business days.`,
      // Dated to the request so it sorts by how long it has actually waited.
      timestamp: withdrawal.date,
      actionUrl: "/withdrawals",
      priority: "HIGH",
    })
  }

  // --- Goals --------------------------------------------------------------
  // Goals come from settings. They used to be hardcoded here as 2000/15000,
  // which disagreed with both the schema defaults and whatever the user had
  // configured, so a goal card could appear while the dashboard said the goal
  // had not been reached.
  const todayPoints = todayAgg._sum.points ?? 0
  if (settings.dailyGoalPoints > 0 && todayPoints >= settings.dailyGoalPoints) {
    events.push({
      id: `daily-goal-${today}`,
      type: "GOAL",
      title: "Daily goal reached",
      message: `${formatPoints(todayPoints)} of ${formatPoints(settings.dailyGoalPoints)} points today (${formatDollars(pointsToDollars(todayPoints))}).`,
      timestamp: now,
      actionUrl: "/daily-earnings",
      priority: "MEDIUM",
    })
  }

  const monthPoints = monthAgg._sum.points ?? 0
  if (settings.monthlyGoalPoints > 0 && monthPoints >= settings.monthlyGoalPoints) {
    events.push({
      id: `monthly-goal-${today.slice(0, 7)}`,
      type: "GOAL",
      title: "Monthly goal reached",
      message: `${formatPoints(monthPoints)} of ${formatPoints(settings.monthlyGoalPoints)} points in ${formatDate(`${today.slice(0, 7)}-01`, { month: "long", year: "numeric" })} (${formatDollars(pointsToDollars(monthPoints))}).`,
      timestamp: now,
      actionUrl: "/reports",
      priority: "HIGH",
    })
  }

  return sortNotifications(events)
}

/** Highest priority first, then newest first. */
export function sortNotifications(events: NotificationEvent[]): NotificationEvent[] {
  return [...events].sort((a, b) => {
    const byPriority = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]
    if (byPriority !== 0) return byPriority
    return b.timestamp.getTime() - a.timestamp.getTime()
  })
}
