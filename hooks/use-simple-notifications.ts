"use client"

import { useState, useEffect, useCallback } from 'react'
import { simpleNotificationManager } from '@/lib/simple-notifications'

interface NotificationState {
  supported: boolean
  permission: NotificationPermission
  active: boolean
  loading: boolean
  error: string | null
}

export function useSimpleNotifications() {
  const [state, setState] = useState<NotificationState>({
    supported: false,
    permission: 'default',
    active: false,
    loading: true,
    error: null
  })

  const checkStatus = useCallback(() => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const supported = simpleNotificationManager.isSupported()
      const permission = supported ? Notification.permission : 'denied'
      const active = simpleNotificationManager.areNotificationsActive()
      
      setState({
        supported,
        permission,
        active,
        loading: false,
        error: null
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to check notification status'
      }))
    }
  }, [])

  const enable = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const permission = await simpleNotificationManager.requestPermission()
      
      if (permission !== 'granted') {
        setState(prev => ({
          ...prev,
          permission,
          loading: false,
          error: 'Notification permission denied'
        }))
        return false
      }

      // Send immediate test notification
      await simpleNotificationManager.sendTestNotification()
      
      // Start hourly notifications (will start at next hour)
      simpleNotificationManager.startHourlyNotifications()
      
      setState(prev => ({
        ...prev,
        permission,
        active: true,
        loading: false,
        error: null
      }))
      
      return true
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to enable notifications'
      }))
      return false
    }
  }, [])

  const disable = useCallback(() => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      simpleNotificationManager.stopHourlyNotifications()
      
      setState(prev => ({
        ...prev,
        active: false,
        loading: false,
        error: null
      }))
      
      return true
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to disable notifications'
      }))
      return false
    }
  }, [])

  const sendTestNotification = useCallback(async () => {
    try {
      return await simpleNotificationManager.sendTestNotification()
    } catch (error) {
      return false
    }
  }, [])

  useEffect(() => {
    checkStatus()
    
    // Make debug function available globally in development
    if (process.env.NODE_ENV === 'development') {
      (window as any).debugNotifications = () => {
        simpleNotificationManager.debugStatus()
      }
      (window as any).testNotification = () => {
        simpleNotificationManager.sendTestNotification()
      }
    }
  }, [checkStatus])

  // Auto-restart notifications if they were previously active
  useEffect(() => {
    if (state.active && state.permission === 'granted') {
      simpleNotificationManager.startHourlyNotifications()
    }
  }, [state.active, state.permission])

  return {
    ...state,
    enable,
    disable,
    sendTestNotification,
    refresh: checkStatus
  }
}