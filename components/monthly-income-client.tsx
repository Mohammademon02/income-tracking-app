"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Calendar, ChevronDown } from "lucide-react"
import { getAvatarGradient } from "@/lib/avatar-utils"

interface MonthlyIncomeClientProps {
  monthlyData: Record<string, any>
  availableMonths: Array<{
    key: string
    name: string
    data: any
  }>
  currentMonthKey: string
}

export function MonthlyIncomeClient({ monthlyData, availableMonths, currentMonthKey }: MonthlyIncomeClientProps) {
  // Set default to current month if available, otherwise first available month
  const defaultMonth = availableMonths.find(m => m.key === currentMonthKey) || availableMonths[0]
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth?.key || '')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const selectedMonthData = availableMonths.find(m => m.key === selectedMonth)

  if (availableMonths.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl">
        <CardContent className="text-center py-12">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No income data yet</p>
          <p className="text-slate-400 text-sm">Start adding entries to see your monthly income history</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="flex justify-end">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors min-w-[200px] justify-between"
          >
            <span className="font-medium text-slate-700">
              {selectedMonthData?.name || "Select Month"}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {availableMonths.map((month) => (
                <button
                  key={month.key}
                  onClick={() => {
                    setSelectedMonth(month.key)
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors ${
                    selectedMonth === month.key ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'
                  }`}
                >
                  {month.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Month Display */}
      {selectedMonthData && (
        <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-white/90">
          <CardHeader className="transition-colors duration-300 hover:bg-slate-50/50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                {selectedMonthData.data.monthName}
              </CardTitle>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {selectedMonthData.data.totalPoints.toLocaleString()} <span className="text-sm text-purple-500">pts</span>
                </div>
                <div className="text-lg font-semibold text-slate-600">
                  ${(selectedMonthData.data.totalPoints / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="text-xl font-bold text-blue-600">{selectedMonthData.data.totalEntries}</div>
                <p className="text-sm text-blue-700">Total Entries</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="text-xl font-bold text-green-600">{Object.keys(selectedMonthData.data.accounts).length}</div>
                <p className="text-sm text-green-700">Active Accounts</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                <div className="text-xl font-bold text-orange-600">
                  {selectedMonthData.data.totalEntries > 0 ? Math.round(selectedMonthData.data.totalPoints / selectedMonthData.data.totalEntries) : 0}
                </div>
                <p className="text-sm text-orange-700">Avg per Entry</p>
              </div>
            </div>

            {/* Account Breakdown */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 mb-3">Account Breakdown</h4>
              {Object.entries(selectedMonthData.data.accounts).map(([accountId, accountData]: [string, any]) => {
                return (
                  <div key={accountId} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-slate-50/50 to-blue-50/50 border border-slate-100/50 transition-all duration-300 hover:from-slate-100/70 hover:to-blue-100/70 hover:border-slate-200/70">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white/20 ${getAvatarGradient(accountData.color || "blue")}`}>
                        {accountData.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{accountData.name}</p>
                        <p className="text-sm text-slate-500">{accountData.entries} entries</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-800">
                        {accountData.points.toLocaleString()} <span className="text-sm text-slate-500">pts</span>
                      </p>
                      <p className="text-sm text-slate-400">${(accountData.points / 100).toFixed(2)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}