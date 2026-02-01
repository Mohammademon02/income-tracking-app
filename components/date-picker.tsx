"use client"

import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

interface DatePickerProps {
  selectedDate: string
  availableDates: string[]
  onDateSelect: (date: string) => void
  onClose: () => void
}

export function DatePicker({ selectedDate, availableDates, onDateSelect, onClose }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  // Generate calendar days for current month view
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday
    
    const days = []
    const currentDate = new Date(startDate)
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dateKey = currentDate.toISOString().split('T')[0]
      const isCurrentMonth = currentDate.getMonth() === month
      const isToday = dateKey === today.toISOString().split('T')[0]
      const isSelected = dateKey === selectedDate
      const hasData = availableDates.includes(dateKey)
      const isInRange = currentDate >= thirtyDaysAgo && currentDate <= today
      
      days.push({
        date: new Date(currentDate),
        dateKey,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        hasData,
        isInRange
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-4 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-slate-800">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
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
                ${!day.isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                ${day.isToday ? 'ring-2 ring-rose-500' : ''}
                ${day.isSelected ? 'bg-rose-500 text-white' : ''}
                ${day.hasData && !day.isSelected ? 'bg-rose-50 text-rose-700 font-medium' : ''}
                ${day.isInRange && !day.isSelected ? 'hover:bg-slate-100' : ''}
                ${!day.isInRange ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {day.day}
              {day.hasData && !day.isSelected && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-rose-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 text-xs text-slate-500 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-rose-50 border border-rose-200 rounded"></div>
            <span>Has earnings data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-rose-500 rounded"></div>
            <span>Today</span>
          </div>
          <p className="text-slate-400 mt-2">Showing last 30 days only</p>
        </div>
      </div>
    </div>
  )
}