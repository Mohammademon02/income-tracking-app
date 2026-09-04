"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Calendar, Clock } from "lucide-react"
import { getAvatarGradient } from "@/lib/avatar-utils"
import { DatePicker } from "@/components/date-picker"

interface DailyEarningsClientProps {
  dailyData: Record<string, any>
  availableDates: Array<{
    key: string
    name: string
    data: any
  }>
  todayKey: string
}

export function DailyEarningsClient({ dailyData, availableDates, todayKey }: DailyEarningsClientProps) {
  // Set default to today if available, otherwise first available date
  const defaultDate = availableDates.find(d => d.key === todayKey) || availableDates[0]
  const [selectedDate, setSelectedDate] = useState(defaultDate?.key || '')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const selectedDateData = availableDates.find(d => d.key === selectedDate)

  if (availableDates.length === 0) {
    return (
      <Card className="bg-card border border-border shadow-xl">
        <CardContent className="text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No earnings data yet</p>
          <p className="text-muted-foreground text-sm">Start adding entries to see your daily earnings history</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="flex justify-end gap-2">
        {/* Calendar Picker Button */}
        <button
          onClick={() => setIsCalendarOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg shadow-sm hover:bg-muted transition-colors"
          title="Open Calendar"
        >
          <Calendar className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Dropdown Selector */}
        <div className="w-full sm:w-56">
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger aria-label="Date" className="w-full">
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent>
              {availableDates.map((date) => (
                <SelectItem key={date.key} value={date.key}>
                  {date.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Picker Modal */}
      {isCalendarOpen && (
        <DatePicker
          selectedDate={selectedDate}
          availableDates={availableDates.map(d => d.key)}
          onDateSelect={setSelectedDate}
          onClose={() => setIsCalendarOpen(false)}
        />
      )}

      {/* Selected Date Display */}
      {selectedDateData && (
        <Card className="bg-card border border-border shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-card">
          <CardHeader className="transition-colors duration-300 hover:bg-muted rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-destructive" />
                {selectedDateData.data.dateDisplay} - Earnings
              </CardTitle>
              <div className="text-right">
                <div className="text-2xl font-bold text-destructive">
                  {selectedDateData.data.totalPoints.toLocaleString()} <span className="text-sm text-destructive">pts</span>
                </div>
                <div className="text-lg font-semibold text-foreground">
                  ${(selectedDateData.data.totalPoints / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div className="text-center p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl">
                <div className="text-xl font-bold text-destructive">{selectedDateData.data.totalEntries}</div>
                <p className="text-sm text-destructive">Total Entries</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="text-xl font-bold text-success">
                  {[...new Set(selectedDateData.data.entriesList.map((e: any) => e.accountId))].length}
                </div>
                <p className="text-sm text-success">Active Accounts</p>
              </div>
            </div>

            {/* Individual Entries List */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground mb-3">Individual Entries</h4>
              {selectedDateData.data.entriesList.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No entries for this date</p>
                  <p className="text-muted-foreground text-sm">Entries will appear here when you add them</p>
                </div>
              ) : (
                [...selectedDateData.data.entriesList]
                  .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((entry: any) => {
                  return (
                    <div key={entry.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white/20 ${getAvatarGradient(entry.accountColor || "blue")}`}>
                          {entry.accountName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{entry.accountName}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Added: {new Date(entry.createdAt).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}</span>
                            {entry.date !== entry.createdAt && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span>Entry date: {new Date(entry.date).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short'
                                })}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          +{entry.points.toLocaleString()} <span className="text-sm text-muted-foreground">pts</span>
                        </p>
                        <p className="text-sm text-muted-foreground">${(entry.points / 100).toFixed(2)}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}