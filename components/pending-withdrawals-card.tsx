"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, ArrowUpRight } from "lucide-react"
import { PendingWithdrawalsModal } from "@/components/pending-withdrawals-modal"

interface PendingWithdrawal {
    id: string
    accountId: string
    accountName: string
    accountColor: string
    amount: number
    date: Date | string
    status: string
}

interface PendingWithdrawalsCardProps {
    pendingWithdrawals: PendingWithdrawal[]
    totalPending: number
    allWithdrawals?: any[] // All withdrawals for first withdrawal detection
}

export function PendingWithdrawalsCard({ pendingWithdrawals, totalPending, allWithdrawals = [] }: PendingWithdrawalsCardProps) {
    const [isPendingModalOpen, setIsPendingModalOpen] = useState(false)

    return (
        <>
            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg shadow-orange-200/50 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-300/60 cursor-pointer"
                onClick={() => setIsPendingModalOpen(true)}
            >
                {/* Simple Animated Wave Background - matching other cards */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/15 to-transparent wave-flow"></div>
                    <div className="absolute top-6 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent wave-flow-delayed"></div>
                    <div className="absolute top-12 right-8 w-1.5 h-1.5 bg-white/30 rounded-full wave-pulse"></div>
                    <div className="absolute top-16 right-16 w-1 h-1 bg-white/25 rounded-full wave-pulse" style={{ animationDelay: '0.7s' }}></div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 transition-all duration-500 hover:bg-white/20 float-animation" style={{ animationDelay: '0.8s' }}></div>

                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-orange-100">Pending Withdrawals</CardTitle>
                    <Clock className="h-5 w-5 text-orange-200 wave-pulse" style={{ animationDelay: '0.3s' }} />
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold">{totalPending.toLocaleString()} <span className="text-lg text-orange-200">pts</span></div>
                    <div className="text-xl font-semibold text-orange-100 mb-2">${(totalPending / 100).toFixed(2)}</div>
                    <div className="flex items-center justify-between mt-2 text-orange-100">
                        <div className="flex items-center">
                            <ArrowUpRight className="w-4 h-4 mr-1 wave-pulse" style={{ animationDelay: '0.5s' }} />
                            <span className="text-sm">Awaiting completion</span>
                        </div>
                        <span className="text-sm">{pendingWithdrawals.length} requests</span>
                    </div>
                    <p className="text-xs text-orange-200 mt-1">Withdrawal requests in progress</p>
                </CardContent>
            </Card>

            <PendingWithdrawalsModal
                isOpen={isPendingModalOpen}
                onClose={() => setIsPendingModalOpen(false)}
                withdrawals={pendingWithdrawals}
                allWithdrawals={allWithdrawals}
            />
        </>
    )
}