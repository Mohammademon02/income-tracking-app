"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  ArrowRight
} from "lucide-react"

interface Insight {
  id: string
  type: 'opportunity' | 'warning' | 'achievement' | 'tip'
  title: string
  description: string
  action?: {
    label: string
    url: string
  }
  priority: 'high' | 'medium' | 'low'
  impact: string
}

export function SmartInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInsights() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/insights/generate')
        if (!response.ok) {
          throw new Error('Failed to fetch insights')
        }
        
        const data = await response.json()
        setInsights(data)
      } catch (err) {
        console.error('Error fetching insights:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setInsights([]) // Clear insights on error
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />
      case 'achievement':
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-purple-600" />
      default:
        return <Lightbulb className="w-5 h-5 text-slate-600" />
    }
  }

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'border-l-green-500 bg-green-50/50'
      case 'warning':
        return 'border-l-orange-500 bg-orange-50/50'
      case 'achievement':
        return 'border-l-blue-500 bg-blue-50/50'
      case 'tip':
        return 'border-l-purple-500 bg-purple-50/50'
      default:
        return 'border-l-slate-500 bg-slate-50/50'
    }
  }

  const getPriorityBadge = (priority: Insight['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-700 border-red-200">High Priority</Badge>
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Medium</Badge>
      case 'low':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Low Priority</Badge>
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border-l-4 border-slate-200 pl-4">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              Smart Insights
            </CardTitle>
            <Badge className="bg-red-100 text-red-700 border-red-200">
              Error
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Unable to load insights</p>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort insights by priority
  const sortedInsights = insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            Smart Insights
          </CardTitle>
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            AI-Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedInsights.slice(0, 4).map((insight) => (
          <div
            key={insight.id}
            className={`border-l-4 pl-4 pr-3 py-3 rounded-r-lg transition-all duration-200 hover:shadow-md ${getInsightColor(insight.type)}`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                {getInsightIcon(insight.type)}
                <h4 className="font-semibold text-slate-800 text-sm">{insight.title}</h4>
              </div>
              {getPriorityBadge(insight.priority)}
            </div>
            
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              {insight.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <DollarSign className="w-3 h-3 text-green-600" />
                <span className="text-green-700 font-medium">{insight.impact}</span>
              </div>
              
              {insight.action && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs hover:bg-white/80 transition-colors"
                  onClick={() => {
                    if (insight.action?.url.startsWith('mailto:')) {
                      window.open(insight.action.url, '_blank')
                    } else if (insight.action?.url.startsWith('http')) {
                      window.open(insight.action.url, '_blank')
                    } else {
                      // Navigate to internal route
                      window.location.href = insight.action.url
                    }
                  }}
                >
                  {insight.action.label}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {insights.length > 4 && (
          <div className="pt-3 border-t border-slate-200">
            <Button
              variant="ghost"
              className="w-full text-sm text-slate-600 hover:text-slate-800"
            >
              View all {insights.length} insights
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
        
        {insights.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">No insights available</p>
            <p className="text-sm">Keep tracking your earnings to get personalized insights!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}