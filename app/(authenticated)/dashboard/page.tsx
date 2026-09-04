import { Activity, Calendar, Coins, TrendingUp, Wallet } from "lucide-react"
import Link from "next/link"

import { getAccounts } from "@/app/actions/accounts"
import { getAllEntries, getRecentEntries } from "@/app/actions/entries"
import { getMonthlyStats } from "@/app/actions/monthly-stats"
import {
  getPendingWithdrawals,
  getRecentWithdrawals,
  getWithdrawals,
} from "@/app/actions/withdrawals"
import { AccountAvatar } from "@/components/account-avatar"
import { AnimatedAccountPerformance } from "@/components/animated-account-performance"
import { EarningsChart } from "@/components/charts/earnings-chart"
import { HeroMetric } from "@/components/hero-metric"
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal"
import { PageContainer, PageHeader, PageSection } from "@/components/page-shell"
import { PendingWithdrawalsCard } from "@/components/pending-withdrawals-card"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { ProcessingTimeBadge } from "@/components/processing-time-badge"
import { SmartInsights } from "@/components/smart-insights"
import { StatCard } from "@/components/stat-card"
import { UnifiedNotificationSetup } from "@/components/unified-notification-setup"
import { UsTimeClock } from "@/components/us-time-clock"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportButton } from "@/components/ui/export-button"
import { addDays, formatDate, toDateKey, todayKey, type DateKey } from "@/lib/date-utils"
import { dollarsToPoints, formatDollars, formatPoints, pointsToDollars } from "@/lib/money"

/** Points earned on each of the last `days` days, oldest first. */
function dailySeries(
  entries: { date: Date | string; points: number }[],
  days: number,
  end: DateKey
): number[] {
  const totals = new Map<DateKey, number>()
  for (const entry of entries) {
    const key = toDateKey(new Date(entry.date))
    totals.set(key, (totals.get(key) ?? 0) + entry.points)
  }

  // Every day is emitted, including the empty ones: a sparkline that skips days
  // with no entries compresses a quiet week into a single point and reads as
  // steady earning.
  return Array.from({ length: days }, (_, index) => totals.get(addDays(end, index - days + 1)) ?? 0)
}

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

