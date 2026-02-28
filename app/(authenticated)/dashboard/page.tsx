import { getAccounts } from "@/app/actions/accounts"
import { getRecentEntries, getAllEntries } from "@/app/actions/entries"
import { getRecentWithdrawals, getPendingWithdrawals, getWithdrawals } from "@/app/actions/withdrawals"
import { getMonthlyStats } from "@/app/actions/monthly-stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExportButton } from "@/components/ui/export-button"
import { EarningsChart } from "@/components/charts/earnings-chart"
import { getAvatarGradient } from "@/lib/avatar-utils"
import { TrendingUp, Wallet, Clock, DollarSign, Target, Activity, ArrowUpRight, Calendar, Users } from "lucide-react"
import Link from "next/link"
import { PendingWithdrawalsCard } from "@/components/pending-withdrawals-card"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { SmartInsights } from "@/components/smart-insights"
import { AnimatedAccountPerformance } from "@/components/animated-account-performance"
import { ScenicTimeHeader } from "@/components/scenic-time-header"

export default async function DashboardPage() {
  // Fetch only what this page actually renders — no more loading everything then slicing
  const [accounts, recentEntries, allEntries, recentWithdrawals, allWithdrawals, pendingWithdrawalsData, monthlyStats] = await Promise.all([
    getAccounts(),
    getRecentEntries(5),
    getAllEntries(), // Get ALL entries for accurate goal calculation
    getRecentWithdrawals(5),
    getWithdrawals(), // Get ALL withdrawals for first withdrawal detection
    getPendingWithdrawals(),
    getMonthlyStats(), // Get current month stats
  ])

  const totalPoints = accounts.reduce((sum, a) => sum + a.totalPoints, 0)
  const totalCompleted = accounts.reduce((sum, a) => sum + a.completedWithdrawals, 0) * 100 // Convert to points
  const totalPending = accounts.reduce((sum, a) => sum + a.pendingWithdrawals, 0) * 100 // Convert to points
  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0) // Already in points

  // Calculate additional metrics
  const totalEarnings = totalCompleted + totalPending + totalBalance
  const completionRate = totalEarnings > 0 ? (totalCompleted / totalEarnings) * 100 : 0
  const activeAccounts = accounts.filter(a => a.currentBalance > 0).length

  // pendingWithdrawals is already the exact shape PendingWithdrawalsCard expects
  const pendingWithdrawals = pendingWithdrawalsData

  // Monthly stats from actual data
  const currentMonthName = monthlyStats.monthName
  const thisMonthIncome = monthlyStats.totalPoints
  const thisMonthCompletedWithdrawals = monthlyStats.totalWithdrawals * 100 // Convert to points for consistency

  // Today's points from the 5 most recent entries (best-effort; full count on daily-earnings page)
  const today = new Date()
  const todayTotalPoints = recentEntries
    .filter(e => new Date(e.date).toDateString() === today.toDateString())
    .reduce((sum, entry) => sum + entry.points, 0)

  // Convert points to dollars (100 points = $1) - for Quick Stats section
  const totalWithdrawalsInDollars = (totalCompleted / 100).toFixed(2)
  const thisMonthWithdrawalsInDollars = (thisMonthCompletedWithdrawals / 100).toFixed(2)

  return (
    <div className="px-3 py-6 sm:px-6 space-y-8 bg-gradient-to-br from-slate-50/50 to-blue-50/30 min-h-screen">
      {/* Scenic Time Header */}
      <ScenicTimeHeader className="mb-8" />

      {/* Export Button Row */}
      <div className="flex justify-end">
        <ExportButton
          data={accounts}
          type="comprehensive"
          accounts={accounts}
          entries={allEntries}
          withdrawals={recentWithdrawals}
          className="hidden sm:flex"
        />
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-100/40 via-blue-50/60 to-white/40 backdrop-blur-xl border-2 border-white/30 shadow-2xl shadow-blue-500/20 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:shadow-blue-500/30 cursor-pointer">
          {/* Glass reflection effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
          {/* Animated Wave Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent wave-flow"></div>
            <div className="absolute top-6 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-300/20 to-transparent wave-flow-delayed"></div>
            <div className="absolute top-12 right-8 w-1.5 h-1.5 bg-blue-500/40 rounded-full wave-pulse"></div>
            <div className="absolute top-16 right-16 w-1 h-1 bg-blue-400/30 rounded-full wave-pulse" style={{ animationDelay: '0.7s' }}></div>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -mr-10 -mt-10 transition-all duration-500 hover:bg-blue-300/40 float-animation"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-blue-800/90">Total Points</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600 wave-pulse" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-blue-900/95">{totalPoints.toLocaleString()}</div>
            <div className="flex items-center justify-between mt-2 text-blue-800/80">
              <div className="flex items-center">
                <ArrowUpRight className="w-4 h-4 mr-1 text-blue-600 wave-pulse" style={{ animationDelay: '0.3s' }} />
                <span className="text-sm font-medium">Across {accounts.length} accounts</span>
              </div>
              <span className="text-lg font-bold text-blue-700">${(totalPoints / 100).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-100/40 via-green-50/60 to-white/40 backdrop-blur-xl border-2 border-white/30 shadow-2xl shadow-green-500/20 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:shadow-green-500/30 cursor-pointer">
          {/* Glass reflection effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
          {/* Animated Wave Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-green-400/30 to-transparent wave-flow-delayed"></div>
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-300/20 to-transparent wave-flow"></div>
            <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-green-500/40 rounded-full wave-pulse" style={{ animationDelay: '0.4s' }}></div>
            <div className="absolute top-14 right-6 w-1 h-1 bg-green-400/30 rounded-full wave-pulse" style={{ animationDelay: '1.2s' }}></div>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full -mr-10 -mt-10 transition-all duration-500 hover:bg-green-300/40 float-animation" style={{ animationDelay: '0.5s' }}></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-green-800/90">Completed Withdrawals</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600 wave-pulse" style={{ animationDelay: '0.2s' }} />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-green-900/95">{totalCompleted.toLocaleString()} <span className="text-lg text-green-700">pts</span></div>
            <div className="text-xl font-semibold text-green-700 mb-2">${(totalCompleted / 100).toFixed(2)}</div>
            <div className="flex items-center mt-2 text-green-800/80">
              <div className="w-full bg-green-300/40 rounded-full h-2 mr-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{completionRate.toFixed(0)}% of total</span>
            </div>
            <p className="text-xs text-green-700/80 mt-1 font-medium">Successfully withdrawn from accounts</p>
          </CardContent>
        </Card>

        <PendingWithdrawalsCard
          pendingWithdrawals={pendingWithdrawals}
          totalPending={totalPending}
          allWithdrawals={allWithdrawals}
        />

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-100/40 via-purple-50/60 to-white/40 backdrop-blur-xl border-2 border-white/30 shadow-2xl shadow-purple-500/20 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:shadow-purple-500/30 cursor-pointer">
          {/* Glass reflection effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
          {/* Animated Wave Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent wave-flow-delayed-2"></div>
            <div className="absolute top-7 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-300/20 to-transparent wave-flow"></div>
            <div className="absolute top-10 right-10 w-2 h-2 bg-purple-500/40 rounded-full wave-pulse" style={{ animationDelay: '0.6s' }}></div>
            <div className="absolute top-15 right-14 w-1 h-1 bg-purple-400/30 rounded-full wave-pulse" style={{ animationDelay: '1.4s' }}></div>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full -mr-10 -mt-10 transition-all duration-500 hover:bg-purple-300/40 float-animation" style={{ animationDelay: '1s' }}></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-purple-800/90">Available Balance</CardTitle>
            <Wallet className="h-5 w-5 text-purple-600 wave-pulse" style={{ animationDelay: '0.4s' }} />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-purple-900/95">{totalBalance.toLocaleString()} <span className="text-lg text-purple-700">pts</span></div>
            <div className="text-xl font-semibold text-purple-700 mb-2">${(totalBalance / 100).toFixed(2)}</div>
            <div className="flex items-center mt-2 text-purple-800/80">
              <Target className="w-4 h-4 mr-1 text-purple-600 wave-pulse" style={{ animationDelay: '0.8s' }} />
              <span className="text-sm font-medium">Ready to withdraw</span>
            </div>
            <p className="text-xs text-purple-700/80 mt-1 font-medium">Current balance across all accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <AnimatedAccountPerformance accounts={accounts} totalPoints={totalPoints} />

        <PerformanceMonitor />
      </div>

      {/* Smart Insights & Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SmartInsights />

        <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl transition-all duration-300 hover:from-indigo-100 hover:to-blue-100 hover:scale-105 cursor-pointer transform">
              <div className="text-2xl font-bold text-indigo-600 transition-colors duration-300 hover:text-indigo-700">{activeAccounts}</div>
              <p className="text-sm text-indigo-700">Active Accounts</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl transition-all duration-300 hover:from-green-100 hover:to-emerald-100 hover:scale-105 cursor-pointer transform">
              <div className="text-2xl font-bold text-green-600 transition-colors duration-300 hover:text-green-700">${totalWithdrawalsInDollars}</div>
              <p className="text-sm text-green-700">Total Withdrawals</p>
              <p className="text-xs text-green-500">{totalCompleted.toLocaleString()} pts</p>
            </div>

            <Link href="/daily-earnings" className="block">
              <div className="text-center p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl transition-all duration-300 hover:from-rose-100 hover:to-pink-100 hover:scale-105 cursor-pointer transform">
                <div className="text-2xl font-bold text-rose-600 transition-colors duration-300 hover:text-rose-700">{todayTotalPoints.toLocaleString()} <span className="text-sm text-rose-500">pts</span></div>
                <p className="text-sm text-rose-700">Today's Earnings</p>
                <p className="text-xs text-rose-500">${(todayTotalPoints / 100).toFixed(2)}</p>
              </div>
            </Link>

            <Link href="/reports" className="block">
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl transition-all duration-300 hover:from-purple-100 hover:to-violet-100 hover:scale-105 cursor-pointer transform">
                <div className="text-2xl font-bold text-purple-600 transition-colors duration-300 hover:text-purple-700">{thisMonthIncome.toLocaleString()} <span className="text-sm text-purple-500">pts</span></div>
                <p className="text-sm text-purple-700">{currentMonthName} Income</p>
              </div>
            </Link>

            <Link href="/withdrawals-reports" className="block">
              <div className="text-center p-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl transition-all duration-300 hover:from-cyan-100 hover:to-teal-100 hover:scale-105 cursor-pointer transform">
                <div className="text-2xl font-bold text-cyan-600 transition-colors duration-300 hover:text-cyan-700">${(thisMonthCompletedWithdrawals / 100).toFixed(2)}</div>
                <p className="text-sm text-cyan-700">{currentMonthName} Approved</p>
                <p className="text-xs text-cyan-500">{thisMonthCompletedWithdrawals.toLocaleString()} pts</p>
              </div>
            </Link>

            <Link href="/entries" className="block">
              <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl transition-all duration-300 hover:from-orange-100 hover:to-amber-100 hover:scale-105 cursor-pointer transform">
                <div className="text-2xl font-bold text-orange-600">{monthlyStats.entriesCount} <span className="text-sm text-green-500">↗ +26%</span></div>
                <p className="text-sm text-orange-700">{currentMonthName} Entries</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {allEntries.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Analytics & Trends</h2>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              Last {allEntries.length} entries
            </Badge>
          </div>
          <EarningsChart
            data={allEntries.map(entry => ({
              date: entry.date.toString(),
              points: entry.points,
              accountName: entry.accountName,
              accountColor: entry.accountColor
            }))}
            accounts={accounts}
          />
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Recent Entries
            </CardTitle>
            <CardDescription>Your latest point entries</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEntries.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">No entries yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-100/50 transition-all duration-300 hover:from-blue-100/70 hover:to-indigo-100/70 hover:border-blue-200/70 hover:shadow-md cursor-pointer transform hover:scale-[1.02]">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md ring-1 ring-white/40 ${getAvatarGradient(entry.accountColor)}`}>
                          {entry.accountName.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border border-white shadow-sm"></div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{entry.accountName}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(entry.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="font-bold text-blue-600">
                          +{entry.points.toLocaleString()}
                        </span>
                        <span className="text-xs text-blue-500 ml-1">pts</span>
                        <div className="text-xs text-slate-400">
                          ${(entry.points / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-600" />
              Recent Withdrawals
            </CardTitle>
            <CardDescription>Your latest withdrawal requests</CardDescription>
          </CardHeader>
          <CardContent>
            {recentWithdrawals.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">No withdrawals yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentWithdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-md ${withdrawal.status === "COMPLETED"
                    ? "bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-green-100/50 hover:from-green-100/70 hover:to-emerald-100/70 hover:border-green-200/70"
                    : "bg-gradient-to-r from-orange-50/50 to-amber-50/50 border-orange-100/50 hover:from-orange-100/70 hover:to-amber-100/70 hover:border-orange-200/70"
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md ring-1 ring-white/40 ${getAvatarGradient(withdrawal.accountColor)}`}>
                          {withdrawal.accountName.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white shadow-sm ${withdrawal.status === 'COMPLETED'
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                          : 'bg-gradient-to-r from-orange-400 to-amber-500'
                          }`}></div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{withdrawal.accountName}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span>Requested: {new Date(withdrawal.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}</span>
                          {withdrawal.status === "COMPLETED" && withdrawal.completedAt && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-green-600 font-medium">
                                Approved: {new Date(withdrawal.completedAt).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </>
                          )}
                        </div>
                        {withdrawal.status === "COMPLETED" && withdrawal.completedAt && (() => {
                          const days = Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24))
                          const colorClass = days <= 7 ? 'bg-green-100 text-green-700 border-green-200' : days <= 15 ? 'bg-blue-100 text-blue-700 border-blue-200' : days <= 25 ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-red-100 text-red-700 border-red-200'
                          const label = days <= 7 ? '⚡ Fast' : days <= 15 ? '✅ Normal' : days <= 25 ? '🐌 Slow' : '🔴 Very Slow'
                          return (
                            <div className="flex items-center gap-2 mt-1">
                              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
                                <Clock className="w-3 h-3" />
                                {days} days <span className="ml-1">{label}</span>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={withdrawal.status === "COMPLETED" ? "font-bold text-green-600" : "font-bold text-orange-600"}>
                          {(withdrawal.amount * 100).toLocaleString()} pts
                        </div>
                        <div className={withdrawal.status === "COMPLETED" ? "text-xs text-green-500" : "text-xs text-orange-500"}>
                          ${withdrawal.amount.toFixed(2)}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={withdrawal.status === "COMPLETED"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-orange-100 text-orange-700 border-orange-200"
                        }
                      >
                        {withdrawal.status === "COMPLETED" ? "Approved" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
