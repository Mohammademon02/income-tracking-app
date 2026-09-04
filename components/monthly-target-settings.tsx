"use client"

import { useEffect, useState } from "react"
import { Loader2, RotateCcw, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { enhancedToast } from "@/components/ui/enhanced-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDollars, formatPoints, pointsToDollars } from "@/lib/money"

/**
 * The monthly points goal.
 *
 * The target lived in three places at once: a module-level Map on the server
 * that vanished on redeploy, a localStorage copy the client fell back to, and
 * UserSettings, which nothing wrote. It is stored in UserSettings now, so this
 * only has to read and write one thing — and the dashboard's progress bar can
 * no longer disagree with the number shown here.
 */

const MIN_POINTS = 1000
const MAX_POINTS = 1_000_000

export function MonthlyTargetSettings() {
  const [target, setTarget] = useState<number | null>(null)
  const [draft, setDraft] = useState("")
  const [monthPoints, setMonthPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const [targetResponse, entriesResponse] = await Promise.all([
          fetch("/api/settings/monthly-target", { signal: controller.signal }),
          fetch("/api/entries/current-month", { signal: controller.signal }),
        ])

        if (!targetResponse.ok) throw new Error("Could not load your target")

        const targetData = await targetResponse.json()
        if (controller.signal.aborted) return

        setTarget(targetData.points)
        setDraft(String(targetData.points))

        if (entriesResponse.ok) {
          const entries: { points: number }[] = await entriesResponse.json()
          setMonthPoints(entries.reduce((sum, entry) => sum + entry.points, 0))
        }
      } catch (cause) {
        if ((cause as Error).name === "AbortError") return
        setError(cause instanceof Error ? cause.message : "Could not load your target")
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void load()

    return () => controller.abort()
  }, [])

  async function save() {
    const points = Number(draft)

    if (!Number.isFinite(points) || points < MIN_POINTS || points > MAX_POINTS) {
      enhancedToast.error(
        `Target must be between ${formatPoints(MIN_POINTS)} and ${formatPoints(MAX_POINTS)} points.`
      )
      return
    }

    setSaving(true)

    try {
      const response = await fetch("/api/settings/monthly-target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? "Could not save the target")
      }

      setTarget(points)
      enhancedToast.success("Monthly target saved")
    } catch (cause) {
      enhancedToast.error(cause instanceof Error ? cause.message : "Could not save.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (error || target === null) {
    return <p className="text-sm text-destructive">{error ?? "No target available"}</p>
  }

  const progress = target > 0 ? Math.min((monthPoints / target) * 100, 100) : 0
  const dirty = draft !== String(target)

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="monthly-target">Target (points)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="monthly-target"
            type="number"
            step="100"
            min={MIN_POINTS}
            max={MAX_POINTS}
            inputMode="numeric"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button onClick={() => void save()} disabled={saving || !dirty}>
            {saving ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 size-4" />
            )}
            Save
          </Button>
          {dirty ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDraft(String(target))}
              aria-label="Reset to the saved target"
              disabled={saving}
            >
              <RotateCcw className="size-4" />
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDollars(pointsToDollars(Number(draft) || 0))} at 100 points to the dollar.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium">This month</p>
          <p className="text-sm text-muted-foreground tabular-nums">
            {formatPoints(monthPoints)} / {formatPoints(target)}
          </p>
        </div>
        <Progress value={progress} />
        <p className="text-xs text-muted-foreground tabular-nums">
          {Math.round(progress)}% · {formatDollars(pointsToDollars(monthPoints))} earned
        </p>
      </div>
    </div>
  )
}
