"use client"

import { useState } from "react"
import { Calendar, TrendingUp } from "lucide-react"

import { AccountAvatar } from "@/components/account-avatar"
import { CountUp } from "@/components/motion/count-up"
import { SectionIcon } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDollars, formatPoints, pointsToDollars } from "@/lib/money"

/** Points earned in one month, broken down by account. */

export type MonthAccountTotal = {
  name: string
  color: string
  points: number
  entries: number
}

export type IncomeMonth = {
  monthName: string
  totalPoints: number
  totalEntries: number
  accounts: Record<string, MonthAccountTotal>
}

export type AvailableIncomeMonth = {
  key: string
  name: string
  data: IncomeMonth
}

export function MonthlyIncomeClient({
  availableMonths,
  currentMonthKey,
}: {
  availableMonths: AvailableIncomeMonth[]
  currentMonthKey: string
}) {
  const defaultMonth =
    availableMonths.find((month) => month.key === currentMonthKey) ?? availableMonths[0]
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth?.key ?? "")

  const selected = availableMonths.find((month) => month.key === selectedMonth)

  if (availableMonths.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="mx-auto mb-4 size-12 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">No income data yet</p>
          <p className="text-sm text-muted-foreground">
            Start adding entries to see your monthly income history
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!selected) return null

  const { data } = selected
  const accountTotals = Object.entries(data.accounts).sort(
    ([, a], [, b]) => b.points - a.points
  )
  const averagePerEntry =
    data.totalEntries > 0 ? Math.round(data.totalPoints / data.totalEntries) : 0

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <SectionIcon icon={TrendingUp} tone="primary" />
              {data.monthName}
            </CardTitle>
            <div className="text-right">
              <p className="metric text-primary">
                <CountUp value={data.totalPoints} format="points" />
                <span className="metric-unit ml-1.5">pts</span>
              </p>
              <p className="text-sm text-muted-foreground tabular-nums">
                {formatDollars(pointsToDollars(data.totalPoints))}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="panel rounded-xl p-4 text-center">
              <p className="metric-sm">{data.totalEntries}</p>
              <p className="label-caps mt-1">Total entries</p>
            </div>
            <div className="panel rounded-xl p-4 text-center">
              <p className="metric-sm">{accountTotals.length}</p>
              <p className="label-caps mt-1">Active accounts</p>
            </div>
            <div className="panel rounded-xl p-4 text-center">
              <p className="metric-sm">{formatPoints(averagePerEntry)}</p>
              <p className="label-caps mt-1">Avg per entry</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Account breakdown</h4>

            {accountTotals.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">
                Nothing logged in this month yet
              </p>
            ) : (
              accountTotals.map(([accountId, account]) => (
                <div
                  key={accountId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:bg-surface-2/60"
                >
                  <div className="flex items-center gap-3">
                    <AccountAvatar name={account.name} color={account.color} />
                    <div>
                      <p className="font-medium text-foreground">{account.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.entries} {account.entries === 1 ? "entry" : "entries"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="metric-sm">
                      {formatPoints(account.points)}
                      <span className="metric-unit ml-1">pts</span>
                    </p>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {formatDollars(pointsToDollars(account.points))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
