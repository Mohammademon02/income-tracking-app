"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { addDays, dateKeyToDate, todayKey } from "@/lib/date-utils"

/**
 * The month grid behind the daily-earnings date field.
 *
 * Every cell key used to come from `localMidnight.toISOString()`, which is the
 * previous UTC day for anyone east of UTC — so in a +06 timezone clicking the
 * 5th selected the 4th, and no cell ever matched a date that had data. Keys are
 * now built from the calendar parts directly and compared as strings.
 */

const WINDOW_DAYS = 30

interface DatePickerProps {
  selectedDate: string
  availableDates: string[]
  onDateSelect: (date: string) => void
  onClose: () => void
}

export function DatePicker({ selectedDate, availableDates, onDateSelect, onClose }: DatePickerProps) {
  const today = todayKey()
  const [currentMonth, setCurrentMonth] = useState(() =>
    dateKeyToDate(`${today.slice(0, 7)}-01`)
  )

  const windowStart = addDays(today, -(WINDOW_DAYS - 1))
  const withData = new Set(availableDates)

  const generateCalendarDays = () => {
    const year = currentMonth.getUTCFullYear()
    const month = currentMonth.getUTCMonth()

    // Back up to the Sunday on or before the 1st.
    const firstDay = new Date(Date.UTC(year, month, 1))
    const cursor = new Date(firstDay)
    cursor.setUTCDate(cursor.getUTCDate() - firstDay.getUTCDay())

    // Six weeks, so the grid height never jumps between months.
    return Array.from({ length: 42 }, () => {
      const dateKey = cursor.toISOString().slice(0, 10)
      const day = {
        dateKey,
        day: cursor.getUTCDate(),
        isCurrentMonth: cursor.getUTCMonth() === month,
        isToday: dateKey === today,
        isSelected: dateKey === selectedDate,
        hasData: withData.has(dateKey),
        isInRange: dateKey >= windowStart && dateKey <= today,
      }

      cursor.setUTCDate(cursor.getUTCDate() + 1)
      return day
    })
  }

  const calendarDays = generateCalendarDays()
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() - 1, 1)))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 1)))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl p-4 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-foreground">
            {monthNames[currentMonth.getUTCMonth()]} {currentMonth.getUTCFullYear()}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => {
                if (day.isInRange) {
                  onDateSelect(day.dateKey)
                  onClose()
                }
              }}
              disabled={!day.isInRange}
              className={`
                aspect-square text-sm rounded transition-all duration-200 relative
                ${!day.isCurrentMonth ? 'text-muted-foreground' : 'text-foreground'}
                ${day.isToday ? 'ring-2 ring-primary' : ''}
                ${day.isSelected ? 'bg-destructive text-white' : ''}
                ${day.hasData && !day.isSelected ? 'bg-destructive-muted text-destructive font-medium' : ''}
                ${day.isInRange && !day.isSelected ? 'hover:bg-muted' : ''}
                ${!day.isInRange ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {day.day}
              {day.hasData && !day.isSelected && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-destructive rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-destructive-muted border border-destructive/30 rounded"></div>
            <span>Has earnings data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-primary rounded"></div>
            <span>Today</span>
          </div>
          <p className="text-muted-foreground mt-2">Showing the last {WINDOW_DAYS} days only</p>
        </div>
      </div>
    </div>
  )
}