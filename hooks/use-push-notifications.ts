"use client"

import { useCallback, useEffect, useState } from "react"

/**
 * Browser push subscription lifecycle.
 *
 * This is the piece that was missing entirely: nothing in the app ever called
 * `navigator.serviceWorker` or `pushManager.subscribe()`, so "push
 * notifications" only ever meant a local `new Notification()` that required a
 * tab to be open. With this hook the browser registers a real endpoint with the
 * push service and the server can reach the device while the app is closed.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

export type PushStatus = {
  /** The browser has service workers, push and the Notification API. */
  supported: boolean
  /** The server has VAPID keys, so subscribing can succeed. */
  configured: boolean
  permission: NotificationPermission | "unsupported"
  subscribed: boolean
  /** True while a subscribe/unsubscribe round trip is in flight. */
  busy: boolean
  error: string | null
}

/**
 * VAPID keys are URL-safe base64; PushManager wants raw bytes.
 *
 * The buffer is allocated explicitly so the result is typed
 * `Uint8Array<ArrayBuffer>` — `applicationServerKey` requires a plain
 * ArrayBuffer view, and the default `Uint8Array` type admits SharedArrayBuffer.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  const output = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

function isSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>({
    // Start pessimistic: this renders on the server too, where none of the
    // browser APIs exist. The effect below corrects it after mount, which also
    // keeps the server and client markup identical.
    supported: false,
    configured: Boolean(VAPID_PUBLIC_KEY),
    permission: "unsupported",
    subscribed: false,
    busy: false,
    error: null,
  })

  const refresh = useCallback(async () => {
    if (!isSupported()) return

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    setStatus((current) => ({
      ...current,
      supported: true,
      permission: Notification.permission,
      subscribed: subscription !== null,
    }))
  }, [])

  useEffect(() => {
    if (!isSupported()) {
      setStatus((current) => ({ ...current, supported: false, permission: "unsupported" }))
      return
    }

    // `cancelled` stops the async result landing in an unmounted component.
    let cancelled = false

    void (async () => {
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (cancelled) return

        setStatus((current) => ({
          ...current,
          supported: true,
          permission: Notification.permission,
          subscribed: subscription !== null,
        }))
      } catch {
        if (cancelled) return
        setStatus((current) => ({ ...current, supported: true, permission: Notification.permission }))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported()) {
      setStatus((c) => ({ ...c, error: "This browser does not support push notifications." }))
      return false
    }

    if (!VAPID_PUBLIC_KEY) {
      setStatus((c) => ({ ...c, error: "Push is not configured on the server." }))
      return false
    }

    setStatus((c) => ({ ...c, busy: true, error: null }))

    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        setStatus((c) => ({
          ...c,
          busy: false,
          permission,
          error:
            permission === "denied"
              ? "Notifications are blocked. Enable them in your browser's site settings."
              : null,
        }))
        return false
      }

      const registration = await navigator.serviceWorker.ready

      // Reuse an existing subscription when there is one; calling subscribe()
      // twice with the same key is fine but re-sending keeps the server row
      // fresh after a reinstall.
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }))

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? "The server rejected the subscription.")
      }

      setStatus((c) => ({ ...c, busy: false, permission, subscribed: true, error: null }))
      return true
    } catch (error) {
      setStatus((c) => ({
        ...c,
        busy: false,
        error: error instanceof Error ? error.message : "Could not enable notifications.",
      }))
      return false
    }
  }, [])

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported()) return false

    setStatus((c) => ({ ...c, busy: true, error: null }))

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Tell the server first: if the browser drops the subscription and the
        // server keeps the row, every later push fails against a dead endpoint.
        await fetch("/api/notifications/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        }).catch(() => {
          // A failed cleanup call is not worth blocking the user's opt-out;
          // the endpoint gets pruned on its first 410 anyway.
        })

        await subscription.unsubscribe()
      }

      setStatus((c) => ({ ...c, busy: false, subscribed: false }))
      return true
    } catch (error) {
      setStatus((c) => ({
        ...c,
        busy: false,
        error: error instanceof Error ? error.message : "Could not disable notifications.",
      }))
      return false
    }
  }, [])

  const sendTest = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    try {
      const response = await fetch("/api/notifications/test", { method: "POST" })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok || payload.success === false) {
        return { ok: false, message: payload.error ?? "Test push failed." }
      }

      return { ok: true, message: `Sent to ${payload.sent} device${payload.sent === 1 ? "" : "s"}.` }
    } catch {
      return { ok: false, message: "Could not reach the server." }
    }
  }, [])

  return { status, subscribe, unsubscribe, sendTest, refresh }
}
