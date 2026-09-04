"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface Insight {
  id: string
  type: "opportunity" | "warning" | "achievement" | "tip"
  title: string
  description: string
  action?: {
    label: string
    url: string
  }
  priority: "high" | "medium" | "low"
  impact: string
}

const TYPE_STYLE: Record<Insight["type"], { icon: typeof Lightbulb; className: string }> = {
  opportunity: { icon: TrendingUp, className: "text-success border-l-success" },
  warning: { icon: AlertTriangle, className: "text-warning border-l-warning" },
  achievement: { icon: CheckCircle2, className: "text-primary border-l-primary" },
  tip: { icon: Lightbulb, className: "text-muted-foreground border-l-border" },
}

const COLLAPSED_COUNT = 4

export function SmartInsights() {
  const router = useRouter()
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchInsights() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/insights/generate", { signal: controller.signal })
        if (!response.ok) throw new Error("Could not load insights")

        setInsights(await response.json())
      } catch (cause) {
        if ((cause as Error).name === "AbortError") return
        setError(cause instanceof Error ? cause.message : "Could not load insights")
        setInsights([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void fetchInsights()

    // Abort on unmount so a slow response cannot write into an unmounted tree.
    return () => controller.abort()
  }, [])

  function followAction(url: string) {
    if (url.startsWith("http") || url.startsWith("mailto:")) {
      window.open(url, "_blank", "noopener,noreferrer")
      return
    }
    // router.push for internal routes. `window.location.href` forced a full
    // document reload and discarded all client state.
    router.push(url)
  }

  const body = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          <Lightbulb className="mx-auto mb-2 size-6" />
          <p className="text-sm font-medium">Unable to load insights</p>
          <p className="text-sm">{error}</p>
        </div>
      )
    }

    if (insights.length === 0) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          <Lightbulb className="mx-auto mb-2 size-6" />
          <p className="text-sm font-medium">No insights yet</p>
          <p className="text-sm">Keep logging entries and suggestions will appear here.</p>
        </div>
      )
    }

    // The API already returns these highest-priority first. The old component
    // re-sorted with `insights.sort(...)`, which mutates state in place.
    const visible = expanded ? insights : insights.slice(0, COLLAPSED_COUNT)

    return (
      <div className="space-y-3">
        {visible.map((insight) => {
          const style = TYPE_STYLE[insight.type]
          const Icon = style.icon

          return (
            <div key={insight.id} className={cn("border-l-2 py-2 pl-3", style.className)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon className="size-4 shrink-0" />
                  <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
                </div>
                {insight.priority === "high" ? (
                  <Badge variant="destructive" className="bg-destructive/12 text-destructive">
                    High
                  </Badge>
                ) : null}
              </div>

              <p className="mt-1.5 text-sm text-muted-foreground">{insight.description}</p>

              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-muted-foreground">
                  {insight.impact}
                </span>
                {insight.action ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => followAction(insight.action!.url)}
                  >
                    {insight.action.label}
                    <ArrowRight className="ml-1 size-3" />
                  </Button>
                ) : null}
              </div>
            </div>
          )
        })}

        {insights.length > COLLAPSED_COUNT ? (
          <div className="border-t pt-3">
            {/*
              This button previously had no onClick at all, so every insight
              past the fourth was unreachable.
            */}
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => setExpanded((current) => !current)}
            >
              {expanded ? "Show fewer" : `View all ${insights.length} insights`}
            </Button>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="size-4 text-muted-foreground" />
          Insights
        </CardTitle>
        <CardDescription>Patterns worth acting on, derived from your data.</CardDescription>
      </CardHeader>
      <CardContent>{body()}</CardContent>
    </Card>
  )
}
