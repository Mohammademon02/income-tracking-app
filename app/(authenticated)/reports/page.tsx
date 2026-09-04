import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { getEntries } from "@/app/actions/entries"
import {
  MonthlyIncomeClient,
  type AvailableIncomeMonth,
  type IncomeMonth,
} from "@/components/monthly-income-client"
import { PageContainer, PageHeader } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { formatDate, toDateKey, todayKey } from "@/lib/date-utils"

export default async function ReportsPage() {
  const entries = await getEntries()

  // Group by calendar month read from the UTC parts. Using local getMonth() on
  // a UTC-midnight marker files the 1st of each month into the previous one on
  // any server west of UTC.
  const monthlyData = entries.reduce<Record<string, IncomeMonth>>((acc, entry) => {
    const monthYear = toDateKey(new Date(entry.date)).slice(0, 7)

    const month = (acc[monthYear] ??= {
      monthName: formatDate(`${monthYear}-01`, { month: "long", year: "numeric" }),
      totalPoints: 0,
      totalEntries: 0,
      accounts: {},
    })

    month.totalPoints += entry.points
    month.totalEntries += 1

    const account = (month.accounts[entry.accountId] ??= {
      name: entry.accountName,
      color: entry.accountColor,
      points: 0,
      entries: 0,
    })

    account.points += entry.points
    account.entries += 1

    return acc
  }, {})

  const availableMonths: AvailableIncomeMonth[] = Object.entries(monthlyData)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, data]) => ({ key, name: data.monthName, data }))

  const currentMonthKey = todayKey().slice(0, 7)
  const currentMonthName = formatDate(`${currentMonthKey}-01`, {
    month: "long",
    year: "numeric",
  })

  // The current month is always offered, even before anything is logged in it.
  if (!availableMonths.some((month) => month.key === currentMonthKey)) {
    availableMonths.unshift({
      key: currentMonthKey,
      name: currentMonthName,
      data: {
        monthName: currentMonthName,
        totalPoints: 0,
        totalEntries: 0,
        accounts: {},
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

      <MonthlyIncomeClient availableMonths={availableMonths} currentMonthKey={currentMonthKey} />
    </PageContainer>
  )
}
