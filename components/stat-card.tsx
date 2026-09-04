import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { CountUp, type CountFormat } from "@/components/motion/count-up"
import { Sparkline } from "@/components/motion/sparkline"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * A single headline number.
 *
 * The dashboard carried four of these as near-identical 28-line blocks of
 * gradients, backdrop blur, tinted shadows, a "glass reflection" overlay and a
 * `hover:scale-105` on a card that is not clickable. Collapsing them removed
 * the decoration but also left a row of four static rectangles that state a
 * total and nothing about how it got there — which, for an earnings figure, is
 * the more useful half.
 *
 * So the number counts to its value and, where a series is available, the tile
 * carries thirty points of shape. Both are client leaves: this stays a server
 * component so the pages using it can keep passing an icon component, which
 * would not survive the client boundary.
 */

type Tone = "default" | "success" | "warning" | "destructive"

const TONE_CLASS: Record<Tone, string> = {
  default: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
}

export function StatCard({
  label,
  value,
  format = "points",
  hint,
  icon: Icon,
  tone = "default",
  trend,
  spark,
  className,
}: {
  label: string
  value: number
  format?: CountFormat
  hint?: ReactNode
  icon?: LucideIcon
  tone?: Tone
  /** Percentage change. Omit it rather than passing a placeholder. */
  trend?: number
  /** Recent values, oldest first. Fewer than two renders nothing. */
  spark?: number[]
  className?: string
}) {
  const TrendIcon = typeof trend === "number" && trend < 0 ? ArrowDownRight : ArrowUpRight

  return (
    // h-full so a tile with a sparkline and one without still line up in the
    // grid; the stagger wrapper stretches, the card has to fill it.
    <Card className={cn("h-full gap-0 overflow-hidden py-0", className)}>
      <CardContent className="flex flex-1 items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-1.5">
          <p className="label-caps">{label}</p>
          <p className={cn("metric", TONE_CLASS[tone])}>
            <CountUp value={value} format={format} />
          </p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
          {typeof trend === "number" ? (
            <p
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
                trend > 0 && "text-success",
                trend < 0 && "text-destructive",
                trend === 0 && "text-muted-foreground"
              )}
            >
              {trend !== 0 ? <TrendIcon className="size-3" /> : null}
              {trend > 0 ? "+" : ""}
              {trend.toFixed(1)}% vs last week
            </p>
          ) : null}
        </div>
        {Icon ? (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2",
              TONE_CLASS[tone]
            )}
          >
            <Icon className="size-4" />
          </span>
        ) : null}
      </CardContent>

      {/* Bled to the card's edges: the shape is a texture the tile sits on, not
          a chart the reader is meant to take values off. */}
      {spark && spark.length > 1 ? (
        <Sparkline values={spark} height={36} className={TONE_CLASS[tone]} />
      ) : null}
    </Card>
  )
}
