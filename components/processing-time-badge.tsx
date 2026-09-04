import { Clock } from "lucide-react"

import { processingDays } from "@/lib/date-utils"
import { cn } from "@/lib/utils"

/**
 * How long a withdrawal took, as a badge.
 *
 * The dashboard and the withdrawals table each carried their own copy of this
 * logic — the table computed the day count six times inline in one cell — and
 * both rendered the result as an emoji rating (⚡ Fast, 🐌 Slow). One component,
 * one threshold table, words instead of emoji.
 */

const THRESHOLDS = [
  { maxDays: 7, label: "Fast", className: "bg-success-muted text-success" },
  { maxDays: 15, label: "Normal", className: "bg-muted text-muted-foreground" },
  { maxDays: 25, label: "Slow", className: "bg-warning-muted text-warning" },
] as const

const SLOWEST = { label: "Very slow", className: "bg-destructive-muted text-destructive" }

/**
 * How the day count reads. Zero is the common case — most payouts clear the
 * same day they are requested — and "0 days" is a worse way to say that than
 * "Same day".
 */
function durationLabel(days: number): string {
  if (days === 0) return "Same day"
  return `${days} ${days === 1 ? "day" : "days"}`
}

export function ProcessingTimeBadge({
  requestedAt,
  completedAt,
  className,
}: {
  requestedAt: Date
  completedAt: Date | null
  className?: string
}) {
  const days = processingDays(requestedAt, completedAt)

  if (days === null) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs text-muted-foreground",
          className
        )}
      >
        <Clock className="size-3" />
        Processing
      </span>
    )
  }

  const speed = THRESHOLDS.find((threshold) => days <= threshold.maxDays) ?? SLOWEST

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
        speed.className,
        className
      )}
    >
      <Clock className="size-3" />
      {durationLabel(days)} · {speed.label}
    </span>
  )
}
