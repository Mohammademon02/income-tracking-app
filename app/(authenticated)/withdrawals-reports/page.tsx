import { getWithdrawals } from "@/app/actions/withdrawals"
import { getAccounts } from "@/app/actions/accounts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Calendar, DollarSign, ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { getAvatarGradient } from "@/lib/avatar-utils"
import { MonthlyWithdrawalsClient } from "@/components/monthly-withdrawals-client"

export default async function WithdrawalsReportsPage() {
  const [withdrawals, accounts] = await Promise.all([
    getWithdrawals(),
    getAccounts(),
  ])

  // Group withdrawals by completion month and year (only completed ones)
  const monthlyData = withdrawals
    .filter(withdrawal => withdrawal.status === "COMPLETED" && withdrawal.completedAt)
    .reduce((acc, withdrawal) => {
      const date = new Date(withdrawal.completedAt!)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          monthName,
          totalAmount: 0,
          totalWithdrawals: 0,
          withdrawalsList: [],
          date: date
        }
      }
      
      acc[monthYear].totalAmount += withdrawal.amount
      acc[monthYear].totalWithdrawals += 1
      
      // Calculate processing time
      const requestDate = new Date(withdrawal.date)
      const completionDate = new Date(withdrawal.completedAt!)
      const processingDays = Math.ceil((completionDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // Add individual withdrawal to the list
      acc[monthYear].withdrawalsList.push({
        id: withdrawal.id,
        accountId: withdrawal.accountId,
        accountName: withdrawal.accountName,
        accountColor: withdrawal.accountColor,
        amount: withdrawal.amount,
        requestDate: withdrawal.date,
        completedDate: withdrawal.completedAt,
        processingDays: processingDays
      })
      
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
        totalAmount: 0,
        totalWithdrawals: 0,
        withdrawalsList: [],
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
            Monthly Approved Withdrawals
          </h1>
          <p className="text-slate-600 mt-1">Track your approved withdrawals for the selected month</p>
        </div>
      </div>

      {/* Monthly Withdrawals Display */}
      <MonthlyWithdrawalsClient 
        monthlyData={monthlyData}
        availableMonths={sortedMonths}
        currentMonthKey={currentMonthKey}
      />
    </div>
  )
}