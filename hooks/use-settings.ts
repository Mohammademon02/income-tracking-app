"use client"

import { useState, useEffect } from 'react'

interface UserSettings {
  id: string
  dailyGoalPoints: number
  weeklyGoalPoints: number
  monthlyGoalPoints: number
  notificationsEnabled: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  quietHoursStart: string
  quietHoursEnd: string
}

const defaultSettings: UserSettings = {
  id: 'default',
  dailyGoalPoints: 2000,
  weeklyGoalPoints: 14000,
  monthlyGoalPoints: 60000,
  notificationsEnabled: true,
  emailNotifications: false,
  pushNotifications: true,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00"
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else {
        throw new Error('Failed to fetch settings')
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error)
      setError(error.message || 'Failed to load settings')
      // Keep default settings on error
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings)
      })

      if (response.ok) {
        const savedSettings = await response.json()
        setSettings(savedSettings)
        return true
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update settings')
      }
    } catch (error: any) {
      console.error('Error updating settings:', error)
      setError(error.message || 'Failed to update settings')
      return false
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    // Helper functions
    getDailyGoal: () => settings?.dailyGoalPoints || 2000,
    getWeeklyGoal: () => settings?.weeklyGoalPoints || 14000,
    getMonthlyGoal: () => settings?.monthlyGoalPoints || 60000,
    isNotificationsEnabled: () => settings?.notificationsEnabled ?? true,
    isPushEnabled: () => settings?.pushNotifications ?? true,
    isEmailEnabled: () => settings?.emailNotifications ?? false
  }
}