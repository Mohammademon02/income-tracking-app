/**
 * Date handling for the whole app.
 *
 * ## The model
 *
 * `DailyEntry.date`, `Withdrawal.date` and `Withdrawal.completedAt` are not
 * instants — they are *calendar dates*. They come from `<input type="date">`,
 * which yields a bare `YYYY-MM-DD` string, and JS parses that as **UTC**
 * midnight. So a row dated "4 September" is stored as `2026-09-04T00:00:00Z`.
 *
 * The bug this module exists to prevent: boundaries built with local-time
 * helpers (`setHours(0,0,0,0)`, `new Date(y, m, 1)`) land on the server's
 * offset, not UTC. On a `America/Chicago` server, "start of 4 September"
 * becomes `2026-09-04T05:00:00Z`, which sorts *after* the entry — so today's
 * earnings read as zero, the 1st of each month falls out of that month, and
 * the 1st of the next month gets counted twice.
 *
 * Every range in this file is therefore built with `Date.UTC`, matching how
 * the values were written.
 *
 * ## "Today" is a business-day question, not a server question
 *
 * The server's own clock must never decide which calendar date is current —
 * that would make the answer depend on where the app happens to be deployed.
 * `APP_TIMEZONE` decides it. It defaults to `America/Chicago` because the
 * income being tracked is earned on US survey platforms, so the business day
 * is a US one regardless of where the user is sitting.
 */

/**
 * `NEXT_PUBLIC_` so the browser resolves the same value the server does.
 *
 * That matters for the date pickers: they render on the server and then
 * hydrate, and if the two sides disagreed about today's date React would warn
 * and the field would flip under the user. Both sides now read one build-time
 * constant. `APP_TIMEZONE` is kept as a server-side fallback.
 */
export const APP_TIMEZONE =
  process.env.NEXT_PUBLIC_APP_TIMEZONE || process.env.APP_TIMEZONE || "America/Chicago"

/** A calendar date with no timezone attached, formatted `YYYY-MM-DD`. */
export type DateKey = string

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isDateKey(value: unknown): value is DateKey {
  return typeof value === "string" && DATE_KEY_PATTERN.test(value)
}

/**
 * Which calendar date is it right now, in `timeZone`?
 *
 * `en-CA` is used because its short date format is already `YYYY-MM-DD`.
 */
