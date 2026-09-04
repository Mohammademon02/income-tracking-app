import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * A single headline number.
 *
 * The dashboard carried four of these as near-identical 28-line blocks of
 * gradients, backdrop blur, tinted shadows, a "glass reflection" overlay and a
 * `hover:scale-105` on a card that is not clickable. This is the same
 * information with the decoration removed and the variation reduced to one
 * accent token.
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
  hint,
  icon: Icon,
  tone = "default",
  trend,
  className,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: LucideIcon
  tone?: Tone
  /** Percentage change. Omit it rather than passing a placeholder. */
  trend?: number
  className?: string
}) {
  return (
    <Card className={cn("py-0", className)}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-1.5">
          <p className="label-caps">{label}</p>
          <p className={cn("metric", TONE_CLASS[tone])}>{value}</p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
          {typeof trend === "number" ? (
            <p
              className={cn(
                "text-xs font-medium tabular-nums",
                trend > 0 && "text-success",
                trend < 0 && "text-destructive",
                trend === 0 && "text-muted-foreground"
              )}
            >
              {trend > 0 ? "+" : ""}
              {trend.toFixed(1)}% vs last week
            </p>
          ) : null}
        </div>
        {Icon ? (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-md bg-muted",
              TONE_CLASS[tone]
            )}
          >
            <Icon className="size-4" />
          </span>
        ) : null}
      </CardContent>
    </Card>
  )
}
