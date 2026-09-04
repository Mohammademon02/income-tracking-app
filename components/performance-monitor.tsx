"use client"

import { useEffect, useState } from "react"
import { Award, Target, TrendingDown, TrendingUp, Zap } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDollars, formatPoints, pointsToDollars } from "@/lib/money"
import { cn } from "@/lib/utils"

/**
 * Headline performance figures.
 *
 * The monthly goal used to be read once from localStorage on mount and then
 * never re-read, so changing the target left this card showing the old one
 * until a hard reload. It also fetched the month's entries separately just to
 * recompute progress the API had already got wrong. The API now returns the
 * goal, the month's points and the progress together, from the settings row —
 * so there is one number and one request.
 */

interface PerformanceMetrics {
  dailyAverage: number
  weeklyTrend: number
  monthlyGoalProgress: number
  monthlyGoal: number
  thisMonthPoints: number
  daysElapsedThisMonth: number
  streakDays: number
  topPerformingAccount: string
  efficiency: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchMetrics() {
      try {
        setError(null)
        const response = await fetch("/api/performance/metrics", { signal: controller.signal })
        if (!response.ok) throw new Error("Could not load performance metrics")

        setMetrics(await response.json())
      } catch (cause) {
        if ((cause as Error).name === "AbortError") return
        // Reported as a failure rather than shown as a set of zeros, which
        // renders an outage as "you earned nothing".
        setError(cause instanceof Error ? cause.message : "Could not load metrics")
        setMetrics(null)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void fetchMetrics()

    return () => controller.abort()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-4 text-muted-foreground" />
          Performance
        </CardTitle>
        <CardDescription>How this month is tracking.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error || !metrics ? (
          <div className="py-8 text-center text-muted-foreground">
            <Target className="mx-auto mb-2 size-6" />
            <p className="text-sm">{error ?? "No metrics available"}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Monthly goal */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium">Monthly goal</p>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {formatPoints(metrics.thisMonthPoints)} / {formatPoints(metrics.monthlyGoal)}
                </p>
              </div>
              <Progress value={metrics.monthlyGoalProgress} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{metrics.monthlyGoalProgress}%</span>
                <span>{formatDollars(pointsToDollars(metrics.thisMonthPoints))}</span>
              </div>
            </div>

            {/* Figures */}
            <div className="grid grid-cols-2 gap-3">
              <Metric
                label="Daily average"
                value={formatPoints(metrics.dailyAverage)}
                hint="Last 30 days"
              />
              <Metric
                label="Week on week"
                value={`${metrics.weeklyTrend > 0 ? "+" : ""}${metrics.weeklyTrend}%`}
                hint="Against the previous 7 days"
                tone={
                  metrics.weeklyTrend > 0
                    ? "success"
                    : metrics.weeklyTrend < 0
                      ? "destructive"
                      : "muted"
                }
                icon={metrics.weeklyTrend < 0 ? TrendingDown : TrendingUp}
              />
              <Metric
                label="Streak"
                value={`${metrics.streakDays}d`}
                hint="Consecutive days logged"
                icon={Zap}
              />
              <Metric
                label="Efficiency"
                value={`${metrics.efficiency}%`}
                hint="Consistency, goal and activity"
                icon={Award}
              />
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm text-muted-foreground">Top account</span>
              <Badge variant="secondary">{metrics.topPerformingAccount}</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Metric({
  label,
  value,
  hint,
  tone = "default",
  icon: Icon,
}: {
  label: string
  value: string
  hint?: string
  tone?: "default" | "success" | "destructive" | "muted"
  icon?: typeof TrendingUp
}) {
  const toneClass = {
    default: "text-foreground",
    success: "text-success",
    destructive: "text-destructive",
    muted: "text-muted-foreground",
  }[tone]

  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center gap-1.5">
        {Icon ? <Icon className={cn("size-3.5", toneClass)} /> : null}
        <p className={cn("metric-sm", toneClass)}>{value}</p>
      </div>
      <p className="mt-0.5 text-xs font-medium">{label}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
