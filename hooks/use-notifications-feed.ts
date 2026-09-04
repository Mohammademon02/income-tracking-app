"use client"

import { useCallback, useEffect, useState } from "react"

/**
 * The notification list, read from the server.
 *
 * Read and dismissed state used to live in localStorage on the client while
 * the server kept its own copy in process memory. Neither survived properly and
 * the two disagreed, so a notification could reappear as unread on a different
 * device or after a restart. The server is now the single source of truth
 * (NotificationState in the database), and this hook simply reflects it.
 */

export type FeedNotification = {
  id: string
  type: "WITHDRAWAL" | "GOAL" | "SYSTEM"
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  priority: "LOW" | "MEDIUM" | "HIGH"
}

const REFRESH_INTERVAL_MS = 2 * 60 * 1000

export function useNotificationsFeed() {
  const [notifications, setNotifications] = useState<FeedNotification[]>([])
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/notifications/recent", { signal })
      if (!response.ok) throw new Error("Could not load notifications")

      const data = await response.json()
      if (signal?.aborted) return

      setError(null)
      setEnabled(data.enabled !== false)
      setNotifications(
        (data.notifications ?? []).map((notification: any) => ({
          ...notification,
          timestamp: new Date(notification.timestamp),
        }))
      )
    } catch (cause) {
      if ((cause as Error).name === "AbortError") return
      setError("Could not load notifications")
      setNotifications([])
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    // The first load is deferred to a macrotask so the effect body does not
    // update state during the render pass that scheduled it. The abort still
    // covers it, since a cancelled timer never starts the fetch.
    const first = setTimeout(() => void load(controller.signal), 0)
    const interval = setInterval(() => void load(controller.signal), REFRESH_INTERVAL_MS)

    return () => {
      controller.abort()
      clearTimeout(first)
      clearInterval(interval)
    }
  }, [load])

  /** Mark one read, rolling back if the server rejects it. */
  const markAsRead = useCallback(async (id: string) => {
    const previous = notifications
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, read: true } : n))
    )

    try {
      const response = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
        method: "POST",
      })
      if (!response.ok) throw new Error()
    } catch {
      setNotifications(previous)
    }
  }, [notifications])

  const markAllAsRead = useCallback(async () => {
    const previous = notifications
    setNotifications((current) => current.map((n) => ({ ...n, read: true })))

    try {
      const response = await fetch("/api/notifications/mark-all-read", { method: "POST" })
      if (!response.ok) throw new Error()
    } catch {
      setNotifications(previous)
    }
  }, [notifications])

  const dismiss = useCallback(async (id: string) => {
    const previous = notifications
    setNotifications((current) => current.filter((n) => n.id !== id))

    try {
      const response = await fetch(`/api/notifications/${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error()
    } catch {
      // Put it back. Dropping it locally while the server still has it is how
      // the old version produced notifications that returned on the next load.
      setNotifications(previous)
    }
  }, [notifications])

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    enabled,
    loading,
    error,
    refresh: () => load(),
    markAsRead,
    markAllAsRead,
    dismiss,
  }
}
