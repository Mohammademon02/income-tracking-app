"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Bell,
  BellRing,
  CheckCircle,
  Clock,
  Wallet,
  X,
  Settings,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useNotificationState } from "@/hooks/use-notification-state"

interface Notification {
  id: string
  type: 'WITHDRAWAL' | 'GOAL' | 'SYSTEM'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const notificationState = useNotificationState()

  // Fetch notifications from API only after state is loaded
  useEffect(() => {
    if (!notificationState.isLoaded) return

    async function fetchNotifications() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/notifications/recent')
        if (response.ok) {
          const data = await response.json()
          const processedNotifications = data
            .filter((n: any) => !notificationState.isDeleted(n.id))
            .map((n: any) => ({
              ...n,
              timestamp: new Date(n.timestamp),
              read: notificationState.isRead(n.id)
            }))
          setNotifications(processedNotifications)
        } else {
          throw new Error(`Failed to fetch notifications: ${response.status}`)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
        setError('Failed to load notifications')
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Refresh notifications every 2 minutes
    const interval = setInterval(fetchNotifications, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [notificationState.isLoaded])

  // Update notification states when localStorage state changes
  useEffect(() => {
    if (!notificationState.isLoaded) return

    setNotifications(prev =>
      prev
        .filter(n => !notificationState.isDeleted(n.id))
        .map(n => ({
          ...n,
          read: notificationState.isRead(n.id)
        }))
    )
  }, [notificationState.state, notificationState.isLoaded])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (id: string) => {
    try {
      // Update local state immediately for instant feedback
      notificationState.markAsRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )

      // Also call API for server-side tracking
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const notificationIds = notifications.map(n => n.id)

      // Update local state immediately for instant feedback
      notificationState.markAllAsRead(notificationIds)
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      )

      // Also call API for server-side tracking
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds })
      })
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      // Update local state immediately for instant feedback
      notificationState.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))

      // Also call API for server-side tracking
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const clearAllNotifications = async () => {
    try {
      // Clear local state
      notificationState.clearAll()
      setNotifications([])

      // Also clear any server-side state if needed
      await fetch('/api/notifications/clear-all', {
        method: 'POST'
      })
    } catch (error) {
      console.error('Failed to clear all notifications:', error)
    }
  }

  const refreshNotifications = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/notifications/recent')
      if (response.ok) {
        const data = await response.json()
        const processedNotifications = data
          .filter((n: any) => !notificationState.isDeleted(n.id))
          .map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
            read: notificationState.isRead(n.id)
          }))
        setNotifications(processedNotifications)
      } else {
        throw new Error(`Failed to fetch notifications: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'WITHDRAWAL':
        return <Wallet className="w-4 h-4" />
      case 'GOAL':
        return <CheckCircle className="w-4 h-4" />
      case 'SYSTEM':
        return <Bell className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'HIGH':
        return 'border-l-red-500 bg-red-50/50'
      case 'MEDIUM':
        return 'border-l-orange-500 bg-orange-50/50'
      case 'LOW':
        return 'border-l-blue-500 bg-blue-50/50'
      default:
        return 'border-l-slate-500 bg-slate-50/50'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative hover:bg-blue-100/80 transition-all duration-200 rounded-xl",
            unreadCount > 0 && "animate-pulse",
            className
          )}
          disabled={loading}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 text-blue-600" />
          ) : (
            <Bell className="h-5 w-5 text-slate-600" />
          )}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 sm:w-96 p-0 shadow-2xl border border-slate-200/50 rounded-2xl backdrop-blur-sm bg-white/95 max-w-[calc(100vw-2rem)]"
        align="end"
        sideOffset={12}
      >
        <div className="overflow-hidden rounded-2xl">
          {/* Modern Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-blue-100 text-sm">{unreadCount} new notification{unreadCount > 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-white/20 text-white"
                  disabled={loading}
                  onClick={refreshNotifications}
                  title="Refresh notifications"
                >
                  <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs hover:bg-white/20 text-white px-3 py-1 h-8 hidden sm:inline-flex"
                    disabled={loading}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
          </div>
          {/* Content Area */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto bg-white">
            {loading ? (
              <div className="text-center py-12 text-slate-500">
                <div className="relative mx-auto mb-4 w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-sm font-medium">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-2xl flex items-center justify-center">
                  <Bell className="w-8 h-8 text-red-400" />
                </div>
                <p className="font-semibold mb-1">Error loading notifications</p>
                <p className="text-sm text-slate-600 mb-4">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <Bell className="w-8 h-8 text-slate-300" />
                </div>
                <p className="font-semibold mb-1">All caught up!</p>
                <p className="text-sm text-slate-600">No new notifications</p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "group relative rounded-xl p-4 mb-2 transition-all duration-200 cursor-pointer hover:shadow-md",
                      !notification.read
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 shadow-sm"
                        : "bg-slate-50/50 hover:bg-slate-100/80 border border-transparent",
                      index === notifications.length - 1 && "mb-0"
                    )}
                    onClick={(e) => {
                      e.preventDefault()
                      markAsRead(notification.id)
                      if (notification.actionUrl) {
                        setIsOpen(false)
                      }
                    }}
                  >
                    {/* Priority indicator */}
                    <div className={cn(
                      "absolute left-0 top-4 bottom-4 w-1 rounded-r-full",
                      notification.priority === 'HIGH' && "bg-red-500",
                      notification.priority === 'MEDIUM' && "bg-orange-500",
                      notification.priority === 'LOW' && "bg-blue-500"
                    )} />

                    <div className="flex items-start gap-3 pl-3">
                      {/* Icon */}
                      <div className={cn(
                        "shrink-0 p-2 rounded-xl",
                        notification.type === 'WITHDRAWAL' && "bg-green-100 text-green-600",
                        notification.type === 'GOAL' && "bg-blue-100 text-blue-600",
                        notification.type === 'SYSTEM' && "bg-slate-100 text-slate-600"
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className={cn(
                              "text-sm font-semibold text-slate-900 mb-1 leading-tight",
                              !notification.read && "text-slate-900"
                            )}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                                <Clock className="w-3 h-3" />
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                  <span className="text-xs text-blue-600 font-medium">New</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Delete button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-200/50 bg-slate-50/50 p-3">
              <Button
                variant="ghost"
                className="w-full text-sm text-slate-600 hover:text-slate-800 hover:bg-white rounded-xl font-medium py-2"
                onClick={(e) => {
                  e.preventDefault()
                  setIsOpen(false)
                  router.push('/notifications')
                }}
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}