"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, ChevronDown, Calendar, Clock } from "lucide-react"
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const selectedDateData = availableDates.find(d => d.key === selectedDate)

  if (availableDates.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl">
        <CardContent className="text-center py-12">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No earnings data yet</p>
          <p className="text-slate-400 text-sm">Start adding entries to see your daily earnings history</p>
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
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
          title="Open Calendar"
        >
          <Calendar className="w-4 h-4 text-slate-500" />
        </button>

        {/* Dropdown Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors min-w-[250px] justify-between"
          >
            <span className="font-medium text-slate-700">
              {selectedDateData?.name || "Select Date"}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {availableDates.map((date) => (
                <button
                  key={date.key}
                  onClick={() => {
                    setSelectedDate(date.key)
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors ${
                    selectedDate === date.key ? 'bg-rose-50 text-rose-700 font-medium' : 'text-slate-700'
                  }`}
                >
                  {date.name}
                </button>
              ))}
            </div>
          )}
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
        <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-white/90">
          <CardHeader className="transition-colors duration-300 hover:bg-slate-50/50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-rose-600" />
                {selectedDateData.data.dateDisplay} - Earnings
              </CardTitle>
              <div className="text-right">
                <div className="text-2xl font-bold text-rose-600">
                  {selectedDateData.data.totalPoints.toLocaleString()} <span className="text-sm text-rose-500">pts</span>
                </div>
                <div className="text-lg font-semibold text-slate-600">
                  ${(selectedDateData.data.totalPoints / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div className="text-center p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl">
                <div className="text-xl font-bold text-rose-600">{selectedDateData.data.totalEntries}</div>
                <p className="text-sm text-rose-700">Total Entries</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="text-xl font-bold text-green-600">
                  {[...new Set(selectedDateData.data.entriesList.map((e: any) => e.accountId))].length}
                </div>
                <p className="text-sm text-green-700">Active Accounts</p>
              </div>
            </div>

            {/* Individual Entries List */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 mb-3">Individual Entries</h4>
              {selectedDateData.data.entriesList.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">No entries for this date</p>
                  <p className="text-slate-400 text-sm">Entries will appear here when you add them</p>
                </div>
              ) : (
                selectedDateData.data.entriesList
                  .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((entry: any) => {
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-slate-50/50 to-rose-50/50 border border-slate-100/50 transition-all duration-300 hover:from-slate-100/70 hover:to-rose-100/70 hover:border-slate-200/70">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white/20 ${getAvatarGradient(entry.accountColor || "blue")}`}>
                          {entry.accountName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{entry.accountName}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>Added: {new Date(entry.createdAt).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}</span>
                            {entry.date !== entry.createdAt && (
                              <>
                                <span className="text-slate-300">•</span>
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
                        <p className="text-lg font-bold text-slate-800">
                          +{entry.points.toLocaleString()} <span className="text-sm text-slate-500">pts</span>
                        </p>
                        <p className="text-sm text-slate-400">${(entry.points / 100).toFixed(2)}</p>
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