"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, CheckCircle2, RefreshCw, Settings, Target, Wallet, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { useNotificationsFeed, type FeedNotification } from "@/hooks/use-notifications-feed"
import { cn } from "@/lib/utils"

const TYPE_ICON = {
  WITHDRAWAL: Wallet,
  GOAL: Target,
  SYSTEM: Bell,
} as const

/** Relative time, in the units a person would actually say. */
function timeAgo(date: Date): string {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (seconds < 60) return "just now"

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationCenter({ className }: { className?: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const {
    notifications,
    unreadCount,
    enabled,
    loading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    dismiss,
  } = useNotificationsFeed()

  function open(notification: FeedNotification) {
    void markAsRead(notification.id)

    // The actionUrl was declared, served by the API and rendered — but clicking
    // it only closed the panel. It now navigates.
    if (notification.actionUrl) {
      setIsOpen(false)
      router.push(notification.actionUrl)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label={
            unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"
          }
        >
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          <div className="flex items-center gap-1">
            {unreadCount > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => void markAllAsRead()}
              >
                Mark all read
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => {
                setIsOpen(false)
                router.push("/settings/notifications")
              }}
              aria-label="Notification settings"
            >
              <Settings className="size-3.5" />
            </Button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="space-y-2 p-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
              {/* A retry, not a full document reload as this used to do. */}
              <Button variant="outline" size="sm" className="mt-3" onClick={() => void refresh()}>
                <RefreshCw className="mr-1.5 size-3.5" />
                Try again
              </Button>
            </div>
          ) : !enabled ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Notifications are switched off in settings.
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-muted-foreground">
              <CheckCircle2 className="size-5" />
              <p className="text-sm">Nothing needs your attention.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {notifications.map((notification) => {
                const Icon = TYPE_ICON[notification.type] ?? Bell

                return (
                  <li
                    key={notification.id}
                    className={cn(
                      "group relative",
                      !notification.read && "bg-accent/40"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => open(notification)}
                      className="flex w-full items-start gap-2.5 py-3 pl-3 pr-9 text-left transition-colors hover:bg-accent focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
                    >
                      <Icon
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          notification.priority === "HIGH"
                            ? "text-destructive"
                            : "text-muted-foreground"
                        )}
                      />
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo(notification.timestamp)}
                        </p>
                      </div>
                    </button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1.5 top-2.5 size-6 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                      onClick={() => void dismiss(notification.id)}
                    >
                      <X className="size-3.5" />
                      <span className="sr-only">Dismiss {notification.title}</span>
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
