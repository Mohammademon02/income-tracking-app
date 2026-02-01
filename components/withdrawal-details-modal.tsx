"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Clock, Calendar, DollarSign, CheckCircle, AlertCircle, TrendingUp, Timer } from "lucide-react"
import { getAvatarGradient } from "@/lib/avatar-utils"

interface WithdrawalDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    withdrawal: {
        id: string
        accountId: string
        accountName: string
        accountColor: string
        amount: number
        date: Date | string
        status: "PENDING" | "COMPLETED"
        completedAt?: Date | string | null
    } | null
    isFirstWithdrawal?: boolean
}

export function WithdrawalDetailsModal({
    isOpen,
    onClose,
    withdrawal,
    isFirstWithdrawal = false
}: WithdrawalDetailsModalProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
        }
    }, [isOpen])

    const handleClose = () => {
        setIsVisible(false)
        setTimeout(onClose, 200)
    }

    if (!isOpen || !withdrawal) return null

    const requestDate = new Date(withdrawal.date)
    const completedDate = withdrawal.completedAt ? new Date(withdrawal.completedAt) : null
    const currentDate = new Date()

    // Simple business days calculation
    const calculateBusinessDays = (startDate: Date, endDate: Date): number => {
        let businessDays = 0
        const current = new Date(startDate)

        while (current <= endDate) {
            const dayOfWeek = current.getDay()
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

            if (!isWeekend) {
                businessDays++
            }

            current.setDate(current.getDate() + 1)
        }

        return businessDays
    }

    // Helper function to add business days to a date
    const addBusinessDays = (startDate: Date, businessDaysToAdd: number): Date => {
        const result = new Date(startDate)
        let daysAdded = 0

        while (daysAdded < businessDaysToAdd) {
            result.setDate(result.getDate() + 1)
            const dayOfWeek = result.getDay()
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

            if (!isWeekend) {
                daysAdded++
            }
        }

        return result
    }

    const processingDays = completedDate
        ? calculateBusinessDays(requestDate, completedDate)
        : calculateBusinessDays(requestDate, currentDate)

    const expectedDays = isFirstWithdrawal ? 30 : 15
    const minExpectedDays = isFirstWithdrawal ? 25 : 12

    const getStatusInfo = () => {
        if (withdrawal.status === "COMPLETED") {
            return {
                icon: CheckCircle,
                color: "text-green-600 bg-green-50 border-green-200",
                label: "Approved",
                description: `Completed in ${processingDays} business days`
            }
        }

        if (processingDays <= minExpectedDays) {
            return {
                icon: Clock,
                color: "text-blue-600 bg-blue-50 border-blue-200",
                label: "Processing",
                description: `${processingDays} of ${minExpectedDays}-${expectedDays} expected business days`
            }
        }

        return {
            icon: AlertCircle,
            color: "text-red-600 bg-red-50 border-red-200",
            label: "Delayed",
            description: `${processingDays} business days (expected: ${minExpectedDays}-${expectedDays} business days)`
        }
    }

    const statusInfo = getStatusInfo()
    const StatusIcon = statusInfo.icon

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
            <div
                className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${getAvatarGradient(withdrawal.accountColor || "blue")}`}>
                                {withdrawal.accountName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Withdrawal Details</h2>
                                <p className="text-slate-300">{withdrawal.accountName}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Amount and Status Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4 text-slate-300" />
                                <span className="text-sm text-slate-300">Amount</span>
                            </div>
                            <div className="text-2xl font-bold">${withdrawal.amount.toFixed(2)}</div>
                            <div className="text-sm text-slate-300">{(withdrawal.amount * 100).toLocaleString()} pts</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <StatusIcon className="w-4 h-4 text-slate-300" />
                                <span className="text-sm text-slate-300">Status</span>
                            </div>
                            <div className="text-lg font-semibold">{statusInfo.label}</div>
                            <div className="text-sm text-slate-300">{processingDays} business days</div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 250px)' }}>
                    {/* Timeline Section */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-slate-600" />
                            <h3 className="text-lg font-semibold text-slate-800">Processing Timeline</h3>
                            {isFirstWithdrawal && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                                    First Withdrawal
                                </Badge>
                            )}
                        </div>

                        {/* Simple Progress Bar */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">Progress</span>
                                <span className="text-sm text-slate-500">
                                    {withdrawal.status === "COMPLETED" ? "100%" : `${Math.round((processingDays / expectedDays) * 100)}%`}
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${withdrawal.status === "COMPLETED" ? "bg-green-500" :
                                        processingDays <= minExpectedDays ? "bg-blue-500" : "bg-orange-500"
                                        }`}
                                    style={{
                                        width: withdrawal.status === "COMPLETED" ? "100%" : `${Math.min((processingDays / expectedDays) * 100, 100)}%`
                                    }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>Day 0</span>
                                <span>Day {expectedDays}</span>
                            </div>
                        </div>

                        {/* Timeline Steps */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-500"></div>
                                <div className="flex-1 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-green-700">Request Submitted</div>
                                        <div className="text-sm text-slate-500">Withdrawal request received</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-slate-600">Day 0</div>
                                        <div className="text-xs text-slate-500">
                                            {requestDate.toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 ${processingDays >= 1 ? 'bg-green-500 border-green-500' : 'bg-white border-slate-300'
                                    }`}></div>
                                <div className="flex-1 flex items-center justify-between">
                                    <div>
                                        <div className={`font-medium ${processingDays >= 1 ? 'text-green-700' : 'text-slate-600'}`}>
                                            Initial Review
                                        </div>
                                        <div className="text-sm text-slate-500">Request under initial review</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-slate-600">Day 1</div>
                                        <div className="text-xs text-slate-500">
                                            {addBusinessDays(requestDate, 1).toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 ${processingDays >= (isFirstWithdrawal ? 7 : 3) ? 'bg-green-500 border-green-500' :
                                    processingDays >= 1 ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'
                                    }`}></div>
                                <div className="flex-1 flex items-center justify-between">
                                    <div>
                                        <div className={`font-medium ${processingDays >= (isFirstWithdrawal ? 7 : 3) ? 'text-green-700' : 'text-slate-600'
                                            }`}>
                                            Verification
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            {isFirstWithdrawal ? "Account verification in progress" : "Standard verification"}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-slate-600">Day {isFirstWithdrawal ? 7 : 3}</div>
                                        <div className="text-xs text-slate-500">
                                            {addBusinessDays(requestDate, isFirstWithdrawal ? 7 : 3).toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 ${withdrawal.status === "COMPLETED" ? 'bg-green-500 border-green-500' :
                                    processingDays >= expectedDays ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-300'
                                    }`}></div>
                                <div className="flex-1 flex items-center justify-between">
                                    <div>
                                        <div className={`font-medium ${withdrawal.status === "COMPLETED" ? 'text-green-700' : 'text-slate-600'
                                            }`}>
                                            Completion
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            {withdrawal.status === "COMPLETED" ? "Payment approved and sent" : "Expected completion"}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-slate-600">Day {expectedDays}</div>
                                        <div className="text-xs text-slate-500">
                                            {withdrawal.status === "COMPLETED" && completedDate ?
                                                completedDate.toLocaleDateString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                }) :
                                                addBusinessDays(requestDate, expectedDays).toLocaleDateString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <Card className="border border-slate-200 bg-slate-50 mb-6">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-800 mb-1">Expected Processing Time</h4>
                                    <p className="text-sm text-slate-600">
                                        {isFirstWithdrawal
                                            ? "First withdrawals typically take 25-30 business days (excluding weekends and US holidays)."
                                            : "Subsequent withdrawals are processed within 12-15 business days (excluding weekends and US holidays)."
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-600">Request Date</label>
                            <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-800">
                                    {requestDate.toLocaleDateString('en-GB', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600">Processing Time</label>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border mt-1 ${statusInfo.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {processingDays} business days
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-4 bg-slate-50">
                    <div className="flex justify-end">
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            className="hover:bg-slate-100 transition-colors"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}