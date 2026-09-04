import { hourInTimeZone } from "@/lib/date-utils"

/**
 * "Your entries around 4 PM are worth more than the rest of the day."
 *
 * This lived inline in the insights route and reported "+1280% in that hour"
 * off three entries. Two things were wrong with it.
 *
 * It compared hour *totals*. A total mostly measures how often you log in that
 * hour, not what a survey is worth then — so the advice it gave ("focus your
 * survey time there") did not follow from the number it showed. And it divided
 * one sum by the average of the other sums, which is unbounded: one busy hour
 * against a handful of one-entry hours reads as a four-figure percentage no
 * matter how thin the evidence behind it.
 *
 * It now compares the *median* points per entry, pooling every other entry
 * rather than averaging per-hour averages, and returns a multiple, which stays
 * legible at any size.
 *
 * It lives here, apart from the route, so the thresholds can be tested with
 * data rather than trusted.
 */

export type PeakHour = {
  /** Hour of day, 0-23, in the app's business timezone. */
  hour: number
  /** Median points per entry inside that hour. */
  perEntry: number
  /** Median points per entry across every other hour, pooled. */
  otherPerEntry: number
  /** `perEntry / otherPerEntry`, always > 1 when this is returned. */
  multiple: number
  /** How many entries the peak claim rests on. */
  sampleSize: number
}

/**
 * Thresholds are about evidence, not tuning: enough entries overall for "the
 * rest of the day" to mean something, enough inside the best hour to call it a
 * habit rather than one good afternoon, and a gap big enough to act on.
 */
export const MIN_ENTRIES_IN_WINDOW = 20
export const MIN_ENTRIES_IN_PEAK_HOUR = 5
export const MIN_MULTIPLE = 1.5

/**
 * The typical entry, as a median rather than a mean.
 *
 * A mean baseline is controlled by its largest value: one 5,000-point survey at
 * 3 AM lifts "the rest of the day" enough to hide a real 4 PM pattern behind
 * it, exactly as an outlier in the other direction used to invent one. The
 * median answers the question actually being asked — what a typical entry in
 * this hour is worth — and neither outlier moves it.
 */
function median(values: number[]): number {
  if (values.length === 0) return 0

  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

/** `createdAt` is a real instant, so the hour is read in the business timezone. */
export function findPeakHour(
  entries: { points: number; createdAt: Date }[]
): PeakHour | null {
  if (entries.length < MIN_ENTRIES_IN_WINDOW) return null

  const byHour = new Map<number, number[]>()
  for (const entry of entries) {
    const hour = hourInTimeZone(entry.createdAt)
    const points = byHour.get(hour)
    if (points) points.push(entry.points)
    else byHour.set(hour, [entry.points])
  }

  if (byHour.size < 3) return null

  // Ranked among hours that clear the sample minimum, rather than ranking all
  // of them and rejecting the winner if it is too thin: one lucky survey at
  // 3 AM would otherwise take the top slot and suppress a real 4 PM pattern
  // behind it.
  const candidates = [...byHour.entries()]
    .filter(([, points]) => points.length >= MIN_ENTRIES_IN_PEAK_HOUR)
    .sort((a, b) => median(b[1]) - median(a[1]))

  const best = candidates[0]
  if (!best) return null
  const [hour, points] = best

  const otherPoints = [...byHour.entries()]
    .filter(([other]) => other !== hour)
    .flatMap(([, values]) => values)

  const perEntry = median(points)
  const otherPerEntry = median(otherPoints)

  if (otherPerEntry <= 0) return null

  const multiple = perEntry / otherPerEntry
  if (multiple < MIN_MULTIPLE) return null

  return { hour, perEntry, otherPerEntry, multiple, sampleSize: points.length }
}
