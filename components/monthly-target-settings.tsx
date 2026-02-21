"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Calendar, Save, RotateCcw } from "lucide-react"
import { notifications } from "@/lib/notification-service"

interface MonthlyTarget {
  points: number
  earnings: number // in dollars
  lastUpdated: Date
}

export function MonthlyTargetSettings() {
  const [target, setTarget] = useState<MonthlyTarget>({
    points: 14000, // Default 14,000 points = $140 (Intermediate level)
    earnings: 140,
    lastUpdated: new Date()
  })
  
  const [tempTarget, setTempTarget] = useState(target)
  const [currentProgress, setCurrentProgress] = useState({
    points: 0,
    earnings: 0,
    percentage: 0
  })
  const [loading, setLoading] = useState(false)

  // Load saved target from API and localStorage fallback
  useEffect(() => {
    async function loadTarget() {
      try {
        // Try to load from API first
        const response = await fetch('/api/settings/monthly-target')
        if (response.ok) {
          const data = await response.json()
          const targetData = {
            points: data.points,
            earnings: data.earnings,
            lastUpdated: new Date(data.lastUpdated)
          }
          setTarget(targetData)
          setTempTarget(targetData)
          return
        }
      } catch (error) {
        console.log('API not available, using localStorage')
      }

      // Fallback to localStorage
      const saved = localStorage.getItem('monthly-target')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const targetData = {
            ...parsed,
            lastUpdated: new Date(parsed.lastUpdated)
          }
          setTarget(targetData)
          setTempTarget(targetData)
        } catch (error) {
          console.error('Failed to load monthly target:', error)
        }
      }
    }

    loadTarget()
  }, [])

  // Fetch current month progress
  useEffect(() => {
    async function fetchProgress() {
      try {
        // Get actual current month entries directly
        const response = await fetch('/api/entries/current-month')
        if (response.ok) {
          const entries = await response.json()
          const currentPoints = entries.reduce((sum: number, entry: any) => sum + entry.points, 0)
          const currentEarnings = currentPoints / 100
          const percentage = target.points > 0 ? Math.min((currentPoints / target.points) * 100, 100) : 0
          
          setCurrentProgress({
            points: currentPoints,
            earnings: currentEarnings,
            percentage: percentage
          })
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error)
        // Fallback to 0 if API fails
        setCurrentProgress({
          points: 0,
          earnings: 0,
          percentage: 0
        })
      }
    }

    fetchProgress()
  }, [target.points])

  const saveTarget = async () => {
    setLoading(true)
    
    try {
      const targetToSave = {
        ...tempTarget,
        lastUpdated: new Date()
      }
      
      // Try to save to API first
      try {
        const response = await fetch('/api/settings/monthly-target', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            points: targetToSave.points,
            earnings: targetToSave.earnings
          })
        })
        
        if (response.ok) {
          console.log('Target saved to API')
        }
      } catch (apiError) {
        console.log('API save failed, using localStorage only')
      }
      
      // Always save to localStorage as backup
      localStorage.setItem('monthly-target', JSON.stringify(targetToSave))
      setTarget(targetToSave)
      
      notifications.success("Monthly target updated!", {
        description: `New target: ${tempTarget.points.toLocaleString()} points ($${tempTarget.earnings})`
      })
      
      // Refresh the page to update performance metrics with new target
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error) {
      notifications.error("Failed to save target", {
        description: "Please try again"
      })
    } finally {
      setLoading(false)
    }
  }

  const resetToDefault = () => {
    const defaultTarget = {
      points: 14000,
      earnings: 140,
      lastUpdated: new Date()
    }
    setTempTarget(defaultTarget)
  }

  const hasChanges = tempTarget.points !== target.points || tempTarget.earnings !== target.earnings

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "text-green-600"
    if (percentage >= 75) return "text-blue-600"
    if (percentage >= 50) return "text-orange-600"
    return "text-slate-600"
  }

  const getProgressMessage = (percentage: number) => {
    if (percentage >= 100) return "🎉 Target achieved!"
    if (percentage >= 75) return "🔥 Almost there!"
    if (percentage >= 50) return "📈 Good progress!"
    if (percentage >= 25) return "💪 Keep going!"
    return "🚀 Let's start earning!"
  }

  return (
    <div className="space-y-6">
      {/* Current Progress */}
      <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Progress
            </span>
          </div>
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            {currentProgress.percentage.toFixed(1)}%
          </Badge>
        </div>
        
        <Progress value={currentProgress.percentage} className="h-3 mb-3" />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-600 font-medium">Current</p>
            <p className="text-blue-800">
              {currentProgress.points.toLocaleString()} pts
            </p>
            <p className="text-blue-700">
              ${currentProgress.earnings.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Target</p>
            <p className="text-blue-800">
              {target.points.toLocaleString()} pts
            </p>
            <p className="text-blue-700">
              ${target.earnings.toFixed(2)}
            </p>
          </div>
        </div>
        
        <p className={`text-sm font-medium mt-3 ${getProgressColor(currentProgress.percentage)}`}>
          {getProgressMessage(currentProgress.percentage)}
        </p>
      </div>

      {/* Target Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-slate-800">Set Monthly Target</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="points-target">Points Target</Label>
            <Input
              id="points-target"
              type="number"
              value={tempTarget.points}
              onChange={(e) => {
                const points = parseInt(e.target.value) || 0
                setTempTarget(prev => ({
                  ...prev,
                  points,
                  earnings: points / 100 // Auto-calculate earnings
                }))
              }}
              placeholder="14000"
              min="1000"
              max="100000"
              step="500"
            />
            <p className="text-xs text-slate-500">
              Recommended: 5,000 - 25,000 points
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="earnings-target">Earnings Target ($)</Label>
            <Input
              id="earnings-target"
              type="number"
              value={tempTarget.earnings}
              onChange={(e) => {
                const earnings = parseFloat(e.target.value) || 0
                setTempTarget(prev => ({
                  ...prev,
                  earnings,
                  points: earnings * 100 // Auto-calculate points
                }))
              }}
              placeholder="140"
              min="10"
              max="1000"
              step="5"
            />
            <p className="text-xs text-slate-500">
              100 points = $1.00
            </p>
          </div>
        </div>

        {/* Preset Targets */}
        <div className="space-y-2">
          <Label>Quick Presets</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Beginner", points: 7000, earnings: 70 },
              { label: "Intermediate", points: 14000, earnings: 140 },
              { label: "Advanced", points: 21000, earnings: 210 }
            ].map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => setTempTarget(prev => ({
                  ...prev,
                  points: preset.points,
                  earnings: preset.earnings
                }))}
                className="text-xs"
              >
                {preset.label}
                <br />
                <span className="text-slate-500">
                  ${preset.earnings}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            onClick={saveTarget}
            disabled={!hasChanges || loading}
            className="bg-linear-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Target"}
          </Button>
          
          <Button
            variant="outline"
            onClick={resetToDefault}
            disabled={loading}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
        </div>

        {hasChanges && (
          <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
            💡 You have unsaved changes. Click "Save Target" to apply them.
          </p>
        )}

        {/* Last Updated */}
        <div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
          Last updated: {target.lastUpdated.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  )
}