import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import type { ReactNode } from "react"

import { CountUp } from "@/components/motion/count-up"
import { Sparkline } from "@/components/motion/sparkline"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * The one number a page is about.
 *
 * The dashboard opened with four equally sized tiles, which is a layout that
 * declines to say what matters — the eye has to read all four to find out. One
 * figure at 60px, with the other three demoted beneath it, is the same data
 * arranged as an answer rather than an inventory.
 *
 * Exactly one of these belongs on a page. The gradient fill and the ambient
 * glow are what make it read as the anchor, and both stop meaning anything the
 * moment a second element wears them.
 */

export function HeroMetric({
  label,
  points,
  dollars,
  trend,
  trendLabel = "vs last week",
  spark,
  footnote,
  actions,
}: {
  label: string
  points: number
  dollars: number
  /** Percentage change. Omit rather than passing a placeholder. */
  trend?: number
  trendLabel?: string
  /** Recent daily totals, oldest first. */
  spark?: number[]
  footnote?: ReactNode
  actions?: ReactNode
}) {
  const TrendIcon = typeof trend === "number" && trend < 0 ? ArrowDownRight : ArrowUpRight

  return (
    <Card className="relative gap-0 overflow-hidden py-0">
      {/* The card's own light source, sitting behind the figure it lights. The
          page-level aurora is too diffuse to model a single surface. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-[radial-gradient(circle,var(--glow-1),transparent_70%)] blur-2xl"
      />

      <div className="relative flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="label-caps">{label}</p>
            {footnote ? <p className="text-sm text-muted-foreground">{footnote}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            {typeof trend === "number" ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums",
                  trend > 0 && "bg-success-muted text-success",
                  trend < 0 && "bg-destructive-muted text-destructive",
                  trend === 0 && "bg-surface-2 text-muted-foreground"
                )}
              >
                {trend !== 0 ? <TrendIcon className="size-3.5" /> : null}
                {trend > 0 ? "+" : ""}
                {trend.toFixed(1)}%
                <span className="font-normal opacity-70">{trendLabel}</span>
              </span>
            ) : null}
            {actions}
          </div>
        </div>

        <div className="space-y-1">
          {/* Points and dollars are the same quantity in two units, so they sit
              on one line at two weights. Stacked at equal weight — the previous
              treatment — they read as two competing figures. */}
          <p className="metric-hero text-gradient">
            <CountUp value={points} format="points" duration={1.4} />
          </p>
          <p className="metric-sm text-muted-foreground">
            <CountUp value={dollars} format="dollars" duration={1.4} />
            <span className="ml-2 text-xs font-medium tracking-normal text-muted-foreground/70">
              {points.toLocaleString("en-US")} points
            </span>
          </p>
        </div>
      </div>

      {spark && spark.length > 1 ? (
        <Sparkline values={spark} height={72} className="text-primary" />
      ) : null}
    </Card>
  )
}
