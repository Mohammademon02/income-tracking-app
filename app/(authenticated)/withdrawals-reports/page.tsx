import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { getWithdrawals } from "@/app/actions/withdrawals"
import {
  MonthlyWithdrawalsClient,
  type AvailableMonth,
  type MonthGroup,
} from "@/components/monthly-withdrawals-client"
import { PageContainer, PageHeader } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { formatDate, toDateKey, todayKey } from "@/lib/date-utils"

export default async function WithdrawalsReportsPage() {
  const withdrawals = await getWithdrawals()

  // Grouped by the UTC parts of the completion date. Local getMonth() on a
  // UTC-midnight marker files the 1st of a month into the previous one on any
  // server west of UTC.
  const monthlyData = withdrawals
    .filter((withdrawal) => withdrawal.completedAt && withdrawal.status === "COMPLETED")
    .reduce<Record<string, MonthGroup>>((acc, withdrawal) => {
      // Narrowed above; `completedAt` is non-null for everything that gets here.
      const completedAt = withdrawal.completedAt as Date
      const monthYear = toDateKey(new Date(completedAt)).slice(0, 7)

      const group = (acc[monthYear] ??= {
        monthName: formatDate(`${monthYear}-01`, { month: "long", year: "numeric" }),
        totalAmount: 0,
        totalWithdrawals: 0,
        withdrawalsList: [],
      })

      group.totalAmount += withdrawal.amount
      group.totalWithdrawals += 1
      group.withdrawalsList.push({
        id: withdrawal.id,
        accountId: withdrawal.accountId,
        accountName: withdrawal.accountName,
        accountColor: withdrawal.accountColor,
        amount: withdrawal.amount,
        requestDate: withdrawal.date,
        completedDate: completedAt,
      })

      return acc
    }, {})

  const availableMonths: AvailableMonth[] = Object.entries(monthlyData)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, data]) => ({ key, name: data.monthName, data }))

  const currentMonthKey = todayKey().slice(0, 7)
  const currentMonthName = formatDate(`${currentMonthKey}-01`, {
    month: "long",
    year: "numeric",
  })

  // The current month is always selectable, even before anything clears in it.
  if (!availableMonths.some((month) => month.key === currentMonthKey)) {
    availableMonths.unshift({
      key: currentMonthKey,
      name: currentMonthName,
      data: {
        monthName: currentMonthName,
        totalAmount: 0,
        totalWithdrawals: 0,
        withdrawalsList: [],
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
        availableMonths={availableMonths}
        currentMonthKey={currentMonthKey}
      />
    </PageContainer>
  )
}
