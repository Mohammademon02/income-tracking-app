"use client"

import { useEffect, useCallback, useState } from 'react'
import { commonToasts } from '@/components/ui/enhanced-toast'
import { todayKey } from '@/lib/date-utils'

interface UseNotificationsOptions {
  enableDailyGoalAlerts?: boolean
  checkInterval?: number
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    enableDailyGoalAlerts = true,
    checkInterval = 60000 // 60 seconds
  } = options

  const [lastChecked, setLastChecked] = useState<Date>(new Date())

  // Check daily goal achievements
  const checkDailyGoals = useCallback(async () => {
    if (!enableDailyGoalAlerts) return

    try {
      // The app's business day, not a UTC slice of the local clock — the two
      // disagree for several hours a day, which showed the goal toast against
      // the wrong date.
      const today = todayKey()
      const response = await fetch(`/api/stats/daily-goal?date=${today}`)
      
      if (response.ok) {
        const { achieved, todayPoints, goalPoints } = await response.json()
        const alertKey = `${today}-goal-achieved`
        
        // Check if we already showed this notification
        const shownAlerts = JSON.parse(localStorage.getItem('daily-goal-alerts') || '[]')
        
        if (achieved && !shownAlerts.includes(alertKey)) {
          // Add to shown alerts
          shownAlerts.push(alertKey)
          localStorage.setItem('daily-goal-alerts', JSON.stringify(shownAlerts))
          
          // Show notification
          commonToasts.dailyGoalReached(todayPoints, goalPoints)
        }
      }
    } catch (error) {
      console.error('Failed to check daily goals:', error)
    }
  }, [enableDailyGoalAlerts])

  // Main notification check function
  const checkNotifications = useCallback(async () => {
    await checkDailyGoals()
    setLastChecked(new Date())
  }, [checkDailyGoals])

  // Set up periodic checks
  useEffect(() => {
    checkNotifications()
    const interval = setInterval(checkNotifications, checkInterval)
    return () => clearInterval(interval)
  }, [checkNotifications, checkInterval])

  // Manual trigger function
  const triggerCheck = useCallback(() => {
    checkNotifications()
  }, [checkNotifications])

  // Clear notification history
  const clearNotificationHistory = useCallback(() => {
    localStorage.removeItem('daily-goal-alerts')
  }, [])

  return {
    triggerCheck,
    clearNotificationHistory,
    lastChecked
  }
}