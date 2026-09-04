"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { enhancedToast } from "@/components/ui/enhanced-toast"

/**
 * The notification toggles on the settings page.
 *
 * These were two decorative divs before: no state, no keyboard access, and no
 * connection to anything. They now read and write the real settings row, which
 * `/api/notifications/recent` and the push dispatcher both honour.
 */

type Preferences = {
  notificationsEnabled: boolean
  pushNotifications: boolean
}

const TOGGLES: { key: keyof Preferences; label: string; description: string }[] = [
  {
    key: "notificationsEnabled",
    label: "Notifications",
    description: "Withdrawal updates and goal milestones, shown in the app.",
  },
  {
    key: "pushNotifications",
    label: "Push notifications",
    description: "Also deliver them to this device when the app is closed.",
  },
]

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<Preferences | null>(null)
  const [saving, setSaving] = useState<keyof Preferences | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch("/api/settings", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load settings")
        return response.json()
      })
      .then((data) =>
        setPreferences({
          notificationsEnabled: Boolean(data.notificationsEnabled),
          pushNotifications: Boolean(data.pushNotifications),
        })
      )
      .catch((cause) => {
        if (cause.name === "AbortError") return
        setError("Could not load your notification settings.")
      })

    // Abort on unmount so a slow response cannot write into an unmounted tree.
    return () => controller.abort()
  }, [])

  async function toggle(key: keyof Preferences, value: boolean) {
    if (!preferences) return

    const previous = preferences
    // Optimistic, with an explicit rollback: without one a rejected write
    // leaves the switch showing a setting the server never accepted.
    setPreferences({ ...preferences, [key]: value })
    setSaving(key)

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? "The change could not be saved.")
      }
    } catch (cause) {
      setPreferences(previous)
      enhancedToast.error(cause instanceof Error ? cause.message : "Could not save.")
    } finally {
      setSaving(null)
    }
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (!preferences) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {TOGGLES.map((item) => (
        <div key={item.key} className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <p id={`${item.key}-label`} className="text-sm font-medium">
              {item.label}
            </p>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
          <Switch
            checked={preferences[item.key]}
            onCheckedChange={(value) => toggle(item.key, value)}
            disabled={saving !== null}
            aria-labelledby={`${item.key}-label`}
          />
        </div>
      ))}

      <div className="border-t pt-4">
        <Link
          href="/settings/notifications"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Advanced notification settings
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}
