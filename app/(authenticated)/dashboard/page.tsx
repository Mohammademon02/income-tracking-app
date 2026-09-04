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
import { formatDate, toDateKey, todayKey } from "@/lib/date-utils"
import { dollarsToPoints, formatDollars, formatPoints, pointsToDollars } from "@/lib/money"

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

      {/* Headline numbers */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total earned"
          value={formatPoints(totalPoints)}
          hint={formatDollars(pointsToDollars(totalPoints))}
          icon={Coins}
        />
        <StatCard
          label="Withdrawn"
          value={formatPoints(totalCompletedPoints)}
          hint={formatDollars(pointsToDollars(totalCompletedPoints))}
          icon={Wallet}
          tone="success"
        />
        <PendingWithdrawalsCard withdrawals={pendingWithdrawals} allWithdrawals={allWithdrawals} />
        <StatCard
          label="Available"
          value={formatPoints(totalBalance)}
          hint={`${formatDollars(pointsToDollars(totalBalance))} ready to withdraw`}
          icon={TrendingUp}
        />
      </div>

      {/* Performance */}
      <div className="grid gap-6 lg:grid-cols-3">
        <AnimatedAccountPerformance accounts={accounts} totalPoints={totalPoints} />
        <PerformanceMonitor />
      </div>

      <UnifiedNotificationSetup />

      {/* Insights and quick stats */}
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
            <div className="grid grid-cols-2 gap-3">
              <QuickStat label="Active accounts" value={activeAccounts.toString()} />
              <QuickStat
                label="Total withdrawn"
                value={formatDollars(pointsToDollars(totalCompletedPoints))}
                hint={`${formatPoints(totalCompletedPoints)} pts`}
              />
              <QuickStat
                label="Today"
                value={formatPoints(todayTotalPoints)}
                hint={formatDollars(pointsToDollars(todayTotalPoints))}
                href="/daily-earnings"
              />
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
                The entries tile used to render a hardcoded "↗ +26%" next to the
                count — a fabricated trend that never came from any data.
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

      {/* Charts */}
      {allEntries.length > 0 ? (
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
      ) : null}

      {/* Recent activity */}
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
              <ul className="divide-y">
                {recentEntries.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between gap-3 py-3">
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
                      <p className="text-sm font-semibold tabular-nums">
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
              <ul className="divide-y">
                {recentWithdrawals.map((withdrawal) => (
                  <li key={withdrawal.id} className="flex items-start justify-between gap-3 py-3">
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
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      {hint ? <p className="text-xs text-muted-foreground tabular-nums">{hint}</p> : null}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-md border p-3 transition-colors hover:bg-accent focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
      >
        {content}
      </Link>
    )
  }

  return <div className="rounded-md border p-3">{content}</div>
}

function EmptyRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
      {icon}
      <p className="text-sm">{label}</p>
    </div>
  )
}
