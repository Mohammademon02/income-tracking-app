"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  Clock,
  Zap,
  Award
} from "lucide-react"

interface PerformanceMetrics {
  dailyAverage: number
  weeklyTrend: number
  monthlyGoalProgress: number
  streakDays: number
  topPerformingAccount: string
  efficiency: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [monthlyTarget, setMonthlyTarget] = useState(14000)
  const [currentMonthPoints, setCurrentMonthPoints] = useState(0)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true)
        setError(null)
        
        // Get user's custom monthly target
        let customTarget = 14000 // Default
        try {
          const savedTarget = localStorage.getItem('monthly-target')
          if (savedTarget) {
            const parsed = JSON.parse(savedTarget)
            customTarget = parsed.points || 14000
          }
        } catch (e) {
          console.log('Using default target')
        }
        
        setMonthlyTarget(customTarget)
        
        const response = await fetch('/api/performance/metrics')
        if (!response.ok) {
          throw new Error('Failed to fetch performance metrics')
        }
        
        const data = await response.json()
        
        // Always recalculate monthly goal progress with custom target
        let actualCurrentPoints = 0
        try {
          const entriesResponse = await fetch('/api/entries/current-month')
          if (entriesResponse.ok) {
            const entriesData = await entriesResponse.json()
            actualCurrentPoints = entriesData.reduce((sum: number, entry: any) => sum + entry.points, 0)
            data.monthlyGoalProgress = Math.min((actualCurrentPoints / customTarget) * 100, 100)
          }
        } catch (e) {
          console.log('Could not fetch current month entries, using API default')
          // Fallback calculation
          actualCurrentPoints = Math.round((data.monthlyGoalProgress / 100) * customTarget)
        }
        
        setCurrentMonthPoints(actualCurrentPoints)
        
        setMetrics(data)
      } catch (err) {
        console.error('Error fetching performance metrics:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        // Fallback to basic metrics if API fails
        setMetrics({
          dailyAverage: 0,
          weeklyTrend: 0,
          monthlyGoalProgress: 0,
          streakDays: 0,
          topPerformingAccount: "No data",
          efficiency: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-slate-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Unable to load performance data</p>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) return null

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Target className="w-4 h-4 text-slate-600" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600"
    if (trend < 0) return "text-red-600"
    return "text-slate-600"
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return "text-green-600"
    if (efficiency >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 90) return { label: "Excellent", color: "bg-green-100 text-green-700 border-green-200" }
    if (efficiency >= 80) return { label: "Good", color: "bg-blue-100 text-blue-700 border-blue-200" }
    if (efficiency >= 60) return { label: "Average", color: "bg-orange-100 text-orange-700 border-orange-200" }
    return { label: "Needs Improvement", color: "bg-red-100 text-red-700 border-red-200" }
  }

  const efficiencyBadge = getEfficiencyBadge(metrics.efficiency)

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Performance Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Average */}
        <div className="flex items-center justify-between p-3 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Daily Average (Last 30 Days)</p>
              <p className="text-xl font-bold text-slate-800">
                {metrics.dailyAverage.toLocaleString()} pts
              </p>
              <p className="text-xs text-slate-500">
                ${(metrics.dailyAverage / 100).toFixed(2)} per day
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1 ${getTrendColor(metrics.weeklyTrend)}`}>
              {getTrendIcon(metrics.weeklyTrend)}
              <span className="text-sm font-medium">
                {Math.abs(metrics.weeklyTrend).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-slate-500">vs last week</p>
          </div>
        </div>

        {/* Monthly Goal Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-slate-700">Monthly Goal</span>
            </div>
            <span className="text-sm text-slate-600">{metrics.monthlyGoalProgress.toFixed(1)}%</span>
          </div>
          <Progress value={metrics.monthlyGoalProgress} className="h-2" />
          
          {/* Current vs Target Display */}
          <div className="flex items-center justify-between text-xs">
            <div className="text-slate-600">
              <span className="font-medium">Current:</span> {currentMonthPoints.toLocaleString()} pts
            </div>
            <div className="text-slate-600">
              <span className="font-medium">Target:</span> {monthlyTarget.toLocaleString()} pts
            </div>
          </div>
          
          <p className="text-xs text-slate-500">
            {metrics.monthlyGoalProgress >= 100 ? "Goal achieved! 🎉" : 
             metrics.monthlyGoalProgress >= 80 ? "Almost there!" :
             "Keep going!"}
          </p>
        </div>

        {/* Streak & Top Account */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-linear-to-r from-orange-50 to-amber-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{metrics.streakDays}</p>
            <p className="text-xs text-orange-700">Day Streak</p>
          </div>
          
          <div className="text-center p-3 bg-linear-to-r from-green-50 to-emerald-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-bold text-green-600 truncate" title={metrics.topPerformingAccount}>
              {metrics.topPerformingAccount}
            </p>
            <p className="text-xs text-green-700">Top Account</p>
          </div>
        </div>

        {/* Efficiency Score */}
        <div className="p-4 bg-linear-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Efficiency Score</span>
            </div>
            <Badge className={efficiencyBadge.color}>
              {efficiencyBadge.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Progress value={metrics.efficiency} className="h-3" />
            </div>
            <span className={`text-lg font-bold ${getEfficiencyColor(metrics.efficiency)}`}>
              {metrics.efficiency}%
            </span>
          </div>
          
          <p className="text-xs text-slate-500 mt-2">
            Based on consistency, goal achievement, and earning patterns
          </p>
        </div>

        {/* Quick Tips */}
        <div className="p-3 bg-linear-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <h4 className="text-sm font-medium text-indigo-800 mb-2">💡 Performance Tip</h4>
          <p className="text-xs text-indigo-700">
            {metrics.efficiency >= 80 
              ? "Great work! Try setting higher daily goals to maximize earnings."
              : metrics.streakDays >= 5
              ? "Your consistency is paying off! Focus on your top-performing accounts."
              : "Build a daily routine to improve your earning consistency."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  )
}