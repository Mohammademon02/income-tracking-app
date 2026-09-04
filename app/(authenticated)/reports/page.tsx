import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { getAccounts } from "@/app/actions/accounts"
import { getEntries } from "@/app/actions/entries"
import { MonthlyIncomeClient } from "@/components/monthly-income-client"
import { PageContainer, PageHeader } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { formatDate, toDateKey, todayKey } from "@/lib/date-utils"

export default async function ReportsPage() {
  const [entries] = await Promise.all([getEntries(), getAccounts()])

  // Group by calendar month read from the UTC parts. Using local getMonth() on
  // a UTC-midnight marker files the 1st of each month into the previous one on
  // any server west of UTC.
  const monthlyData = entries.reduce(
    (acc, entry) => {
      const dateKey = toDateKey(new Date(entry.date))
      const monthYear = dateKey.slice(0, 7)

      if (!acc[monthYear]) {
        acc[monthYear] = {
          monthName: formatDate(`${monthYear}-01`, { month: "long", year: "numeric" }),
          totalPoints: 0,
          totalEntries: 0,
          accounts: {} as Record<string, any>,
          date: new Date(entry.date),
        }
      }

      acc[monthYear].totalPoints += entry.points
      acc[monthYear].totalEntries += 1

      if (!acc[monthYear].accounts[entry.accountId]) {
        acc[monthYear].accounts[entry.accountId] = {
          name: entry.accountName,
          color: entry.accountColor,
          points: 0,
          entries: 0,
        }
      }

      acc[monthYear].accounts[entry.accountId].points += entry.points
      acc[monthYear].accounts[entry.accountId].entries += 1

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

  // The current month is always offered, even before anything is logged in it.
  if (!sortedMonths.some((month) => month.key === currentMonthKey)) {
    sortedMonths.unshift({
      key: currentMonthKey,
      name: currentMonthName,
      data: {
        monthName: currentMonthName,
        totalPoints: 0,
        totalEntries: 0,
        accounts: {},
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
        title="Monthly income"
        description="Points earned per month, broken down by account."
      />

      <MonthlyIncomeClient
        monthlyData={monthlyData}
        availableMonths={sortedMonths}
        currentMonthKey={currentMonthKey}
      />
    </PageContainer>
  )
}
