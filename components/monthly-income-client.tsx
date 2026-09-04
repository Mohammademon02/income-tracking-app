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
import { TrendingUp, Calendar } from "lucide-react"
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

  const selectedMonthData = availableMonths.find(m => m.key === selectedMonth)

  if (availableMonths.length === 0) {
    return (
      <Card className="bg-card border border-border shadow-xl">
        <CardContent className="text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No income data yet</p>
          <p className="text-muted-foreground text-sm">Start adding entries to see your monthly income history</p>
        </CardContent>
      </Card>
    )
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
                <TrendingUp className="w-5 h-5 text-primary" />
                {selectedMonthData.data.monthName}
              </CardTitle>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {selectedMonthData.data.totalPoints.toLocaleString()} <span className="text-sm text-primary">pts</span>
                </div>
                <div className="text-lg font-semibold text-foreground">
                  ${(selectedMonthData.data.totalPoints / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="text-xl font-bold text-primary">{selectedMonthData.data.totalEntries}</div>
                <p className="text-sm text-primary">Total Entries</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="text-xl font-bold text-success">{Object.keys(selectedMonthData.data.accounts).length}</div>
                <p className="text-sm text-success">Active Accounts</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                <div className="text-xl font-bold text-warning">
                  {selectedMonthData.data.totalEntries > 0 ? Math.round(selectedMonthData.data.totalPoints / selectedMonthData.data.totalEntries) : 0}
                </div>
                <p className="text-sm text-warning">Avg per Entry</p>
              </div>
            </div>

            {/* Account Breakdown */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground mb-3">Account Breakdown</h4>
              {Object.entries(selectedMonthData.data.accounts).map(([accountId, accountData]: [string, any]) => {
                return (
                  <div key={accountId} className="flex items-center justify-between gap-3 rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white/20 ${getAvatarGradient(accountData.color || "blue")}`}>
                        {accountData.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{accountData.name}</p>
                        <p className="text-sm text-muted-foreground">{accountData.entries} entries</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {accountData.points.toLocaleString()} <span className="text-sm text-muted-foreground">pts</span>
                      </p>
                      <p className="text-sm text-muted-foreground">${(accountData.points / 100).toFixed(2)}</p>
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