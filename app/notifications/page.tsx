"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Wallet,
  X,
  ArrowLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const notificationState = useNotificationState()

  useEffect(() => {
    if (!notificationState.isLoaded) return
    fetchNotifications()
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

  const fetchNotifications = async () => {
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

  const markAsRead = async (id: string) => {
    try {
      // Update local state immediately
      notificationState.markAsRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )

      // Also call API
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      // Update local state immediately
      notificationState.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))

      // Also call API
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const notificationIds = notifications.map(n => n.id)
      
      // Update local state immediately
      notificationState.markAllAsRead(notificationIds)
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )

      // Also call API
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

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'WITHDRAWAL':
        return <Wallet className="w-5 h-5 text-green-600" />
      case 'MILESTONE':
        return <TrendingUp className="w-5 h-5 text-purple-600" />
      case 'GOAL':
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'SYSTEM':
        return <Bell className="w-5 h-5 text-slate-600" />
      default:
        return <Bell className="w-5 h-5 text-slate-600" />
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
    return timestamp.toLocaleString()
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            All Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {unreadCount} unread
              </Badge>
            )}
          </h1>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} disabled={loading}>
            Mark all as read
          </Button>
        )}
        <Button variant="outline" onClick={fetchNotifications} disabled={loading}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500">Loading notifications...</p>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <Bell className="w-12 h-12 mx-auto mb-3 text-red-300" />
            <p className="font-medium text-red-700">Error loading notifications</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <Button 
              variant="outline" 
              className="mt-3"
              onClick={fetchNotifications}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No notifications</h3>
            <p className="text-slate-500">You're all caught up! New notifications will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "group border-l-4 transition-all hover:shadow-md",
                getPriorityColor(notification.priority),
                !notification.read && "bg-blue-50/30 shadow-sm"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={cn(
                          "font-medium text-slate-900 mb-1",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                        </h3>
                        <p className="text-slate-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {notification.priority}
                          </Badge>
                          {!notification.read && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              Unread
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}