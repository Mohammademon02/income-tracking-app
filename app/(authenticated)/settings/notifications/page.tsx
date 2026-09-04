"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Save, Target } from "lucide-react"

import { PageContainer, PageHeader } from "@/components/page-shell"
import { PushNotificationSettings } from "@/components/push-notification-settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { enhancedToast } from "@/components/ui/enhanced-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDollars, pointsToDollars } from "@/lib/money"

type Goals = {
  dailyGoalPoints: number
  weeklyGoalPoints: number
  monthlyGoalPoints: number
}

const FIELDS: { key: keyof Goals; label: string; hint: string }[] = [
  { key: "dailyGoalPoints", label: "Daily goal", hint: "Points you aim for each day" },
  { key: "weeklyGoalPoints", label: "Weekly goal", hint: "Points across a week" },
  { key: "monthlyGoalPoints", label: "Monthly goal", hint: "Points across a month" },
]

export default function NotificationSettingsPage() {
  const [goals, setGoals] = useState<Goals | null>(null)
  const [draft, setDraft] = useState<Record<keyof Goals, string> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch("/api/settings", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load settings")
        return response.json()
      })
      .then((data) => {
        const next: Goals = {
          dailyGoalPoints: data.dailyGoalPoints,
          weeklyGoalPoints: data.weeklyGoalPoints,
          monthlyGoalPoints: data.monthlyGoalPoints,
        }
        setGoals(next)
        setDraft({
          dailyGoalPoints: String(next.dailyGoalPoints),
          weeklyGoalPoints: String(next.weeklyGoalPoints),
          monthlyGoalPoints: String(next.monthlyGoalPoints),
        })
      })
      .catch((cause) => {
        if (cause.name === "AbortError") return
        setError("Could not load your goals.")
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  async function save() {
    if (!draft) return
    setSaving(true)

    try {
      const body = Object.fromEntries(
        Object.entries(draft).map(([key, value]) => [key, Number(value)])
      )

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? "Could not save your goals")
      }

      const saved = await response.json()
      setGoals({
        dailyGoalPoints: saved.dailyGoalPoints,
        weeklyGoalPoints: saved.weeklyGoalPoints,
        monthlyGoalPoints: saved.monthlyGoalPoints,
      })
      enhancedToast.success("Goals saved")
    } catch (cause) {
      enhancedToast.error(cause instanceof Error ? cause.message : "Could not save.")
    } finally {
      setSaving(false)
    }
  }

  const dirty =
    goals !== null &&
    draft !== null &&
    FIELDS.some((field) => draft[field.key] !== String(goals[field.key]))

  return (
    <PageContainer>
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/settings">
          <ArrowLeft className="mr-1.5 size-4" />
          Back to settings
        </Link>
      </Button>

      <PageHeader
        title="Notification settings"
        description="Goals that trigger milestones, and where notifications are delivered."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-4 text-muted-foreground" />
              Goals
            </CardTitle>
            <CardDescription>
              Reaching one of these is what produces a goal notification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : error || !draft ? (
              <p className="text-sm text-destructive">{error ?? "No settings available"}</p>
            ) : (
              <>
                {FIELDS.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <Input
                      id={field.key}
                      type="number"
                      step="100"
                      min="100"
                      inputMode="numeric"
                      value={draft[field.key]}
                      onChange={(e) =>
                        setDraft({ ...draft, [field.key]: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      {field.hint} ·{" "}
                      {formatDollars(pointsToDollars(Number(draft[field.key]) || 0))}
                    </p>
                  </div>
                ))}

                <Button onClick={() => void save()} disabled={saving || !dirty}>
                  {saving ? (
                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 size-4" />
                  )}
                  Save goals
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <PushNotificationSettings />
      </div>
    </PageContainer>
  )
}
