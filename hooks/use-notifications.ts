"use client"

import { useEffect, useCallback, useRef } from 'react'
import { notifications } from '@/lib/notification-service'

interface UseNotificationsOptions {
  enableWithdrawalAlerts?: boolean
  enableMilestoneAlerts?: boolean
  enableDailyGoalAlerts?: boolean
  checkInterval?: number // in milliseconds
}

interface NotificationState {
  lastChecked: Date
  withdrawalAlerts: Set<string>
  milestoneAlerts: Set<number>
  dailyGoalAlerts: Set<string>
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    enableWithdrawalAlerts = true,
    enableMilestoneAlerts = true,
    enableDailyGoalAlerts = true,
    checkInterval = 30000 // 30 seconds
  } = options

  const stateRef = useRef<NotificationState>({
    lastChecked: new Date(),
    withdrawalAlerts: new Set(),
    milestoneAlerts: new Set(),
    dailyGoalAlerts: new Set()
  })

  // Check for withdrawal status updates
  const checkWithdrawalUpdates = useCallback(async () => {
    if (!enableWithdrawalAlerts) return

    try {
      // This would typically fetch from your API
      const response = await fetch('/api/withdrawals/recent-updates')
      if (response.ok) {
        const updates = await response.json()
        
        updates.forEach((update: any) => {
          const alertKey = `${update.id}-${update.status}`
          if (!stateRef.current.withdrawalAlerts.has(alertKey)) {
            stateRef.current.withdrawalAlerts.add(alertKey)
            
            if (update.status === 'COMPLETED') {
              const processingDays = Math.ceil(
                (new Date(update.completedAt).getTime() - new Date(update.date).getTime()) 
                / (1000 * 60 * 60 * 24)
              )
              notifications.withdrawal.approved(
                update.amount, 
                update.accountName, 
                processingDays
              )
            }
          }
        })
      }
    } catch (error) {
      console.error('Failed to check withdrawal updates:', error)
    }
  }, [enableWithdrawalAlerts])

  // Check for milestone achievements
  const checkMilestones = useCallback(async () => {
    if (!enableMilestoneAlerts) return

    try {
      const response = await fetch('/api/stats/milestones')
      if (response.ok) {
        const { totalPoints, nextMilestone, recentMilestones } = await response.json()
        
        recentMilestones.forEach((milestone: number) => {
          if (!stateRef.current.milestoneAlerts.has(milestone)) {
            stateRef.current.milestoneAlerts.add(milestone)
            notifications.entry.milestone(totalPoints, nextMilestone)
          }
        })
      }
    } catch (error) {
      console.error('Failed to check milestones:', error)
    }
  }, [enableMilestoneAlerts])

  // Check daily goal achievements
  const checkDailyGoals = useCallback(async () => {
    if (!enableDailyGoalAlerts) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/stats/daily-goal?date=${today}`)
      
      if (response.ok) {
        const { achieved, todayPoints, goalPoints } = await response.json()
        const alertKey = `${today}-goal-achieved`
        
        if (achieved && !stateRef.current.dailyGoalAlerts.has(alertKey)) {
          stateRef.current.dailyGoalAlerts.add(alertKey)
          notifications.entry.dailyGoal(todayPoints, goalPoints)
        }
      }
    } catch (error) {
      console.error('Failed to check daily goals:', error)
    }
  }, [enableDailyGoalAlerts])

  // Main notification check function
  const checkNotifications = useCallback(async () => {
    await Promise.all([
      checkWithdrawalUpdates(),
      checkMilestones(),
      checkDailyGoals()
    ])
    
    stateRef.current.lastChecked = new Date()
  }, [checkWithdrawalUpdates, checkMilestones, checkDailyGoals])

  // Set up periodic checks
  useEffect(() => {
    // Initial check
    checkNotifications()

    // Set up interval
    const interval = setInterval(checkNotifications, checkInterval)

    // Cleanup
    return () => clearInterval(interval)
  }, [checkNotifications, checkInterval])

  // Manual trigger function
  const triggerCheck = useCallback(() => {
    checkNotifications()
  }, [checkNotifications])

  // Clear notification history (useful for testing or reset)
  const clearNotificationHistory = useCallback(() => {
    stateRef.current.withdrawalAlerts.clear()
    stateRef.current.milestoneAlerts.clear()
    stateRef.current.dailyGoalAlerts.clear()
  }, [])

  return {
    triggerCheck,
    clearNotificationHistory,
    lastChecked: stateRef.current.lastChecked
  }
}