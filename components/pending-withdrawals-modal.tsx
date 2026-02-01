"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Clock, Wallet, Calendar, DollarSign, TrendingUp } from "lucide-react"
import { getAvatarGradient } from "@/lib/avatar-utils"
import { WithdrawalDetailsModal } from "@/components/withdrawal-details-modal"

interface PendingWithdrawal {
  id: string
  accountId: string
  accountName: string
  accountColor: string
  amount: number
  date: Date | string
  status: string
}

interface PendingWithdrawalsModalProps {
  isOpen: boolean
  onClose: () => void
  withdrawals: PendingWithdrawal[]
  allWithdrawals?: any[] // All withdrawals for first withdrawal detection
}

export function PendingWithdrawalsModal({ isOpen, onClose, withdrawals, allWithdrawals = [] }: PendingWithdrawalsModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<PendingWithdrawal | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 200) // Wait for animation to complete
  }

  if (!isOpen) return null

  const totalPendingAmount = withdrawals.reduce((sum, w) => sum + w.amount, 0)
  const totalPendingPoints = totalPendingAmount * 100

  // Group withdrawals by account
  const withdrawalsByAccount = withdrawals.reduce((acc, withdrawal) => {
    if (!acc[withdrawal.accountId]) {
      acc[withdrawal.accountId] = {
        accountName: withdrawal.accountName,
        accountColor: withdrawal.accountColor,
        withdrawals: [],
        totalAmount: 0
      }
    }
    acc[withdrawal.accountId].withdrawals.push(withdrawal)
    acc[withdrawal.accountId].totalAmount += withdrawal.amount
    return acc
  }, {} as Record<string, any>)

  const getDaysAgo = (dateString: Date | string) => {
    const requestDate = new Date(dateString)
    const today = new Date()
    
    // Calculate business days (US-based)
    let businessDays = 0
    const current = new Date(requestDate)
    
    // US Federal Holidays (comprehensive list)
    const getUSHolidays = (year: number) => [
      new Date(year, 0, 1),   // New Year's Day - January 1
      // Martin Luther King Jr. Day - 3rd Monday in January
      new Date(year, 0, (3 - 1) * 7 + 1 + (1 - new Date(year, 0, 1).getDay() + 7) % 7),
      // Presidents' Day - 3rd Monday in February  
      new Date(year, 1, (3 - 1) * 7 + 1 + (1 - new Date(year, 1, 1).getDay() + 7) % 7),
      // Memorial Day - Last Monday in May
      new Date(year, 4, 31 - (new Date(year, 4, 31).getDay() + 6) % 7),
      new Date(year, 5, 19), // Juneteenth - June 19 (federal holiday since 2021)
      new Date(year, 6, 4),   // Independence Day - July 4
      // Labor Day - 1st Monday in September
      new Date(year, 8, 1 + (1 - new Date(year, 8, 1).getDay() + 7) % 7),
      // Columbus Day - 2nd Monday in October
      new Date(year, 9, (2 - 1) * 7 + 1 + (1 - new Date(year, 9, 1).getDay() + 7) % 7),
      new Date(year, 10, 11), // Veterans Day - November 11
      // Thanksgiving - 4th Thursday in November
      new Date(year, 10, (4 - 1) * 7 + 1 + (4 - new Date(year, 10, 1).getDay() + 7) % 7),
      new Date(year, 11, 25), // Christmas Day - December 25
    ]
    
    const holidays = [
      ...getUSHolidays(requestDate.getFullYear()),
      ...getUSHolidays(today.getFullYear())
    ]
    
    while (current <= today) {
      const dayOfWeek = current.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 // Sunday = 0, Saturday = 6
      const isHoliday = holidays.some(holiday => 
        holiday.toDateString() === current.toDateString()
      )
      
      if (!isWeekend && !isHoliday) {
        businessDays++
      }
      
      current.setDate(current.getDate() + 1)
    }
    
    return businessDays
  }

  const getWaitingTimeColor = (days: number) => {
    if (days <= 7) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (days <= 15) return 'text-orange-600 bg-orange-50 border-orange-200'
    if (days <= 25) return 'text-red-600 bg-red-50 border-red-200'
    return 'text-red-700 bg-red-100 border-red-300'
  }

  const getWaitingTimeLabel = (days: number) => {
    if (days <= 7) return '🕐 Recent'
    if (days <= 15) return '⏳ Waiting'
    if (days <= 25) return '⚠️ Delayed'
    return '🚨 Very Delayed'
  }

  // Helper function to check if this is the first withdrawal for an account
  const isFirstWithdrawal = (withdrawal: PendingWithdrawal) => {
    // Use allWithdrawals if available, otherwise fall back to withdrawals
    const withdrawalsToCheck = allWithdrawals.length > 0 ? allWithdrawals : withdrawals
    
    // Get all withdrawals for this account
    const accountWithdrawals = withdrawalsToCheck.filter(w => w.accountId === withdrawal.accountId)
    
    // If only one withdrawal for this account, it's the first
    if (accountWithdrawals.length === 1) {
      return true
    }
    
    // Sort by date (earliest first)
    const sortedWithdrawals = accountWithdrawals.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateA - dateB
    })
    
    // Check if this withdrawal is the first one
    return sortedWithdrawals[0].id === withdrawal.id
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div 
        className={`bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Pending Withdrawals</h2>
                <p className="text-orange-100">Withdrawal requests awaiting completion</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-orange-200" />
                <span className="text-sm text-orange-200">Total Pending</span>
              </div>
              <div className="text-2xl font-bold">${totalPendingAmount.toFixed(2)}</div>
              <div className="text-sm text-orange-200">{totalPendingPoints.toLocaleString()} pts</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-200" />
                <span className="text-sm text-orange-200">Total Requests</span>
              </div>
              <div className="text-2xl font-bold">{withdrawals.length}</div>
              <div className="text-sm text-orange-200">Awaiting approval</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-orange-200" />
                <span className="text-sm text-orange-200">Active Accounts</span>
              </div>
              <div className="text-2xl font-bold">{Object.keys(withdrawalsByAccount).length}</div>
              <div className="text-sm text-orange-200">With pending requests</div>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No Pending Withdrawals</h3>
              <p className="text-slate-500">All your withdrawal requests have been processed!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Account Groups */}
              {Object.entries(withdrawalsByAccount).map(([accountId, accountData]: [string, any]) => (
                <Card key={accountId} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white/20 ${getAvatarGradient(accountData.accountColor || "blue")}`}>
                          {accountData.accountName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{accountData.accountName}</CardTitle>
                          <p className="text-sm text-slate-500">{accountData.withdrawals.length} pending requests</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-orange-600">
                          ${accountData.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-500">
                          {(accountData.totalAmount * 100).toLocaleString()} pts
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {accountData.withdrawals
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((withdrawal: any) => {
                        const daysAgo = getDaysAgo(withdrawal.date)
                        return (
                          <div 
                            key={withdrawal.id} 
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50/50 to-orange-50/50 rounded-lg border border-slate-100 hover:from-slate-100/70 hover:to-orange-100/70 transition-all duration-200 cursor-pointer"
                            onClick={() => setSelectedWithdrawal(withdrawal)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-slate-800">
                                    ${withdrawal.amount.toFixed(2)}
                                  </span>
                                  <span className="text-sm text-slate-500">
                                    ({(withdrawal.amount * 100).toLocaleString()} pts)
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>Requested: {new Date(withdrawal.date).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}</span>
                                  <span className="text-slate-300">•</span>
                                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getWaitingTimeColor(daysAgo)}`}>
                                    <Clock className="w-3 h-3" />
                                    {daysAgo} business days ago
                                    <span className="ml-1">
                                      {getWaitingTimeLabel(daysAgo)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                              Pending
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Recent (≤7 business days)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Waiting (8-15 business days)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Delayed (&gt;15 business days)</span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Withdrawal Details Modal */}
      <WithdrawalDetailsModal
        isOpen={!!selectedWithdrawal}
        onClose={() => setSelectedWithdrawal(null)}
        withdrawal={selectedWithdrawal ? {
          ...selectedWithdrawal,
          status: selectedWithdrawal.status as "PENDING" | "COMPLETED",
          completedAt: null,
          date: selectedWithdrawal.date
        } : null}
        isFirstWithdrawal={selectedWithdrawal ? isFirstWithdrawal(selectedWithdrawal) : false}
      />
    </div>
  )
}