export default async function DashboardPage() {
  const [
    accounts,
    recentEntries,
    allEntries,
    recentWithdrawals,
    allWithdrawals,
    pendingWithdrawals,
    monthlyStats,
  ] = await Promise.all([
    getAccounts(),
    getRecentEntries(5),
    getAllEntries(),
    getRecentWithdrawals(5),
    getWithdrawals(),
    getPendingWithdrawals(),
    getMonthlyStats(),
  ])

  const totalPoints = accounts.reduce((sum, a) => sum + a.totalPoints, 0)
  const totalCompletedPoints = dollarsToPoints(
    accounts.reduce((sum, a) => sum + a.completedWithdrawals, 0)
  )
  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0)
  const activeAccounts = accounts.filter((a) => a.currentBalance > 0).length

  const currentMonthName = monthlyStats.monthName
  const thisMonthIncome = monthlyStats.totalPoints
  const thisMonthWithdrawalPoints = monthlyStats.totalWithdrawalPoints

  // Counted across every entry, and matched on the calendar date rather than
  // `toDateString()` against a local `new Date()`. The old version looked only
  // at the five most recent entries, so a busy day silently under-reported.
  const today = todayKey()
  const todayTotalPoints = allEntries
    .filter((entry) => toDateKey(new Date(entry.date)) === today)
    .reduce((sum, entry) => sum + entry.points, 0)

  const series = dailySeries(allEntries, 30, today)
  const lastWeek = sum(series.slice(-7))
  const priorWeek = sum(series.slice(-14, -7))
  // Left undefined when there is no baseline to divide by. A previous version
  // of the insights panel handled that case by reporting +1280%.
  const weekTrend = priorWeek > 0 ? ((lastWeek - priorWeek) / priorWeek) * 100 : undefined

  return (
    <PageContainer>
      {/* The full report was fed the five most recent withdrawals, while the
          complete list sat unused in an empty destructuring slot. */}
      <PageHeader
        title="Dashboard"
        description="Your survey earnings and withdrawals at a glance."
        actions={
          <ExportButton
            type="comprehensive"
            accounts={accounts}
            entries={allEntries}
            withdrawals={allWithdrawals}
          />
        }
      />

      <UsTimeClock />

      {/* The anchor. One figure at 60px, and the row beneath it demoted, so the
          page opens with an answer rather than four equal tiles to compare. */}
      <Reveal>
        <HeroMetric
          label="Total earned"
          points={totalPoints}
          dollars={pointsToDollars(totalPoints)}
          trend={weekTrend}
          spark={series}
          footnote="Lifetime, with the last 30 days shown below."
        />
      </Reveal>

      {/* Supporting numbers */}
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" delay={0.1}>
        <StaggerItem>
          <StatCard
            label="Withdrawn"
            value={totalCompletedPoints}
            hint={formatDollars(pointsToDollars(totalCompletedPoints))}
            icon={Wallet}
            tone="success"
          />
        </StaggerItem>
        <StaggerItem>
          <PendingWithdrawalsCard
            withdrawals={pendingWithdrawals}
            allWithdrawals={allWithdrawals}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Available"
            value={totalBalance}
            hint={`${formatDollars(pointsToDollars(totalBalance))} ready to withdraw`}
            icon={TrendingUp}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Today"
            value={todayTotalPoints}
            hint={formatDollars(pointsToDollars(todayTotalPoints))}
            icon={Coins}
          />
        </StaggerItem>
      </Stagger>

      {/* Charts. Promoted above the insight panels: the shape of the earnings
          is the thing most worth the space, and it previously sat below two
          cards of derived text. */}
      {allEntries.length > 0 ? (
        <Reveal>
          <PageSection
            title="Trends"
            actions={<Badge variant="secondary">{allEntries.length} entries</Badge>}
          >
            <EarningsChart
              data={allEntries.map((entry) => ({
                date: entry.date.toString(),
                points: entry.points,
                accountName: entry.accountName,
                accountColor: entry.accountColor,
              }))}
              accounts={accounts}
            />
          </PageSection>
        </Reveal>
      ) : null}

      {/* Performance */}
      <Reveal>
        <div className="grid gap-6 lg:grid-cols-3">
          <AnimatedAccountPerformance accounts={accounts} totalPoints={totalPoints} />
          <PerformanceMonitor />
        </div>
      </Reveal>

      {/* Insights and quick stats */}
      <Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          <SmartInsights />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-4 text-muted-foreground" />
                Quick stats
              </CardTitle>
              <CardDescription>{currentMonthName} so far.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Four tiles, not six. "Today" and "Total withdrawn" moved up
                  into the headline row, where they were being duplicated. */}
              <div className="grid grid-cols-2 gap-3">
                <QuickStat label="Active accounts" value={activeAccounts.toString()} />
                <QuickStat
                  label={`${currentMonthName} income`}
                  value={formatPoints(thisMonthIncome)}
                  hint={formatDollars(pointsToDollars(thisMonthIncome))}
                  href="/reports"
                />
                <QuickStat
                  label={`${currentMonthName} approved`}
                  value={formatDollars(pointsToDollars(thisMonthWithdrawalPoints))}
                  hint={`${formatPoints(thisMonthWithdrawalPoints)} pts`}
                  href="/withdrawals-reports"
                />
                {/*
                  The entries tile used to render a hardcoded "↗ +26%" next to
                  the count — a fabricated trend that never came from any data.
                */}
                <QuickStat
                  label={`${currentMonthName} entries`}
                  value={monthlyStats.entriesCount.toString()}
                  href="/entries"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </Reveal>

      {/* Recent activity */}
      <Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                Recent entries
              </CardTitle>
              <CardDescription>Your latest point entries.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentEntries.length === 0 ? (
                <EmptyRow icon={<Activity className="size-5" />} label="No entries yet" />
              ) : (
                <ul className="divide-y divide-border/60">
                  {recentEntries.map((entry) => (
                    <li
                      key={entry.id}
                      className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-surface-2/60"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <AccountAvatar
                          name={entry.accountName}
                          color={entry.accountColor}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{entry.accountName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(new Date(entry.date))}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums text-success">
                          +{formatPoints(entry.points)}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {formatDollars(pointsToDollars(entry.points))}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="size-4 text-muted-foreground" />
                Recent withdrawals
              </CardTitle>
              <CardDescription>Your latest payout requests.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentWithdrawals.length === 0 ? (
                <EmptyRow icon={<Wallet className="size-5" />} label="No withdrawals yet" />
              ) : (
                <ul className="divide-y divide-border/60">
                  {recentWithdrawals.map((withdrawal) => (
                    <li
                      key={withdrawal.id}
                      className="-mx-2 flex items-start justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-surface-2/60"
                    >
                      <div className="flex min-w-0 items-start gap-2.5">
                        <AccountAvatar
                          name={withdrawal.accountName}
                          color={withdrawal.accountColor}
                          size="sm"
                        />
                        <div className="min-w-0 space-y-1">
                          <p className="truncate text-sm font-medium">{withdrawal.accountName}</p>
                          <p className="text-xs text-muted-foreground">
                            Requested {formatDate(new Date(withdrawal.date))}
                          </p>
                          {withdrawal.status === "COMPLETED" ? (
                            <ProcessingTimeBadge
                              requestedAt={withdrawal.date}
                              completedAt={withdrawal.completedAt}
                            />
                          ) : (
                            <Badge variant="secondary" className="bg-warning-muted text-warning">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-semibold tabular-nums">
                        {formatDollars(withdrawal.amount)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </Reveal>

      {/* Setup, not glance. It sat between the headline numbers and the charts,
          above everything a returning user actually opens the page for. */}
      <UnifiedNotificationSetup />
    </PageContainer>
  )
}

/** One tile in the quick-stats grid. Becomes a link when `href` is given. */
function QuickStat({
  label,
  value,
  hint,
  href,
}: {
  label: string
  value: string
  hint?: string
  href?: string
}) {
  const content = (
    <>
      <p className="metric-sm">{value}</p>
      <p className="label-caps mt-1">{label}</p>
      {hint ? <p className="text-xs text-muted-foreground tabular-nums">{hint}</p> : null}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        // `block` is load-bearing: an <a> is inline by default, and .panel's
        // inset-0 ring pseudo-element has nothing to size against on an inline
        // box.
        className="panel panel-interactive block rounded-lg p-3 focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
      >
        {content}
      </Link>
    )
  }

  return <div className="panel rounded-lg p-3">{content}</div>
}

function EmptyRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
      {icon}
      <p className="text-sm">{label}</p>
    </div>
  )
}
