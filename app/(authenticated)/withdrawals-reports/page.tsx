import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { getAccounts } from "@/app/actions/accounts"
import { getWithdrawals } from "@/app/actions/withdrawals"
import { MonthlyWithdrawalsClient } from "@/components/monthly-withdrawals-client"
import { PageContainer, PageHeader } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { daysBetween, formatDate, toDateKey, todayKey } from "@/lib/date-utils"

export default async function WithdrawalsReportsPage() {
  const [withdrawals] = await Promise.all([getWithdrawals(), getAccounts()])

  // Grouped by the UTC parts of the completion date. Local getMonth() on a
  // UTC-midnight marker files the 1st of a month into the previous one on any
  // server west of UTC.
  const monthlyData = withdrawals
    .filter((withdrawal) => withdrawal.status === "COMPLETED" && withdrawal.completedAt)
    .reduce(
      (acc, withdrawal) => {
        const completedKey = toDateKey(new Date(withdrawal.completedAt!))
        const monthYear = completedKey.slice(0, 7)

        if (!acc[monthYear]) {
          acc[monthYear] = {
            monthName: formatDate(`${monthYear}-01`, { month: "long", year: "numeric" }),
            totalAmount: 0,
            totalWithdrawals: 0,
            withdrawalsList: [],
            date: new Date(withdrawal.completedAt!),
          }
        }

        acc[monthYear].totalAmount += withdrawal.amount
        acc[monthYear].totalWithdrawals += 1

        acc[monthYear].withdrawalsList.push({
          id: withdrawal.id,
          accountId: withdrawal.accountId,
          accountName: withdrawal.accountName,
          accountColor: withdrawal.accountColor,
          amount: withdrawal.amount,
          requestDate: withdrawal.date,
          completedDate: withdrawal.completedAt,
          // Whole calendar days, so the count cannot drift with the offset.
          processingDays: daysBetween(toDateKey(new Date(withdrawal.date)), completedKey),
        })

        return acc
      },
      {} as Record<string, any>
    )

  const sortedMonths = Object.entries(monthlyData)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, data]) => ({ key, name: (data as any).monthName, data }))

  const currentMonthKey = todayKey().slice(0, 7)
  const currentMonthName = formatDate(`${currentMonthKey}-01`, {
    month: "long",
    year: "numeric",
  })

  if (!sortedMonths.some((month) => month.key === currentMonthKey)) {
    sortedMonths.unshift({
      key: currentMonthKey,
      name: currentMonthName,
      data: {
        monthName: currentMonthName,
        totalAmount: 0,
        totalWithdrawals: 0,
        withdrawalsList: [],
        date: new Date(),
      },
    })
  }

  return (
    <PageContainer>
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/dashboard">
          <ArrowLeft className="mr-1.5 size-4" />
          Back to dashboard
        </Link>
      </Button>

      <PageHeader
        title="Approved withdrawals"
        description="Payouts that cleared, grouped by the month they landed in."
      />

      <MonthlyWithdrawalsClient
        monthlyData={monthlyData}
        availableMonths={sortedMonths}
        currentMonthKey={currentMonthKey}
      />
    </PageContainer>
  )
}
