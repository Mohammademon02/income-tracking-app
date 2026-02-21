"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Calendar, DollarSign } from "lucide-react"

interface EarningsData {
  date: string
  points: number
  accountName: string
  accountColor: string
}

interface EarningsChartProps {
  data: EarningsData[]
  accounts: Array<{ id: string; name: string; color: string; totalPoints: number }>
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

export function EarningsChart({ data, accounts }: EarningsChartProps) {
  // Filter data to show only recent entries (last 30 days)
  const recentData = useMemo(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    return data.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= thirtyDaysAgo
    })
  }, [data])

  // Process data for different chart types
  const dailyData = useMemo(() => {
    const grouped = recentData.reduce((acc, entry) => {
      const entryDate = new Date(entry.date)
      const dateKey = entryDate.toISOString().split('T')[0] // YYYY-MM-DD format for proper sorting
      const displayDate = entryDate.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short' 
      })
      
      if (!acc[dateKey]) {
        acc[dateKey] = { 
          dateKey,
          date: displayDate, 
          points: 0, 
          earnings: 0,
          sortDate: entryDate.getTime()
        }
      }
      
      acc[dateKey].points += entry.points
      acc[dateKey].earnings += entry.points / 100
      
      return acc
    }, {} as Record<string, { dateKey: string; date: string; points: number; earnings: number; sortDate: number }>)
    
    return Object.values(grouped)
      .sort((a, b) => a.sortDate - b.sortDate) // Sort by actual date
      .slice(-14) // Last 14 days
      .map(({ dateKey, date, points, earnings }) => ({ date, points, earnings }))
  }, [recentData])

  const accountData = useMemo(() => {
    return accounts.map((account, index) => ({
      name: account.name,
      points: account.totalPoints,
      earnings: account.totalPoints / 100,
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.points - a.points)
  }, [accounts])

  const weeklyData = useMemo(() => {
    // Get last 12 weeks of data
    const twelveWeeksAgo = new Date()
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84) // 12 weeks = 84 days
    
    const weeklyEntries = data.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= twelveWeeksAgo
    })
    
    const weeks = weeklyEntries.reduce((acc, entry) => {
      const entryDate = new Date(entry.date)
      // Get Monday of the week
      const monday = new Date(entryDate)
      monday.setDate(entryDate.getDate() - entryDate.getDay() + 1)
      
      const weekKey = monday.toISOString().split('T')[0] // YYYY-MM-DD format
      const weekDisplay = monday.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short' 
      })
      
      if (!acc[weekKey]) {
        acc[weekKey] = { 
          weekKey,
          week: weekDisplay, 
          points: 0, 
          entries: 0,
          sortDate: monday.getTime()
        }
      }
      
      acc[weekKey].points += entry.points
      acc[weekKey].entries += 1
      
      return acc
    }, {} as Record<string, { weekKey: string; week: string; points: number; entries: number; sortDate: number }>)
    
    return Object.values(weeks)
      .sort((a, b) => a.sortDate - b.sortDate) // Sort by actual date
      .slice(-12) // Last 12 weeks
      .map(({ weekKey, week, points, entries }) => ({ week, points, entries }))
  }, [data])

  const totalPoints = accountData.reduce((sum, account) => sum + account.points, 0)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Daily Earnings Trend */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Daily Earnings Trend (Last 14 Days)
          </CardTitle>
          <CardDescription>
            Track your daily point earnings over time - Recent data only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'points' ? `${value.toLocaleString()} pts` : `$${value.toFixed(2)}`,
                    name === 'points' ? 'Points' : 'Earnings'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Account Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Account Performance
          </CardTitle>
          <CardDescription>
            Points distribution across accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={accountData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="points"
                >
                  {accountData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number) => [
                    `${value.toLocaleString()} pts ($${(value / 100).toFixed(2)})`,
                    'Points'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="mt-4 space-y-2">
            {accountData.map((account, index) => (
              <div key={account.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: account.color }}
                  />
                  <span className="font-medium">{account.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{account.points.toLocaleString()} pts</div>
                  <div className="text-xs text-slate-500">
                    {totalPoints > 0 ? ((account.points / totalPoints) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Weekly Summary (Last 12 Weeks)
          </CardTitle>
          <CardDescription>
            Weekly points and entry count - 3 months overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="week" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'points' ? `${value.toLocaleString()} pts` : `${value} entries`,
                    name === 'points' ? 'Points' : 'Entries'
                  ]}
                />
                <Bar 
                  dataKey="points" 
                  fill="#8B5CF6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}