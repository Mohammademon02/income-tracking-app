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
import { Wallet, Clock } from "lucide-react"
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

  const selectedMonthData = availableMonths.find(m => m.key === selectedMonth)

  if (availableMonths.length === 0) {
    return (
      <Card className="bg-card border border-border shadow-xl">
        <CardContent className="text-center py-12">
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No approved withdrawals yet</p>
          <p className="text-muted-foreground text-sm">Complete some withdrawal requests to see your monthly approved withdrawals</p>
        </CardContent>
      </Card>
    )
  }

  const getProcessingTimeColor = (days: number) => {
    if (days <= 7) return 'text-success bg-success-muted border-success/30'
    if (days <= 15) return 'text-primary bg-primary/10 border-primary/30'
    if (days <= 25) return 'text-warning bg-warning-muted border-warning/30'
    return 'text-destructive bg-destructive-muted border-destructive/30'
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
        <div className="w-full sm:w-56">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger aria-label="Month" className="w-full">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((month) => (
                <SelectItem key={month.key} value={month.key}>
                  {month.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selected Month Display */}
      {selectedMonthData && (
        <Card className="bg-card border border-border shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-card">
          <CardHeader className="transition-colors duration-300 hover:bg-muted rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                {selectedMonthData.data.monthName} - Approved Withdrawals
              </CardTitle>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  ${selectedMonthData.data.totalAmount.toFixed(2)}
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {(selectedMonthData.data.totalAmount * 100).toLocaleString()} pts
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div className="text-center p-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl">
                <div className="text-xl font-bold text-primary">{selectedMonthData.data.totalWithdrawals}</div>
                <p className="text-sm text-primary">Total Approved</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="text-xl font-bold text-success">
                  {[...new Set(selectedMonthData.data.withdrawalsList.map((w: any) => w.accountId))].length}
                </div>
                <p className="text-sm text-success">Active Accounts</p>
              </div>
            </div>

            {/* Individual Withdrawals List */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground mb-3">Individual Withdrawals</h4>
              {selectedMonthData.data.withdrawalsList.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No approved withdrawals this month</p>
                  <p className="text-muted-foreground text-sm">Withdrawals will appear here once they are completed</p>
                </div>
              ) : (
                [...selectedMonthData.data.withdrawalsList]
                  .sort((a: any, b: any) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())
                  .map((withdrawal: any) => {
                  return (
                    <div key={withdrawal.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white/20 ${getAvatarGradient(withdrawal.accountColor || "blue")}`}>
                          {withdrawal.accountName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{withdrawal.accountName}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Requested: {new Date(withdrawal.requestDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                            <span className="text-muted-foreground">•</span>
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
                        <p className="text-lg font-bold text-foreground">
                          ${withdrawal.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">{(withdrawal.amount * 100).toLocaleString()} pts</p>
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