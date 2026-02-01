import { getEntries } from "@/app/actions/entries"
import { getAccounts } from "@/app/actions/accounts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Calendar, ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { getAvatarGradient } from "@/lib/avatar-utils"
import { DailyEarningsClient } from "@/components/daily-earnings-client"

export default async function DailyEarningsPage() {
  const [entries, accounts] = await Promise.all([
    getEntries(),
    getAccounts(),
  ])

  // Get date range for last 30 days
  const currentDate = new Date()
  const thirtyDaysAgo = new Date(currentDate)
  thirtyDaysAgo.setDate(currentDate.getDate() - 30)

  // Filter entries to only include last 30 days
  const recentEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date)
    return entryDate >= thirtyDaysAgo && entryDate <= currentDate
  })

  // Group entries by date (only last 30 days)
  const dailyData = recentEntries.reduce((acc, entry) => {
    const date = new Date(entry.date)
    const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD format
    const dateDisplay = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        dateDisplay,
        totalPoints: 0,
        totalEntries: 0,
        entriesList: [],
        date: date
      }
    }
    
    acc[dateKey].totalPoints += entry.points
    acc[dateKey].totalEntries += 1
    
    // Add individual entry to the list
    acc[dateKey].entriesList.push({
      id: entry.id,
      accountId: entry.accountId,
      accountName: entry.accountName,
      accountColor: entry.accountColor,
      points: entry.points,
      date: entry.date,
      createdAt: entry.createdAt
    })
    
    return acc
  }, {} as Record<string, any>)

  // Sort dates by date (newest first) and prepare for selector
  const sortedDates = Object.entries(dailyData)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, data]) => ({
      key,
      name: data.dateDisplay,
      data
    }))

  // Get today as default and ensure it's always available
  const today = new Date()
  const todayKey = today.toISOString().split('T')[0]
  const todayDisplay = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  // Add today to the list if it doesn't exist
  if (!sortedDates.find(d => d.key === todayKey)) {
    sortedDates.unshift({
      key: todayKey,
      name: todayDisplay,
      data: {
        dateDisplay: todayDisplay,
        totalPoints: 0,
        totalEntries: 0,
        entriesList: [],
        date: today
      }
    })
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50/50 to-blue-50/30 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Daily Earnings - Last 30 Days
          </h1>
          <p className="text-slate-600 mt-1">Track your daily earnings and entries from the past month</p>
        </div>
      </div>

      {/* Daily Earnings Display */}
      <DailyEarningsClient 
        dailyData={dailyData}
        availableDates={sortedDates}
        todayKey={todayKey}
      />
    </div>
  )
}