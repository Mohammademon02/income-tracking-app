"use client"

import { useId, useMemo } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Calendar, DollarSign, TrendingUp } from "lucide-react"

import { SectionIcon } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { addDays, dateKeyToDate, dayOfWeek, formatDate, toDateKey, todayKey } from "@/lib/date-utils"
import { formatDollars, formatPoints, pointsToDollars } from "@/lib/money"

/**
 * The charts.
 *
 * Every colour in here used to be a literal: `#e2e8f0` grid lines, `#64748b`
 * axes, `#3B82F6` and `#8B5CF6` series, and `backgroundColor: 'white'` on all
 * three tooltips. In dark mode that meant near-invisible axes and a white card
 * flashing over the ink whenever you hovered a point — the charts were the one
 * part of the app that never got a dark theme, because they never resolved from
 * tokens at all.
 *
 * They now read from --chart-*, so the series match the tiles above them and
 * both themes are handled by the same markup.
 */

interface EarningsData {
  date: string
  points: number
  accountName: string
  accountColor: string
}

interface EarningsChartProps {
  data: EarningsData[]
  accounts: Array<{ id: string; name: string; color: string; totalPoints: number }>
}

const SERIES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const AXIS = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const

/**
 * Recharts' `contentStyle` cannot express a themed surface — it takes literal
 * CSS values, which is how the hardcoded white got in. Rendering the tooltip as
 * a component instead lets it use the same tokens as every other popover.
 */
function ChartTooltip({
  active,
  payload,
  label,
  unit = "points",
}: {
  active?: boolean
  payload?: { value: number; name: string; color?: string }[]
  label?: string
  unit?: "points" | "entries"
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="panel rounded-lg px-3 py-2 shadow-lg backdrop-blur-sm">
      {label ? <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p> : null}
      {payload.map((item) => (
        <p key={item.name} className="text-sm font-semibold tabular-nums">
          {unit === "entries"
            ? `${item.value} ${item.value === 1 ? "entry" : "entries"}`
            : `${formatPoints(item.value)} pts`}
          {unit === "points" ? (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {formatDollars(pointsToDollars(item.value))}
            </span>
          ) : null}
        </p>
      ))}
    </div>
  )
}

export function EarningsChart({ data, accounts }: EarningsChartProps) {
  // Gradient ids have to be unique per mount, or a second chart on the page
  // paints with the first one's stops.
  const dailyGradient = useId()
  const weeklyGradient = useId()

  // Filter data to show only recent entries (last 30 days)
  const recentData = useMemo(() => {
    const today = todayKey()
    const windowStart = addDays(today, -29)

    return data.filter((entry) => {
      const key = toDateKey(new Date(entry.date))
      return key >= windowStart && key <= today
    })
  }, [data])

  const dailyData = useMemo(() => {
    const grouped = recentData.reduce(
      (acc, entry) => {
        const entryDate = new Date(entry.date)
        const dateKey = toDateKey(entryDate)
        const displayDate = formatDate(dateKey, { day: "numeric", month: "short" })

        if (!acc[dateKey]) {
          acc[dateKey] = {
            dateKey,
            date: displayDate,
            points: 0,
            earnings: 0,
            sortDate: entryDate.getTime(),
          }
        }

        acc[dateKey].points += entry.points
        acc[dateKey].earnings += entry.points / 100

        return acc
      },
      {} as Record<
        string,
        { dateKey: string; date: string; points: number; earnings: number; sortDate: number }
      >
    )

    return Object.values(grouped)
      .sort((a, b) => a.sortDate - b.sortDate) // Sort by actual date
      .slice(-14) // Last 14 days
      .map(({ date, points, earnings }) => ({ date, points, earnings }))
  }, [recentData])

  const accountData = useMemo(() => {
    return accounts
      .map((account, index) => ({
        name: account.name,
        points: account.totalPoints,
        earnings: account.totalPoints / 100,
        color: SERIES[index % SERIES.length],
      }))
      .sort((a, b) => b.points - a.points)
  }, [accounts])

  const weeklyData = useMemo(() => {
    // Get last 12 weeks of data
    const today = todayKey()
    const windowStart = addDays(today, -83) // 12 weeks

    const weeklyEntries = data.filter((entry) => {
      const key = toDateKey(new Date(entry.date))
      return key >= windowStart && key <= today
    })

    const weeks = weeklyEntries.reduce(
      (acc, entry) => {
        const entryKey = toDateKey(new Date(entry.date))
        // Monday of that week. dayOfWeek() reads the UTC weekday; Sunday (0)
        // belongs to the week that started six days earlier.
        const weekday = dayOfWeek(entryKey)
        const weekKey = addDays(entryKey, weekday === 0 ? -6 : 1 - weekday)
        const weekDisplay = formatDate(weekKey, { day: "numeric", month: "short" })

        if (!acc[weekKey]) {
          acc[weekKey] = {
            weekKey,
            week: weekDisplay,
            points: 0,
            entries: 0,
            sortDate: dateKeyToDate(weekKey).getTime(),
          }
        }

        acc[weekKey].points += entry.points
        acc[weekKey].entries += 1

        return acc
      },
      {} as Record<
        string,
        { weekKey: string; week: string; points: number; entries: number; sortDate: number }
      >
    )

    return Object.values(weeks)
      .sort((a, b) => a.sortDate - b.sortDate) // Sort by actual date
      .slice(-12) // Last 12 weeks
      .map(({ week, points, entries }) => ({ week, points, entries }))
  }, [data])

  const totalPoints = accountData.reduce((sum, account) => sum + account.points, 0)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Daily Earnings Trend */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SectionIcon icon={TrendingUp} tone="primary" />
            Daily earnings
          </CardTitle>
          <CardDescription>Points per day over the last 14 days with activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {/* An area rather than a line: the quantity is an amount
                  accumulated per day, and the fill is what says so. */}
              <AreaChart data={dailyData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <defs>
                  <linearGradient id={dailyGradient} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis
                  {...AXIS}
                  width={44}
                  tickFormatter={(value: number) =>
                    value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`
                  }
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: "var(--border-strong)", strokeDasharray: "3 3" }}
                />
                <Area
                  type="monotone"
                  dataKey="points"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill={`url(#${dailyGradient})`}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "var(--chart-1)",
                    stroke: "var(--background)",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Account Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SectionIcon icon={DollarSign} tone="success" />
            Account split
          </CardTitle>
          <CardDescription>Points distribution across accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={accountData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={104}
                  paddingAngle={2}
                  cornerRadius={4}
                  dataKey="points"
                  stroke="none"
                >
                  {accountData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend. Doubles as the readable version of the ring — a donut
              cannot be read to a value, and this can. */}
          <ul className="mt-4 space-y-2">
            {accountData.map((account) => (
              <li key={account.name} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: account.color }}
                  />
                  <span className="truncate font-medium">{account.name}</span>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-semibold tabular-nums">{formatPoints(account.points)}</div>
                  <div className="text-xs text-muted-foreground tabular-nums">
                    {totalPoints > 0 ? ((account.points / totalPoints) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SectionIcon icon={Calendar} tone="violet" />
            Weekly totals
          </CardTitle>
          <CardDescription>Points per week over the last 12 weeks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <defs>
                  <linearGradient id={weeklyGradient} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.45} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" {...AXIS} />
                <YAxis
                  {...AXIS}
                  width={44}
                  tickFormatter={(value: number) =>
                    value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`
                  }
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "var(--surface-2)", radius: 6 }}
                />
                <Bar dataKey="points" fill={`url(#${weeklyGradient})`} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
