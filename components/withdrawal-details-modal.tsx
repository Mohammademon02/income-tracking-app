"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Clock, Calendar, DollarSign, CheckCircle, AlertCircle, TrendingUp } from "lucide-react"
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
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden'
        } else {
            // Restore body scroll when modal is closed
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    const handleClose = () => {
        setIsVisible(false)
        setTimeout(() => {
            onClose()
            document.body.style.overflow = 'unset'
        }, 200)
    }

    if (!mounted || !isOpen || !withdrawal) return null

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

    // Different header colors for first withdrawal vs regular withdrawal
    const headerGradient = isFirstWithdrawal
        ? "bg-gradient-to-r from-indigo-600 to-purple-700" // Special gradient for first withdrawal
        : "bg-gradient-to-r from-slate-800 to-slate-900"   // Regular gradient for subsequent withdrawals

    const modalContent = (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-2 sm:p-4"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999
            }}
            onClick={handleClose}
        >
            <div
                className={`bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`${headerGradient} text-white p-4 sm:p-6 shrink-0 rounded-t-xl`}>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base ${getAvatarGradient(withdrawal.accountColor || "blue")}`}>
                                {withdrawal.accountName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg sm:text-xl font-bold truncate">Withdrawal Details</h2>
                                <p className="text-slate-300 text-sm truncate">{withdrawal.accountName}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors shrink-0"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>

                    {/* Amount and Status Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-slate-300" />
                                <span className="text-xs sm:text-sm text-slate-300">Amount</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-bold">${withdrawal.amount.toFixed(2)}</div>
                            <div className="text-xs sm:text-sm text-slate-300">{(withdrawal.amount * 100).toLocaleString()} pts</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4 text-slate-300" />
                                <span className="text-xs sm:text-sm text-slate-300">Status</span>
                            </div>
                            <div className="text-base sm:text-lg font-semibold">{statusInfo.label}</div>
                            <div className="text-xs sm:text-sm text-slate-300">{processingDays} business days</div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6">
                        {/* Timeline Section */}
                        <div className="mb-4 sm:mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 sm:mb-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                                    <h3 className="text-base sm:text-lg font-semibold text-slate-800">Processing Timeline</h3>
                                </div>
                                {isFirstWithdrawal && (
                                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs">
                                        First Withdrawal
                                    </Badge>
                                )}
                            </div>

                            {/* Simple Progress Bar */}
                            <div className="mb-4 sm:mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs sm:text-sm font-medium text-slate-600">Progress</span>
                                    <span className="text-xs sm:text-sm text-slate-500">
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

                            {/* Timeline Steps - Mobile Optimized */}
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-3 h-3 rounded-full bg-green-500 mt-0.5"></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-green-700 text-sm">Request Submitted</div>
                                        <div className="text-xs text-slate-500">Day 0 - {requestDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className={`w-3 h-3 rounded-full mt-0.5 ${processingDays >= 1 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-medium text-sm ${processingDays >= 1 ? 'text-green-700' : 'text-slate-600'}`}>
                                            Initial Review
                                        </div>
                                        <div className="text-xs text-slate-500">Day 1 - {addBusinessDays(requestDate, 1).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className={`w-3 h-3 rounded-full mt-0.5 ${processingDays >= (isFirstWithdrawal ? 7 : 3) ? 'bg-green-500' :
                                        processingDays >= 1 ? 'bg-blue-500' : 'bg-slate-300'
                                        }`}></div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-medium text-sm ${processingDays >= (isFirstWithdrawal ? 7 : 3) ? 'text-green-700' : 'text-slate-600'}`}>
                                            Verification
                                        </div>
                                        <div className="text-xs text-slate-500">Day {isFirstWithdrawal ? 7 : 3} - {addBusinessDays(requestDate, isFirstWithdrawal ? 7 : 3).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className={`w-3 h-3 rounded-full mt-0.5 ${withdrawal.status === "COMPLETED" ? 'bg-green-500' :
                                        processingDays >= expectedDays ? 'bg-orange-500' : 'bg-slate-300'
                                        }`}></div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-medium text-sm ${withdrawal.status === "COMPLETED" ? 'text-green-700' : 'text-slate-600'}`}>
                                            Completion
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Day {expectedDays} - {withdrawal.status === "COMPLETED" && completedDate ?
                                                completedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) :
                                                addBusinessDays(requestDate, expectedDays).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Card - Mobile Optimized */}
                        <Card className="border border-slate-200 bg-slate-50 mb-4">
                            <CardContent className="p-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-medium text-slate-800 mb-1 text-sm">Expected Processing Time</h4>
                                        <p className="text-xs text-slate-600">
                                            {isFirstWithdrawal
                                                ? "First withdrawals: 25-30 business days"
                                                : "Subsequent withdrawals: 12-15 business days"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Details - Mobile Optimized */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-600">Request Date</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="text-sm text-slate-800">
                                        {requestDate.toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">Processing Time</label>
                                <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border mt-1 ${statusInfo.color}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {processingDays} business days
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-3 sm:p-4 bg-slate-50 shrink-0 rounded-b-xl">
                    <div className="flex justify-end">
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            className="hover:bg-slate-100 transition-colors w-full sm:w-auto"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )

    return createPortal(modalContent, document.body)
}