"use client"

import { useEffect, useState } from "react"
import { Moon, Sun, Sunrise, Sunset } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { APP_TIMEZONE } from "@/lib/date-utils"

/**
 * The US clock.
 *
 * There was one before — 640 lines across two components, one a near-copy of
 * the other, drawing an animated parallax landscape with a sun tracking a
 * parabolic arc, drifting clouds and a star layer. Phase 3 removed the scenery
 * and took the clock with it. This is the clock: the same four US zones, live
 * to the second, in the app's own design language.
 *
 * It earns its place on the dashboard rather than being decoration, because
 * every figure on that page is bucketed by calendar date in ONE timezone — the
 * business day from `APP_TIMEZONE`. Which zone that is, and what time it is
 * there right now, is what tells you whether "Today" is about to roll over.
 */

const ZONES = [
  { value: "America/New_York", label: "Eastern (ET)" },
  { value: "America/Chicago", label: "Central (CT)" },
  { value: "America/Denver", label: "Mountain (MT)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
] as const

/** Falls back to Central when APP_TIMEZONE is not one of the four offered. */
const DEFAULT_ZONE =
  ZONES.find((zone) => zone.value === APP_TIMEZONE)?.value ?? "America/Chicago"

function partsIn(timeZone: string, instant: Date) {
  return {
    time: new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(instant),
    date: new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(instant),
    hour: Number(
      new Intl.DateTimeFormat("en-US", { timeZone, hour: "2-digit", hour12: false }).format(
        instant
      )
    ) % 24,
  }
}

const PHASES = [
  { until: 6, label: "Night", icon: Moon },
  { until: 12, label: "Morning", icon: Sunrise },
  { until: 17, label: "Afternoon", icon: Sun },
  { until: 20, label: "Evening", icon: Sunset },
] as const

const NIGHT = { label: "Night", icon: Moon }

function phaseOf(hour: number) {
  return PHASES.find((phase) => hour < phase.until) ?? NIGHT
}

export function UsTimeClock({ className }: { className?: string }) {
  const [zone, setZone] = useState<string>(DEFAULT_ZONE)
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    // The clock starts on the client, not in the initial state: the server
    // renders at a different instant than the browser, and a time that differs
    // by one second is a hydration mismatch. Until the first tick lands the
    // time reads as a dash.
    //
    // That first tick is a macrotask rather than a direct call here, so the
    // effect body does not set state during the render pass that scheduled it
    // — the same shape as the notifications feed hook.
    const first = setTimeout(() => setNow(new Date()), 0)
    const timer = setInterval(() => setNow(new Date()), 1000)

    return () => {
      clearTimeout(first)
      clearInterval(timer)
    }
  }, [])

  const parts = now ? partsIn(zone, now) : null
  const phase = parts ? phaseOf(parts.hour) : null
  const PhaseIcon = phase?.icon ?? Sun
  const isBusinessZone = zone === APP_TIMEZONE

  return (
    <Card className={className}>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
            <PhaseIcon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-2xl leading-none font-semibold tabular-nums sm:text-3xl" suppressHydrationWarning>
              {parts?.time ?? "—:—:—"}
            </p>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {parts ? `${phase?.label} · ${parts.date}` : "Syncing…"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isBusinessZone ? (
            <Badge variant="info" title="This zone decides which date counts as today">
              Business day
            </Badge>
          ) : null}

          <Select value={zone} onValueChange={setZone}>
            <SelectTrigger aria-label="Time zone" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ZONES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
