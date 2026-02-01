import { getEntries } from "@/app/actions/entries"
import { getAccounts } from "@/app/actions/accounts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Calendar, DollarSign, ArrowLeft, ChevronDown } from "lucide-react"
import Link from "next/link"
import { getAvatarGradient } from "@/lib/avatar-utils"
import { MonthlyIncomeClient } from "@/components/monthly-income-client"

export default async function ReportsPage() {
    const [entries, accounts] = await Promise.all([
        getEntries(),
        getAccounts(),
    ])

    // Group entries by month and year
    const monthlyData = entries.reduce((acc, entry) => {
        const date = new Date(entry.date)
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

        if (!acc[monthYear]) {
            acc[monthYear] = {
                monthName,
                totalPoints: 0,
                totalEntries: 0,
                accounts: {},
                date: date
            }
        }

        acc[monthYear].totalPoints += entry.points
        acc[monthYear].totalEntries += 1

        if (!acc[monthYear].accounts[entry.accountId]) {
            acc[monthYear].accounts[entry.accountId] = {
                name: entry.accountName,
                color: entry.accountColor,
                points: 0,
                entries: 0
            }
        }

        acc[monthYear].accounts[entry.accountId].points += entry.points
        acc[monthYear].accounts[entry.accountId].entries += 1

        return acc
    }, {} as Record<string, any>)

    // Sort months by date (newest first) and prepare for selector
    const sortedMonths = Object.entries(monthlyData)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([key, data]) => ({
            key,
            name: data.monthName,
            data
        }))

    // Get current month as default and ensure it's always available
    const currentDate = new Date()
    const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    const currentMonthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    // Add current month to the list if it doesn't exist
    if (!sortedMonths.find(m => m.key === currentMonthKey)) {
        sortedMonths.unshift({
            key: currentMonthKey,
            name: currentMonthName,
            data: {
                monthName: currentMonthName,
                totalPoints: 0,
                totalEntries: 0,
                accounts: {},
                date: currentDate
            }
        })
    }

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50/50 to-blue-50/30 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Dashboard</span>
                    </Link>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Monthly Income History
                    </h1>
                    <p className="text-slate-600 mt-1">Track your earnings for the selected month</p>
                </div>
            </div>

            {/* Monthly Income Display */}
            <MonthlyIncomeClient
                monthlyData={monthlyData}
                availableMonths={sortedMonths}
                currentMonthKey={currentMonthKey}
            />
        </div>
    )
}