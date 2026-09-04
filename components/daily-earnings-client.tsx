"use client"

import { useState } from "react"
import { Calendar, Clock, TrendingUp } from "lucide-react"

import { AccountAvatar } from "@/components/account-avatar"
import { DatePicker } from "@/components/date-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate, formatTimeOfDay, toDateKey } from "@/lib/date-utils"
import { formatDollars, formatPoints, pointsToDollars } from "@/lib/money"

/**
 * Entries logged on one calendar date.
 *
 * The list used to sort and label itself by `entry.createdAt` — a field the
 * page never put on these rows. Every entry therefore rendered
 * "Added: Invalid Date", and the sort compared `NaN` to `NaN`, so the order was
 * whatever the database happened to return.
 */

export type DayEntry = {
  id: string
  accountId: string
  accountName: string
  accountColor: string
  points: number
  date: Date
  createdAt: Date
}

export type DayGroup = {
  dateDisplay: string
  totalPoints: number
  totalEntries: number
  entriesList: DayEntry[]
}

export type AvailableDate = {
  key: string
  name: string
  data: DayGroup
}

export function DailyEarningsClient({
  availableDates,
  todayKey,
}: {
  availableDates: AvailableDate[]
  todayKey: string
}) {
  const defaultDate = availableDates.find((date) => date.key === todayKey) ?? availableDates[0]
  const [selectedDate, setSelectedDate] = useState(defaultDate?.key ?? "")
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const selected = availableDates.find((date) => date.key === selectedDate)

  if (availableDates.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="mx-auto mb-4 size-12 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">No earnings data yet</p>
          <p className="text-sm text-muted-foreground">
            Start adding entries to see your daily earnings history
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!selected) return null

  const { data } = selected
  const activeAccounts = new Set(data.entriesList.map((entry) => entry.accountId)).size

  // Copy before sorting: `.sort()` mutates, and this list comes from a prop.
  const sortedEntries = [...data.entriesList].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsCalendarOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 shadow-sm transition-colors hover:bg-muted"
          aria-label="Open calendar"
        >
          <Calendar className="size-4 text-muted-foreground" />
        </button>

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

      {isCalendarOpen && (
        <DatePicker
          selectedDate={selectedDate}
          availableDates={availableDates.map((date) => date.key)}
          onDateSelect={setSelectedDate}
          onClose={() => setIsCalendarOpen(false)}
        />
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              {data.dateDisplay}
            </CardTitle>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatPoints(data.totalPoints)} <span className="text-sm">pts</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDollars(pointsToDollars(data.totalPoints))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/50 p-4 text-center">
              <div className="text-xl font-bold text-foreground">{data.totalEntries}</div>
              <p className="text-sm text-muted-foreground">Total entries</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/50 p-4 text-center">
              <div className="text-xl font-bold text-foreground">{activeAccounts}</div>
              <p className="text-sm text-muted-foreground">Active accounts</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Individual entries</h4>

            {sortedEntries.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="mx-auto mb-2 size-8 text-muted-foreground" />
                <p className="text-muted-foreground">No entries for this date</p>
                <p className="text-sm text-muted-foreground">
                  Entries appear here when you add them
                </p>
              </div>
            ) : (
              sortedEntries.map((entry) => {
                // The row is grouped by its entry date, so repeating that date
                // is only worth doing when the entry was logged on a different
                // day from the one it counts towards — a backdated entry.
                const loggedOn = toDateKey(new Date(entry.createdAt))
                const countsTowards = toDateKey(new Date(entry.date))

                return (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <AccountAvatar name={entry.accountName} color={entry.accountColor} />
                      <div>
                        <p className="font-medium text-foreground">{entry.accountName}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="size-3" />
                          <span>Added: {formatTimeOfDay(new Date(entry.createdAt))}</span>
                          {loggedOn !== countsTowards && (
                            <>
                              <span aria-hidden>•</span>
                              <span>Entry date: {formatDate(entry.date)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        +{formatPoints(entry.points)}{" "}
                        <span className="text-sm text-muted-foreground">pts</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDollars(pointsToDollars(entry.points))}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
