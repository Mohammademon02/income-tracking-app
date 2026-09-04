"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Loader2, Settings, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { enhancedToast } from "@/components/ui/enhanced-toast"
import { usePushNotifications } from "@/hooks/use-push-notifications"

/**
 * The dashboard prompt to turn on notifications.
 *
 * It used to enable a browser-local hourly notification that only fired while
 * a tab was open, and shipped a "Debug" button that rendered in production and
 * did nothing there because its body was guarded by a NODE_ENV check. It now
 * registers a real push subscription, so notifications arrive with the app
 * closed — which is what the copy always claimed.
 */
export function UnifiedNotificationSetup() {
  const { status, subscribe } = usePushNotifications()
  const [dismissed, setDismissed] = useState(false)

  // Nothing to offer when it is already on, unavailable, or blocked.
  if (
    dismissed ||
    !status.supported ||
    !status.configured ||
    status.subscribed ||
    status.permission === "denied"
  ) {
    return null
  }

  async function enable() {
    const ok = await subscribe()
    if (ok) {
      enhancedToast.success("Notifications enabled on this device")
      setDismissed(true)
    } else if (status.error) {
      enhancedToast.error(status.error)
    }
  }

  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
          <Bell className="size-4" />
        </span>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Turn on notifications</h3>
            <p className="text-sm text-muted-foreground">
              Get told when a withdrawal is approved or a goal is reached, even with the app
              closed.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => void enable()} disabled={status.busy}>
              {status.busy ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Bell className="mr-1.5 size-4" />
              )}
              {status.busy ? "Enabling…" : "Enable"}
            </Button>

            <Button variant="outline" size="sm" asChild>
              <Link href="/settings/notifications">
                <Settings className="mr-1.5 size-4" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => setDismissed(true)}
        >
          <X className="size-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </CardContent>
    </Card>
  )
}
