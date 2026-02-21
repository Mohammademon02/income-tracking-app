"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Target, 
  Bell, 
  DollarSign,
  Save,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

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

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

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
    } catch (error) {
      console.error('Error fetching settings:', error)
      setError('Failed to load settings')
      // Set default settings as fallback
      setSettings({
        id: 'default',
        dailyGoalPoints: 2000,
        weeklyGoalPoints: 14000,
        monthlyGoalPoints: 60000,
        notificationsEnabled: true,
        emailNotifications: false,
        pushNotifications: true,
        quietHoursStart: "22:00",
        quietHoursEnd: "08:00"
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }
    } catch (error: any) {
      console.error('Error saving settings:', error)
      setError(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof UserSettings, value: any) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  if (loading) {
    return (
      <div className="p-6 space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="p-6 space-y-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <Settings className="w-12 h-12 mx-auto mb-3 text-red-300" />
            <p className="font-medium text-red-700">Error loading settings</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <Button 
              variant="outline" 
              className="mt-3"
              onClick={fetchSettings}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Notification Settings
          </h1>
          <p className="text-slate-600">Customize your goals and notifications</p>
        </div>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium">✅ Settings saved successfully!</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">❌ {error}</p>
        </div>
      )}

      <div className="grid gap-6">
        {/* Goal Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Daily Goal Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Daily Goal */}
            <div className="space-y-2">
              <Label htmlFor="dailyGoal" className="flex items-center gap-2">
                Daily Goal
                <Badge variant="secondary" className="text-xs">
                  ${(settings.dailyGoalPoints / 100).toFixed(2)}
                </Badge>
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="dailyGoal"
                  type="number"
                  min="100"
                  max="50000"
                  step="100"
                  value={settings.dailyGoalPoints}
                  onChange={(e) => updateSetting('dailyGoalPoints', parseInt(e.target.value) || 0)}
                  className="max-w-xs"
                />
                <span className="text-sm text-slate-500">points per day</span>
              </div>
              <p className="text-xs text-slate-500">
                Get notified when you reach your daily earning goal
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Goal Presets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              Quick Goal Presets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: '$7/day', points: 700 },
                { label: '$10/day', points: 1000 },
                { label: '$13/day', points: 1300 },
                { label: '$15/day', points: 1500 }
              ].map((preset) => (
                <Button
                  key={preset.points}
                  variant={settings.dailyGoalPoints === preset.points ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('dailyGoalPoints', preset.points)}
                  className="flex flex-col h-auto py-3"
                >
                  <span className="font-medium">{preset.label}</span>
                  <span className="text-xs opacity-75">{preset.points} pts</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Enable Notifications</Label>
                <p className="text-sm text-slate-500">Receive goal and milestone notifications</p>
              </div>
              <Button
                variant={settings.notificationsEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}
              >
                {settings.notificationsEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Push Notifications</Label>
                <p className="text-sm text-slate-500">In-app notification alerts</p>
              </div>
              <Button
                variant={settings.pushNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting('pushNotifications', !settings.pushNotifications)}
                disabled={!settings.notificationsEnabled}
              >
                {settings.pushNotifications ? 'On' : 'Off'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}