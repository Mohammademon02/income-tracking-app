import type { Prisma, UserSettings } from "@prisma/client"

import { prisma } from "@/lib/prisma"

/**
 * The app's settings row.
 *
 * There is exactly one, because the app has exactly one user (no model carries
 * a `userId`). Two places previously kept settings in module-level memory
 * instead — a `Map` in the monthly-target route and a hand-rolled fallback
 * object in the settings route — which meant a saved goal survived until the
 * next cold start and no further. Everything now reads and writes this row.
 */

/** Mirrors the `@default` values in schema.prisma. */
export const SETTINGS_DEFAULTS = {
  dailyGoalPoints: 2000,
  weeklyGoalPoints: 14000,
  monthlyGoalPoints: 60000,
  notificationsEnabled: true,
  emailNotifications: false,
  pushNotifications: true,
  quietHoursStart: "22:00" as string | null,
  quietHoursEnd: "08:00" as string | null,
}

export type AppSettings = typeof SETTINGS_DEFAULTS

/**
 * Read the settings row, creating it on first use.
 *
 * Errors are deliberately NOT swallowed: a caller that cannot reach the
 * database needs to fail visibly rather than silently serve defaults that look
 * like the user's real configuration.
 */
export async function getSettings(): Promise<UserSettings> {
  const existing = await prisma.userSettings.findFirst()
  if (existing) return existing

  return prisma.userSettings.create({ data: {} })
}

/** Apply a partial update to the settings row. */
export async function updateSettings(
  data: Prisma.UserSettingsUpdateInput
): Promise<UserSettings> {
  const current = await getSettings()

  return prisma.userSettings.update({
    where: { id: current.id },
    data,
  })
}
