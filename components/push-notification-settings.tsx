"use client"

import { useState } from "react"
import { Bell, BellOff, Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { enhancedToast } from "@/components/ui/enhanced-toast"
import { Switch } from "@/components/ui/switch"
import { usePushNotifications } from "@/hooks/use-push-notifications"

/**
 * Push notification controls.
 *
 * This screen used to manage a browser-local `new Notification()` schedule and
 * called it push. It now drives a real subscription: the browser registers an
 * endpoint with its push service, the server stores it, and the test button
 * sends an actual push through it — so a passing test means the whole path
 * works, rather than only that the tab is open.
 */
export function PushNotificationSettings() {
  const { status, subscribe, unsubscribe, sendTest } = usePushNotifications()
  const [testing, setTesting] = useState(false)

  async function toggle(enabled: boolean) {
    if (enabled) {
      const ok = await subscribe()
      if (ok) enhancedToast.success("Notifications enabled on this device")
      else if (status.error) enhancedToast.error(status.error)
      return
    }

    const ok = await unsubscribe()
    if (ok) enhancedToast.success("Notifications disabled on this device")
  }

  async function test() {
    setTesting(true)
    const result = await sendTest()
    setTesting(false)

    if (result.ok) enhancedToast.success("Test push sent", { description: result.message })
    else enhancedToast.error(result.message)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-4 text-muted-foreground" />
          Push notifications
        </CardTitle>
        <CardDescription>
          Delivered to this device by your browser, even when the app is closed.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!status.supported ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <BellOff className="size-4" />
            This browser does not support push notifications.
          </p>
        ) : !status.configured ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <BellOff className="size-4" />
            Push is not configured on this server. Set the VAPID keys to enable it.
          </p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <p id="push-toggle-label" className="text-sm font-medium">
                  This device
                </p>
                <p className="text-sm text-muted-foreground">
                  {status.subscribed
                    ? "Registered and receiving pushes."
                    : "Not registered yet."}
                </p>
              </div>
              <Switch
                checked={status.subscribed}
                onCheckedChange={(value) => void toggle(value)}
                disabled={status.busy}
                aria-labelledby="push-toggle-label"
              />
            </div>

            {status.permission === "denied" ? (
              <p className="rounded-md bg-warning-muted px-3 py-2 text-sm text-warning">
                Notifications are blocked for this site. Allow them in your browser&apos;s
                settings, then switch this back on.
              </p>
            ) : null}

            {status.error ? (
              <p className="rounded-md bg-destructive-muted px-3 py-2 text-sm text-destructive">
                {status.error}
              </p>
            ) : null}

            {status.subscribed ? (
              <div className="border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => void test()} disabled={testing}>
                  {testing ? (
                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                  ) : (
                    <Send className="mr-1.5 size-4" />
                  )}
                  Send a test push
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Close the app first to confirm it arrives in the background.
                </p>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}
