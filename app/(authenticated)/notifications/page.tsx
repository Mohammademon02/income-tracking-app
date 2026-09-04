"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, CheckCircle2, RefreshCw, Target, Wallet, X } from "lucide-react"

import { PageContainer, PageHeader } from "@/components/page-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/responsive-table"
import { Skeleton } from "@/components/ui/skeleton"
import { useNotificationsFeed } from "@/hooks/use-notifications-feed"
import { cn } from "@/lib/utils"

const TYPE_ICON = {
  WITHDRAWAL: Wallet,
  GOAL: Target,
  SYSTEM: Bell,
} as const

export default function NotificationsPage() {
  const router = useRouter()
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

  return (
    <PageContainer>
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/dashboard">
          <ArrowLeft className="mr-1.5 size-4" />
          Back to dashboard
        </Link>
      </Button>

      <PageHeader
        title="Notifications"
        description={
          enabled
            ? "Withdrawal updates and goal milestones."
            : "Notifications are switched off in settings."
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void refresh()}>
              <RefreshCw className="mr-1.5 size-4" />
              Refresh
            </Button>
            {unreadCount > 0 ? (
              <Button size="sm" onClick={() => void markAllAsRead()}>
                Mark all read
              </Button>
            ) : null}
          </>
        }
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <EmptyState
          icon={<Bell className="size-5" />}
          title="Could not load notifications"
          description={error}
          action={
            <Button variant="outline" onClick={() => void refresh()}>
              Try again
            </Button>
          }
        />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="size-5" />}
          title="Nothing needs your attention"
          description="Withdrawal approvals and goal milestones will show up here."
        />
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => {
            const Icon = TYPE_ICON[notification.type] ?? Bell

            return (
              <li key={notification.id}>
                <Card className={cn("py-0", !notification.read && "border-primary/40")}>
                  <CardContent className="flex items-start gap-3 p-4">
                    <Icon
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        notification.priority === "HIGH"
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{notification.title}</p>
                        {!notification.read ? (
                          <Badge variant="secondary">New</Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {notification.timestamp.toLocaleString()}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {notification.actionUrl ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              void markAsRead(notification.id)
                              router.push(notification.actionUrl!)
                            }}
                          >
                            Open
                          </Button>
                        ) : null}
                        {!notification.read ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void markAsRead(notification.id)}
                          >
                            Mark read
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      onClick={() => void dismiss(notification.id)}
                    >
                      <X className="size-4" />
                      <span className="sr-only">Dismiss {notification.title}</span>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </PageContainer>
  )
}
