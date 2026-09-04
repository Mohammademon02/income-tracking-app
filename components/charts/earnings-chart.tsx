"use client"

import { useId, useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { DollarSign, TrendingUp } from "lucide-react"

import { SectionIcon } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { addDays, formatDate, toDateKey, todayKey } from "@/lib/date-utils"
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
 *
 * ## Why there is no weekly bar chart
 *
 * There was one: twelve weeks of totals. It plotted the same points as the
 * daily chart at a coarser grain, and until a user has months of history it
 * renders as a single bar occupying the full width of a card — which is what it
 * did in practice. A chart that needs a year of data before it says anything is
 * not worth the space it takes on day one.
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
}: {
  active?: boolean
  payload?: { value: number; name: string; color?: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="panel rounded-lg px-3 py-2 shadow-lg backdrop-blur-sm">
      {label ? <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p> : null}
      {payload.map((item) => (
        <p key={item.name} className="text-sm font-semibold tabular-nums">
          {formatPoints(item.value)} pts
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {formatDollars(pointsToDollars(item.value))}
          </span>
        </p>
      ))}
    </div>
  )
}

export function EarningsChart({ data, accounts }: EarningsChartProps) {
  // A gradient id has to be unique per mount, or a second chart on the page
  // paints with the first one's stops.
  const dailyGradient = useId()

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

  const totalPoints = accountData.reduce((sum, account) => sum + account.points, 0)

  return (
    <div className="grid gap-6">
      {/* Daily earnings */}
      <Card>
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
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
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

      {/* Account split. Ring and legend side by side rather than stacked: with
          the weekly chart gone this card is full width, and a donut centred in
          1,200px with a list under it is mostly empty space. */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SectionIcon icon={DollarSign} tone="success" />
            Account split
          </CardTitle>
          <CardDescription>Points distribution across accounts.</CardDescription>
        </CardHeader>
        <CardContent className="grid items-center gap-6 sm:grid-cols-[minmax(0,18rem)_1fr]">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={accountData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={96}
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

          {/* Doubles as the readable version of the ring — a donut cannot be
              read to a value, and this can. */}
          <ul className="space-y-2">
            {accountData.map((account) => (
              <li
                key={account.name}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-surface-2/60"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: account.color }}
                  />
                  <span className="truncate font-medium">{account.name}</span>
                </div>
                <div className="flex shrink-0 items-baseline gap-3">
                  <span className="font-semibold tabular-nums">{formatPoints(account.points)}</span>
                  <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">
                    {totalPoints > 0 ? ((account.points / totalPoints) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
