"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  BellRing, 
  BellOff,
  Clock,
  TestTube,
  CheckCircle,
  AlertCircle,
  Loader2,
  Smartphone,
  Timer
} from 'lucide-react'
import { useSimpleNotifications } from '@/hooks/use-simple-notifications'
import { cn } from '@/lib/utils'

export function PushNotificationSettings() {
  const {
    supported,
    permission,
    active,
    loading,
    error,
    enable,
    disable,
    sendTestNotification
  } = useSimpleNotifications()

  const [testLoading, setTestLoading] = useState(false)
  const [testSuccess, setTestSuccess] = useState(false)
  const [nextNotificationTime, setNextNotificationTime] = useState<string>('')
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  // Update next notification time every minute
  useEffect(() => {
    const updateNextNotificationTime = () => {
      if (!active) {
        setNextNotificationTime('')
        setTimeRemaining('')
        return
      }

      const startTime = localStorage.getItem('notificationStartTime')
      if (!startTime) {
        setNextNotificationTime('')
        setTimeRemaining('')
        return
      }

      const started = new Date(startTime)
      const now = new Date()
      
      // Calculate next notification time
      const nextHour = new Date(started)
      nextHour.setHours(started.getHours() + 1, 0, 0, 0)
      while (nextHour <= now) {
        nextHour.setHours(nextHour.getHours() + 1)
      }
      
      const minutesUntilNext = Math.round((nextHour.getTime() - now.getTime()) / 1000 / 60)
      
      setNextNotificationTime(nextHour.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }))
      
      if (minutesUntilNext > 60) {
        const hours = Math.floor(minutesUntilNext / 60)
        const mins = minutesUntilNext % 60
        setTimeRemaining(`${hours}h ${mins}m`)
      } else {
        setTimeRemaining(`${minutesUntilNext}m`)
      }
    }

    updateNextNotificationTime()
    
    // Update every minute
    const interval = setInterval(updateNextNotificationTime, 60000)
    return () => clearInterval(interval)
  }, [active])

  const handleEnable = async () => {
    const success = await enable()
    if (success && process.env.NODE_ENV === 'development') {
      console.log('Notifications enabled successfully')
    }
  }

  const handleDisable = async () => {
    const success = await disable()
    if (success && process.env.NODE_ENV === 'development') {
      console.log('Notifications disabled successfully')
    }
  }

  const handleTestNotification = async () => {
    setTestLoading(true)
    setTestSuccess(false)
    
    const success = await sendTestNotification()
    
    setTestLoading(false)
    if (success) {
      setTestSuccess(true)
      setTimeout(() => setTestSuccess(false), 3000)
    }
  }

  const getStatusBadge = () => {
    if (!supported) {
      return <Badge variant="destructive">Not Supported</Badge>
    }
    
    if (permission === 'denied') {
      return <Badge variant="destructive">Permission Denied</Badge>
    }
    
    if (permission === 'default') {
      return <Badge variant="secondary">Permission Needed</Badge>
    }
    
    if (active) {
      return <Badge className="bg-green-500 text-white">Active</Badge>
    }
    
    return <Badge variant="outline">Inactive</Badge>
  }

  const getStatusIcon = () => {
    if (!supported || permission === 'denied') {
      return <BellOff className="w-5 h-5 text-red-500" />
    }
    
    if (active) {
      return <BellRing className="w-5 h-5 text-green-500" />
    }
    
    return <Bell className="w-5 h-5 text-slate-500" />
  }

  if (!supported) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <BellOff className="w-6 h-6 text-red-500" />
            <h3 className="font-semibold text-red-700">Notifications Not Supported</h3>
          </div>
          <p className="text-sm text-red-600 mb-4">
            Your browser doesn't support notifications. Please use a modern browser like Chrome, Firefox, or Safari.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <div>
              <div className="flex items-center gap-2">
                Hourly Income Notifications
                <Smartphone className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-sm font-normal text-slate-500 mt-1">
                Works on mobile and desktop
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Next Notification Timer */}
        {active && nextNotificationTime && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-sm text-blue-800">Next Notification</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-blue-900">{nextNotificationTime}</p>
                <p className="text-sm text-blue-600">Daily income summary</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-700">{timeRemaining}</p>
                <p className="text-xs text-blue-500">remaining</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Information */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-sm">24/7 Notification Schedule</span>
          </div>
          <p className="text-sm text-slate-600">
            Get your daily income summary every hour, 24 hours a day. Optimized for mobile devices.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="font-medium text-red-700">Error</span>
            </div>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Permission Denied */}
        {permission === 'denied' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BellOff className="w-4 h-4 text-orange-500" />
              <span className="font-medium text-orange-700">Permission Denied</span>
            </div>
            <p className="text-sm text-orange-600 mb-3">
              To enable notifications:
            </p>
            <ol className="text-sm text-orange-600 space-y-1 ml-4">
              <li>1. Click the lock/info icon in your browser's address bar</li>
              <li>2. Allow notifications for this site</li>
              <li>3. Refresh this page</li>
            </ol>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!active ? (
            <Button 
              onClick={handleEnable}
              disabled={loading || permission === 'denied'}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BellRing className="w-4 h-4" />
              )}
              Enable Hourly Notifications
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={handleDisable}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
              Disable Notifications
            </Button>
          )}

          {active && (
            <Button 
              variant="secondary"
              onClick={handleTestNotification}
              disabled={testLoading}
              className={cn(
                "flex items-center gap-2",
                testSuccess && "bg-green-100 text-green-700 border-green-200"
              )}
            >
              {testLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : testSuccess ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              {testSuccess ? 'Test Sent!' : 'Send Test'}
            </Button>
          )}
        </div>

        {/* Feature List */}
        {active && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-medium text-green-700">Active Features</span>
            </div>
            <ul className="text-sm text-green-600 space-y-1">
              <li>• Hourly daily income summaries (24/7)</li>
              <li>• Mobile-optimized notifications</li>
              <li>• Works day and night</li>
              <li>• Auto-close after 8 seconds</li>
              <li>• Click to open dashboard</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}