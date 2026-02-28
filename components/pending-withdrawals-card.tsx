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
            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-100/40 via-orange-50/60 to-white/40 backdrop-blur-xl border-2 border-white/30 shadow-2xl shadow-orange-500/20 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:shadow-orange-500/30 cursor-pointer"
                onClick={() => setIsPendingModalOpen(true)}
            >
                {/* Glass reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                {/* Simple Animated Wave Background - matching other cards */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-400/30 to-transparent wave-flow"></div>
                    <div className="absolute top-6 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-300/20 to-transparent wave-flow-delayed"></div>
                    <div className="absolute top-12 right-8 w-1.5 h-1.5 bg-orange-500/40 rounded-full wave-pulse"></div>
                    <div className="absolute top-16 right-16 w-1 h-1 bg-orange-400/30 rounded-full wave-pulse" style={{ animationDelay: '0.7s' }}></div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/30 rounded-full -mr-10 -mt-10 transition-all duration-500 hover:bg-orange-300/40 float-animation" style={{ animationDelay: '0.8s' }}></div>

                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <CardTitle className="text-sm font-semibold text-orange-800/90">Pending Withdrawals</CardTitle>
                    <Clock className="h-5 w-5 text-orange-600 wave-pulse" style={{ animationDelay: '0.3s' }} />
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-orange-900/95">{totalPending.toLocaleString()} <span className="text-lg text-orange-700">pts</span></div>
                    <div className="text-xl font-semibold text-orange-700 mb-2">${(totalPending / 100).toFixed(2)}</div>
                    <div className="flex items-center justify-between mt-2 text-orange-800/80">
                        <div className="flex items-center">
                            <ArrowUpRight className="w-4 h-4 mr-1 text-orange-600 wave-pulse" style={{ animationDelay: '0.5s' }} />
                            <span className="text-sm font-medium">Awaiting completion</span>
                        </div>
                        <span className="text-sm font-medium">{pendingWithdrawals.length} requests</span>
                    </div>
                    <p className="text-xs text-orange-700/80 mt-1 font-medium">Withdrawal requests in progress</p>
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