// Production-Ready Simple Notification System
// Optimized for mobile and desktop browsers

class SimpleNotificationManager {
  private static instance: SimpleNotificationManager
  private intervalId: number | null = null

  static getInstance(): SimpleNotificationManager {
    if (!SimpleNotificationManager.instance) {
      SimpleNotificationManager.instance = new SimpleNotificationManager()
    }
    return SimpleNotificationManager.instance
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window
  }

  // Request permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied'
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission()
    }

    return Notification.permission
  }

  // Show notification (optimized for mobile)
  async showNotification(title: string, options: {
    body?: string
    icon?: string
    tag?: string
    data?: any
  } = {}): Promise<boolean> {
    try {
      if (Notification.permission !== 'granted') {
        return false
      }

      const notification = new Notification(title, {
        body: options.body || '',
        icon: options.icon || '/icon-192x192.png',
        tag: options.tag || 'default',
        data: options.data,
        // Mobile optimization
        requireInteraction: false,
        silent: false
      })

      // Auto-close after 8 seconds (mobile-friendly)
      setTimeout(() => {
        notification.close()
      }, 8000)

      // Handle click - mobile-friendly navigation
      notification.onclick = () => {
        window.focus()
        notification.close()
        
        // Navigate to dashboard
        if (window.location.pathname !== '/dashboard') {
          window.location.href = '/dashboard'
        }
      }

      return true
    } catch (error) {
      console.error('Notification failed:', error)
      return false
    }
  }

  // Start hourly notifications
  startHourlyNotifications(): void {
    this.stopHourlyNotifications()

    if (process.env.NODE_ENV === 'development') {
      console.log('🔔 Starting hourly notifications...')
      console.log('⏰ Next notification will be in exactly 1 hour')
    }
    
    // Calculate time until next hour
    const now = new Date()
    const nextHour = new Date(now)
    nextHour.setHours(now.getHours() + 1, 0, 0, 0) // Next hour at :00 minutes
    
    const timeUntilNextHour = nextHour.getTime() - now.getTime()
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ Time until next notification: ${Math.round(timeUntilNextHour / 1000 / 60)} minutes`)
    }
    
    // Send first notification at the next hour mark
    setTimeout(() => {
      this.sendIncomeNotification()
      
      // Then schedule regular hourly notifications
      this.intervalId = window.setInterval(() => {
        this.sendIncomeNotification()
      }, 60 * 60 * 1000) // Exactly 1 hour (3,600,000 ms)
      
    }, timeUntilNextHour)

    // Store state for persistence
    localStorage.setItem('hourlyNotificationsActive', 'true')
    localStorage.setItem('notificationStartTime', now.toISOString())
  }

  // Stop hourly notifications
  stopHourlyNotifications(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      if (process.env.NODE_ENV === 'development') {
        console.log('🔕 Hourly notifications stopped')
      }
    }
    localStorage.setItem('hourlyNotificationsActive', 'false')
    localStorage.removeItem('notificationStartTime')
  }

  // Check if notifications are active
  areNotificationsActive(): boolean {
    return localStorage.getItem('hourlyNotificationsActive') === 'true'
  }

  // Send immediate test notification (separate from hourly schedule)
  async sendTestNotification(): Promise<boolean> {
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Sending immediate test notification...')
    }
    return await this.showNotification('🧪 Test Notification', {
      body: 'Hourly notifications are now active! Next update in 1 hour.',
      tag: 'test-notification',
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    })
  }

  // Debug function to check notification status
  debugStatus(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Notification Debug Status:')
      console.log('- Supported:', this.isSupported())
      console.log('- Permission:', Notification.permission)
      console.log('- Active:', this.areNotificationsActive())
      console.log('- Interval ID:', this.intervalId)
      console.log('- LocalStorage:', localStorage.getItem('hourlyNotificationsActive'))
    }
    
    const startTime = localStorage.getItem('notificationStartTime')
    if (startTime) {
      const started = new Date(startTime)
      const now = new Date()
      const elapsed = Math.round((now.getTime() - started.getTime()) / 1000 / 60)
      if (process.env.NODE_ENV === 'development') {
        console.log(`- Started: ${started.toLocaleTimeString()} (${elapsed} minutes ago)`)
      }
      
      // Calculate next notification time
      const nextHour = new Date(started)
      nextHour.setHours(started.getHours() + 1, 0, 0, 0)
      while (nextHour <= now) {
        nextHour.setHours(nextHour.getHours() + 1)
      }
      const minutesUntilNext = Math.round((nextHour.getTime() - now.getTime()) / 1000 / 60)
      if (process.env.NODE_ENV === 'development') {
        console.log(`- Next notification: ${nextHour.toLocaleTimeString()} (in ${minutesUntilNext} minutes)`)
      }
    }
  }

  // Force send notification for testing
  async forceSendNotification(): Promise<boolean> {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Force sending notification for testing...')
    }
    return await this.sendIncomeNotification().then(() => true).catch(() => false)
  }

  // Send income notification
  private async sendIncomeNotification(): Promise<void> {
    try {
      if (Notification.permission !== 'granted') {
        return
      }

      const settings = await this.getUserSettings()
      if (!settings.notificationsEnabled || !settings.pushNotifications) {
        return
      }

      // 24/7 notifications - no quiet hours check
      const incomeData = await this.getTodayIncomeData()
      
      const success = await this.showNotification('💰 Daily Income Update', {
        body: `Today: ${incomeData.todayEarnings} | Goal: ${incomeData.dailyGoal} (${incomeData.progressPercent}%)`,
        tag: 'daily-income-update',
        data: {
          type: 'daily-income',
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Income notification failed:', error)
    }
  }

  // Check quiet hours
  private isQuietHours(startTime: string, endTime: string): boolean {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    const start = startHour * 60 + startMin
    const end = endHour * 60 + endMin
    
    if (start <= end) {
      return currentTime >= start && currentTime <= end
    } else {
      return currentTime >= start || currentTime <= end
    }
  }

  // Get user settings
  private async getUserSettings(): Promise<any> {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Settings fetch failed:', error)
    }
    
    return {
      notificationsEnabled: true,
      pushNotifications: true,
      dailyGoalPoints: 2000
    }
  }

  // Get today's income data
  private async getTodayIncomeData(): Promise<any> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch('/api/entries/current-month')
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const entries = await response.json()
      
      if (!Array.isArray(entries)) {
        throw new Error('Invalid API response')
      }
      
      const todayEntries = entries.filter((entry: any) => {
        const entryDate = new Date(entry.date).toISOString().split('T')[0]
        return entryDate === today
      })
      
      const todayPoints = todayEntries.reduce((sum: number, entry: any) => 
        sum + (entry.points || 0), 0
      )
      
      const settings = await this.getUserSettings()
      const dailyGoal = (settings.dailyGoalPoints || 2000) / 100
      const todayEarnings = todayPoints / 100
      const progressPercent = Math.round((todayEarnings / dailyGoal) * 100)
      
      return {
        todayEarnings: `$${todayEarnings.toFixed(2)}`,
        dailyGoal: `$${dailyGoal.toFixed(2)}`,
        progressPercent: Math.min(progressPercent, 100)
      }
    } catch (error) {
      console.error('Income data fetch failed:', error)
      return {
        todayEarnings: '$0.00',
        dailyGoal: '$20.00',
        progressPercent: 0
      }
    }
  }
}

export const simpleNotificationManager = SimpleNotificationManager.getInstance()

// Make it globally available for debugging (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).simpleNotificationManager = simpleNotificationManager
}