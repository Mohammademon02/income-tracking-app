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
  TrendingUp, 
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
  type: 'WITHDRAWAL' | 'MILESTONE' | 'GOAL' | 'SYSTEM'
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
        return <Wallet className="w-4 h-4 text-green-600" />
      case 'MILESTONE':
        return <TrendingUp className="w-4 h-4 text-purple-600" />
      case 'GOAL':
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      case 'SYSTEM':
        return <Bell className="w-4 h-4 text-slate-600" />
      default:
        return <Bell className="w-4 h-4 text-slate-600" />
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
            "relative hover:bg-blue-100 transition-colors",
            className
          )}
          disabled={loading}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 text-blue-600" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0 shadow-xl border-0" 
        align="end"
        sideOffset={8}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3 bg-linear-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {unreadCount} new
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-blue-100"
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
                    className="text-xs hover:bg-blue-100"
                    disabled={loading}
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-blue-100"
                  disabled={loading}
                  onClick={() => {
                    setIsOpen(false)
                    router.push('/settings/notifications')
                  }}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-slate-500">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-sm">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-red-300" />
                <p className="font-medium">Error loading notifications</p>
                <p className="text-sm">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "group p-4 hover:bg-slate-50 transition-colors border-l-4 cursor-pointer",
                      getPriorityColor(notification.priority),
                      !notification.read && "bg-blue-50/30"
                    )}
                    onClick={(e) => {
                      e.preventDefault()
                      markAsRead(notification.id)
                      if (notification.actionUrl) {
                        setIsOpen(false)
                        // Use Next.js router instead of window.location to avoid reload
                        // For now, just close the popover without navigation
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={cn(
                              "text-sm font-medium text-slate-900",
                              !notification.read && "font-semibold"
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
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
          </CardContent>
          {notifications.length > 0 && (
            <div className="border-t p-3 bg-slate-50">
              <Button
                variant="ghost"
                className="w-full text-sm text-slate-600 hover:text-slate-800"
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
        </Card>
      </PopoverContent>
    </Popover>
  )
}