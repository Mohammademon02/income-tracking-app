"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, ChevronDown, Clock } from "lucide-react"
import { getAvatarGradient } from "@/lib/avatar-utils"

interface MonthlyWithdrawalsClientProps {
  monthlyData: Record<string, any>
  availableMonths: Array<{
    key: string
    name: string
    data: any
  }>
  currentMonthKey: string
}

export function MonthlyWithdrawalsClient({ monthlyData, availableMonths, currentMonthKey }: MonthlyWithdrawalsClientProps) {
  // Set default to current month if available, otherwise first available month
  const defaultMonth = availableMonths.find(m => m.key === currentMonthKey) || availableMonths[0]
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth?.key || '')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const selectedMonthData = availableMonths.find(m => m.key === selectedMonth)

  if (availableMonths.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl">
        <CardContent className="text-center py-12">
          <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No approved withdrawals yet</p>
          <p className="text-slate-400 text-sm">Complete some withdrawal requests to see your monthly approved withdrawals</p>
        </CardContent>
      </Card>
    )
  }

  const getProcessingTimeColor = (days: number) => {
    if (days <= 7) return 'text-green-600 bg-green-50 border-green-200'
    if (days <= 15) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (days <= 25) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getProcessingTimeLabel = (days: number) => {
    if (days <= 7) return '⚡ Fast'
    if (days <= 15) return '✅ Normal'
    if (days <= 25) return '🐌 Slow'
    return '🔴 Very Slow'
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
                    selectedMonth === month.key ? 'bg-cyan-50 text-cyan-700 font-medium' : 'text-slate-700'
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
                <Wallet className="w-5 h-5 text-cyan-600" />
                {selectedMonthData.data.monthName} - Approved Withdrawals
              </CardTitle>
              <div className="text-right">
                <div className="text-2xl font-bold text-cyan-600">
                  ${selectedMonthData.data.totalAmount.toFixed(2)}
                </div>
                <div className="text-lg font-semibold text-slate-600">
                  {(selectedMonthData.data.totalAmount * 100).toLocaleString()} pts
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div className="text-center p-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl">
                <div className="text-xl font-bold text-cyan-600">{selectedMonthData.data.totalWithdrawals}</div>
                <p className="text-sm text-cyan-700">Total Approved</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="text-xl font-bold text-green-600">
                  {[...new Set(selectedMonthData.data.withdrawalsList.map((w: any) => w.accountId))].length}
                </div>
                <p className="text-sm text-green-700">Active Accounts</p>
              </div>
            </div>

            {/* Individual Withdrawals List */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 mb-3">Individual Withdrawals</h4>
              {selectedMonthData.data.withdrawalsList.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">No approved withdrawals this month</p>
                  <p className="text-slate-400 text-sm">Withdrawals will appear here once they are completed</p>
                </div>
              ) : (
                selectedMonthData.data.withdrawalsList
                  .sort((a: any, b: any) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())
                  .map((withdrawal: any) => {
                  return (
                    <div key={withdrawal.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-slate-50/50 to-cyan-50/50 border border-slate-100/50 transition-all duration-300 hover:from-slate-100/70 hover:to-cyan-100/70 hover:border-slate-200/70">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white/20 ${getAvatarGradient(withdrawal.accountColor || "blue")}`}>
                          {withdrawal.accountName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{withdrawal.accountName}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>Requested: {new Date(withdrawal.requestDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                            <span className="text-slate-300">•</span>
                            <span>Completed: {new Date(withdrawal.completedDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getProcessingTimeColor(withdrawal.processingDays)}`}>
                              <Clock className="w-3 h-3" />
                              {withdrawal.processingDays} days processing
                              <span className="ml-1">
                                {getProcessingTimeLabel(withdrawal.processingDays)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-800">
                          ${withdrawal.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-400">{(withdrawal.amount * 100).toLocaleString()} pts</p>
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