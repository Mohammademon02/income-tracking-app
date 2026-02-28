"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  Wallet,
  ArrowLeft,
  RefreshCw,
  CheckCheck,
  Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
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
        return <Wallet className="w-5 h-5" />
      case 'GOAL':
        return <CheckCircle className="w-5 h-5" />
      case 'SYSTEM':
        return <Bell className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
        {/* Modern Header */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-2xl hover:bg-blue-100/80 transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Button>
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-linear-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Notifications
                  </h1>
                </div>
                {unreadCount > 0 ? (
                  <p className="text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    {unreadCount} new notification{unreadCount > 1 ? 's' : ''} waiting
                  </p>
                ) : (
                  <p className="text-slate-600">All caught up! No new notifications</p>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <Button 
                  onClick={markAllAsRead} 
                  disabled={loading}
                  className="bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl px-6"
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Mark all as read</span>
                  <span className="sm:hidden">Mark all</span>
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={fetchNotifications} 
                disabled={loading}
                className="rounded-2xl border-slate-200 hover:bg-slate-50 transition-all duration-200"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-12 text-center">
            <div className="relative mx-auto mb-6 w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Loading notifications</h3>
            <p className="text-slate-500">Please wait while we fetch your latest notifications...</p>
          </div>
        ) : error ? (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-red-200/50 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-linear-to-r from-red-100 to-pink-100 rounded-3xl flex items-center justify-center">
              <Bell className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-red-700 mb-2">Oops! Something went wrong</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <Button 
              onClick={fetchNotifications}
              className="bg-linear-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl px-8"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-linear-to-r from-slate-100 to-blue-100 rounded-3xl flex items-center justify-center">
              <Bell className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">All caught up!</h3>
            <p className="text-slate-500 mb-6">No notifications to show. New notifications will appear here when they arrive.</p>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>You're up to date</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "group relative bg-white/80 backdrop-blur-md rounded-2xl shadow-md border transition-all duration-200 hover:shadow-lg hover:scale-[1.01]",
                  !notification.read 
                    ? "border-blue-200/50 shadow-blue-100/50 bg-linear-to-r from-blue-50/80 to-indigo-50/80" 
                    : "border-white/20 hover:border-slate-200/50"
                )}
              >
                {/* Priority accent */}
                <div className={cn(
                  "absolute top-0 left-4 right-4 h-0.5 rounded-b-full",
                  notification.priority === 'HIGH' && "bg-linear-to-r from-red-500 to-pink-500",
                  notification.priority === 'MEDIUM' && "bg-linear-to-r from-orange-500 to-amber-500", 
                  notification.priority === 'LOW' && "bg-linear-to-r from-blue-500 to-indigo-500"
                )} />
                
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Compact Icon */}
                    <div className={cn(
                      "shrink-0 p-2.5 rounded-xl shadow-sm",
                      notification.type === 'WITHDRAWAL' && "bg-linear-to-r from-green-500 to-emerald-600 text-white",
                      notification.type === 'GOAL' && "bg-linear-to-r from-blue-500 to-indigo-600 text-white",
                      notification.type === 'SYSTEM' && "bg-linear-to-r from-slate-500 to-gray-600 text-white"
                    )}>
                      <Wallet className="w-4 h-4" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className={cn(
                          "text-base font-semibold text-slate-900 leading-tight",
                          !notification.read && "text-slate-900"
                        )}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm">
                            <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                            NEW
                          </div>
                        )}
                      </div>
                      
                      <p className="text-slate-600 mb-3 leading-relaxed text-sm">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium">
                              {new Date(notification.timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          
                          <Badge 
                            className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded-lg",
                              notification.priority === 'HIGH' && "bg-linear-to-r from-red-500 to-pink-500 text-white",
                              notification.priority === 'MEDIUM' && "bg-linear-to-r from-orange-500 to-amber-500 text-white",
                              notification.priority === 'LOW' && "bg-linear-to-r from-blue-500 to-indigo-500 text-white"
                            )}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        
                        {/* Compact Action buttons */}
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              onClick={() => markAsRead(notification.id)}
                              size="sm"
                              className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-xl px-3 py-1 h-8 text-xs"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Mark read</span>
                              <span className="sm:hidden">Read</span>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 rounded-xl opacity-60 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}