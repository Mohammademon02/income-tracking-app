"use client"

import { useState } from "react"
import { Wallet } from "lucide-react"

import { AccountAvatar } from "@/components/account-avatar"
import { ProcessingTimeBadge } from "@/components/processing-time-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/date-utils"
import { dollarsToPoints, formatDollars, formatPoints } from "@/lib/money"

/**
 * Approved withdrawals for one month.
 *
 * This screen was the last one still carrying its own copy of the
 * processing-time thresholds — a fourth set of cutoffs, rendered as emoji
 * ratings, next to two hardcoded pastel gradients that were invisible in dark
 * mode and two `toLocaleDateString()` calls that shifted every stored date back
 * a day west of UTC.
 */

export type MonthWithdrawal = {
  id: string
  accountId: string
  accountName: string
  accountColor: string
  amount: number
  requestDate: Date
  completedDate: Date
}

export type MonthGroup = {
  monthName: string
  totalAmount: number
  totalWithdrawals: number
  withdrawalsList: MonthWithdrawal[]
}

export type AvailableMonth = {
  key: string
  name: string
  data: MonthGroup
}

export function MonthlyWithdrawalsClient({
  availableMonths,
  currentMonthKey,
}: {
  availableMonths: AvailableMonth[]
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
          <Wallet className="mx-auto mb-4 size-12 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">No approved withdrawals yet</p>
          <p className="text-sm text-muted-foreground">
            Complete some withdrawal requests to see your monthly approved withdrawals
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!selected) return null

  const { data } = selected
  const activeAccounts = new Set(data.withdrawalsList.map((w) => w.accountId)).size

  // Copy before sorting: `.sort()` mutates, and this list comes straight from a
  // prop.
  const sortedWithdrawals = [...data.withdrawalsList].sort(
    (a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime()
  )

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
              <Wallet className="size-5 text-primary" />
              {data.monthName} — approved withdrawals
            </CardTitle>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatDollars(data.totalAmount)}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatPoints(dollarsToPoints(data.totalAmount))} pts
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/50 p-4 text-center">
              <div className="text-xl font-bold text-foreground">{data.totalWithdrawals}</div>
              <p className="text-sm text-muted-foreground">Total approved</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/50 p-4 text-center">
              <div className="text-xl font-bold text-foreground">{activeAccounts}</div>
              <p className="text-sm text-muted-foreground">Active accounts</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Individual withdrawals</h4>

            {sortedWithdrawals.length === 0 ? (
              <div className="py-8 text-center">
                <Wallet className="mx-auto mb-2 size-8 text-muted-foreground" />
                <p className="text-muted-foreground">No approved withdrawals this month</p>
                <p className="text-sm text-muted-foreground">
                  Withdrawals appear here once they are completed
                </p>
              </div>
            ) : (
              sortedWithdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <AccountAvatar name={withdrawal.accountName} color={withdrawal.accountColor} />
                    <div>
                      <p className="font-medium text-foreground">{withdrawal.accountName}</p>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>Requested: {formatDate(withdrawal.requestDate)}</span>
                        <span aria-hidden>•</span>
                        <span>Completed: {formatDate(withdrawal.completedDate)}</span>
                      </div>
                      <ProcessingTimeBadge
                        className="mt-1"
                        requestedAt={withdrawal.requestDate}
                        completedAt={withdrawal.completedDate}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">
                      {formatDollars(withdrawal.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatPoints(dollarsToPoints(withdrawal.amount))} pts
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
