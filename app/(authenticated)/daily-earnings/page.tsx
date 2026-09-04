import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { getEntries } from "@/app/actions/entries"
import { DailyEarningsClient } from "@/components/daily-earnings-client"
import { PageContainer, PageHeader } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { addDays, formatDate, toDateKey, todayKey } from "@/lib/date-utils"

const WINDOW_DAYS = 30

export default async function DailyEarningsPage() {
  const entries = await getEntries()

  // The window is a span of calendar dates, not a subtraction from `new Date()`.
  // The old version compared instants against a local-time "now", which both
  // shifted the boundary by the server's offset and excluded any entry dated
  // later today.
  const today = todayKey()
  const windowStart = addDays(today, -(WINDOW_DAYS - 1))

  const recentEntries = entries.filter((entry) => {
    const key = toDateKey(new Date(entry.date))
    return key >= windowStart && key <= today
  })

  const dailyData = recentEntries.reduce(
    (acc, entry) => {
      const key = toDateKey(new Date(entry.date))

      if (!acc[key]) {
        acc[key] = {
          dateDisplay: formatDate(key, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          totalPoints: 0,
          totalEntries: 0,
          entriesList: [],
          date: new Date(entry.date),
        }
      }

      acc[key].totalPoints += entry.points
      acc[key].totalEntries += 1
      acc[key].entriesList.push({
        id: entry.id,
        accountId: entry.accountId,
        accountName: entry.accountName,
        accountColor: entry.accountColor,
        points: entry.points,
        date: entry.date,
      })

      return acc
    },
    {} as Record<string, any>
  )

  const sortedDates = Object.entries(dailyData)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, data]) => ({ key, name: (data as any).dateDisplay, data }))

  const todayDisplay = formatDate(today, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Today is always offered, even with nothing logged against it yet.
  if (!sortedDates.some((entry) => entry.key === today)) {
    sortedDates.unshift({
      key: today,
      name: todayDisplay,
      data: {
        dateDisplay: todayDisplay,
        totalPoints: 0,
        totalEntries: 0,
        entriesList: [],
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
        title="Daily earnings"
        description={`Points logged per day over the last ${WINDOW_DAYS} days.`}
      />

      <DailyEarningsClient
        dailyData={dailyData}
        availableDates={sortedDates}
        todayKey={today}
      />
    </PageContainer>
  )
}