export function todayKey(timeZone: string = APP_TIMEZONE, now: Date = new Date()): DateKey {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

/**
 * Read the calendar date back out of a stored value.
 *
 * Uses the UTC parts deliberately — that is the half of the timestamp that
 * carries meaning; the time-of-day half is always zero for stored date markers.
 */
export function toDateKey(date: Date): DateKey {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/** Turn a calendar date into the instant it is stored as. */
export function dateKeyToDate(key: DateKey): Date {
  if (!isDateKey(key)) {
    throw new Error(`Invalid date key: ${JSON.stringify(key)} (expected YYYY-MM-DD)`)
  }
  const [year, month, day] = key.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

/**
 * Normalise anything date-shaped to a stored date marker.
 *
 * Accepts a `YYYY-MM-DD` string (the common case, straight from a form) or a
 * `Date`, and always returns UTC midnight of that calendar day. Returns null
 * for input that isn't a usable date, so callers can reject rather than
 * silently write an `Invalid Date` to the database.
 */
export function normalizeToDateMarker(value: string | Date | null | undefined): Date | null {
  if (!value) return null

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return dateKeyToDate(toDateKey(value))
  }

  if (isDateKey(value)) return dateKeyToDate(value)

  // Fall back to a full parse for ISO strings and similar.
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return dateKeyToDate(toDateKey(parsed))
}

/** A half-open-feeling inclusive range, shaped for a Prisma `{ gte, lte }` filter. */
export type DateRange = { gte: Date; lte: Date }

const END_OF_DAY_MS = 24 * 60 * 60 * 1000 - 1

/** The full span of one calendar day. */
export function dayRange(key: DateKey): DateRange {
  const start = dateKeyToDate(key)
  return { gte: start, lte: new Date(start.getTime() + END_OF_DAY_MS) }
}

/** The full span of a month. `month` is 1-12, not zero-based. */
export function monthRange(year: number, month: number): DateRange {
  const start = new Date(Date.UTC(year, month - 1, 1))
  // Day 0 of the next month is the last day of this one.
  const end = new Date(Date.UTC(year, month, 0))
  return { gte: start, lte: new Date(end.getTime() + END_OF_DAY_MS) }
}

/** The month that contains `key`. */
export function monthRangeOf(key: DateKey): DateRange {
  const [year, month] = key.split("-").map(Number)
  return monthRange(year, month)
}

/** Shift a calendar date by whole days. Negative `days` moves backwards. */
export function addDays(key: DateKey, days: number): DateKey {
  const shifted = new Date(dateKeyToDate(key).getTime() + days * 24 * 60 * 60 * 1000)
  return toDateKey(shifted)
}

/**
 * A window of `days` calendar days ending on (and including) `endKey`.
 *
 * `lastNDays("2026-09-04", 30)` covers 6 August through 4 September — 30 days
 * total, not 31. Windows built as `now - 30 days` with no upper bound are the
 * reason the old weekly-trend numbers were biased; this one is closed at both
 * ends.
 */
export function lastNDays(days: number, endKey: DateKey = todayKey()): DateRange {
  const start = dateKeyToDate(addDays(endKey, -(days - 1)))
  const end = dateKeyToDate(endKey)
  return { gte: start, lte: new Date(end.getTime() + END_OF_DAY_MS) }
}

/** How many whole days separate two calendar dates. Positive when `b` is later. */
export function daysBetween(a: DateKey, b: DateKey): number {
  const diff = dateKeyToDate(b).getTime() - dateKeyToDate(a).getTime()
  return Math.round(diff / (24 * 60 * 60 * 1000))
}

/** Number of days in the month containing `key`. */
export function daysInMonth(key: DateKey): number {
  const [year, month] = key.split("-").map(Number)
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/**
 * How many days of the month containing `key` have elapsed, including `key`.
 * Used for month-to-date averages, which must not divide by the whole month.
 */
export function daysElapsedInMonth(key: DateKey): number {
  return Number(key.split("-")[2])
}

/**
 * Day of week for a stored date marker, 0 = Sunday.
 *
 * Reads the UTC day deliberately: `getDay()` on a UTC-midnight marker returns
 * the *previous* day for any server west of UTC, which silently reclassified
 * Mondays as Sundays in the weekday-versus-weekend comparison.
 */
export function dayOfWeek(value: Date | DateKey): number {
  const date = typeof value === "string" ? dateKeyToDate(value) : value
  return date.getUTCDay()
}

export function isWeekend(value: Date | DateKey): boolean {
  const day = dayOfWeek(value)
  return day === 0 || day === 6
}

/**
 * Count business days from `from` up to `to`, excluding weekends.
 *
 * Returns 0 when `to` is not after `from`, so a future-dated row reads as
 * "waiting zero days" rather than being reported as long overdue — which is
 * what the previous `Math.abs` version did.
 */
export function businessDaysBetween(from: DateKey, to: DateKey): number {
  const totalDays = daysBetween(from, to)
  if (totalDays <= 0) return 0

  let count = 0
  for (let i = 1; i <= totalDays; i++) {
    if (!isWeekend(addDays(from, i))) count += 1
  }
  return count
}

/**
 * How long a withdrawal took, in whole calendar days, or null while it is still
 * pending.
 *
 * Three copies of this existed — the withdrawals table, the reports page and
 * the export — and only two of them compared calendar dates, so the same
 * withdrawal could be reported as taking a different number of days depending
 * on which screen you asked.
 */
export function processingDays(requestedAt: Date, completedAt: Date | null | undefined): number | null {
  if (!completedAt) return null
  return daysBetween(toDateKey(new Date(requestedAt)), toDateKey(new Date(completedAt)))
}

/** The hour (0-23) an instant falls on, in the given timezone. */
export function hourInTimeZone(instant: Date, timeZone: string = APP_TIMEZONE): number {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    hour12: false,
  }).format(instant)
  // `hour12: false` can render midnight as "24" in some environments.
  return Number(hour) % 24
}

/**
 * Format a real instant's time of day, in the app's timezone.
 *
 * Unlike a date marker, `createdAt` is a genuine instant, so it has a
 * meaningful time — but it should read in the business timezone rather than
 * wherever the browser happens to be.
 */
export function formatTimeOfDay(instant: Date, timeZone: string = APP_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(instant)
}

/** Format a stored date marker for display, in UTC so the day never shifts. */
export function formatDate(
  value: Date | DateKey,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
): string {
  const date = typeof value === "string" ? dateKeyToDate(value) : value
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(date)
}
