import { getAccounts } from "@/app/actions/accounts"
import { getEntries } from "@/app/actions/entries"
import { getWithdrawals } from "@/app/actions/withdrawals"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Wallet, Clock, DollarSign, Target, Activity, ArrowUpRight, Calendar, Users } from "lucide-react"

export default async function DashboardPage() {
  const [accounts, entries, withdrawals] = await Promise.all([
    getAccounts(),
    getEntries(),
    getWithdrawals(),
  ])

  const totalPoints = accounts.reduce((sum, a) => sum + a.totalPoints, 0)
  const totalCompleted = accounts.reduce((sum, a) => sum + a.completedWithdrawals, 0) * 100 // Convert to points
  const totalPending = accounts.reduce((sum, a) => sum + a.pendingWithdrawals, 0) * 100 // Convert to points
  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0) // Already in points

  // Calculate additional metrics
  const totalEarnings = totalCompleted + totalPending + totalBalance
  const completionRate = totalEarnings > 0 ? (totalCompleted / totalEarnings) * 100 : 0
  const activeAccounts = accounts.filter(a => a.currentBalance > 0).length

  // Get recent entries and withdrawals
  const recentEntries = entries.slice(0, 5)
  const recentWithdrawals = withdrawals.slice(0, 5)

  // Calculate trends and monthly data
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const thisMonthEntries = entries.filter(e => {
    const entryDate = new Date(e.date)
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear
  })

  const thisMonthWithdrawals = withdrawals.filter(w => {
    if (w.status !== "COMPLETED" || !w.completedAt) return false
    
    const completionDate = new Date(w.completedAt)
    return completionDate.getMonth() === currentMonth &&
      completionDate.getFullYear() === currentYear
  })

  const thisMonthIncome = thisMonthEntries.reduce((sum, entry) => sum + entry.points, 0)
  const thisMonthCompletedWithdrawals = thisMonthWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0) * 100 // Convert to points
  const lastMonthEntries = Math.floor(thisMonthEntries.length * 0.8) // Mock previous month data

  // Get current month name
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long' })

  // Convert points to dollars (100 points = $1) - for Quick Stats section
  const totalWithdrawalsInDollars = (totalCompleted / 100).toFixed(2)
  const thisMonthWithdrawalsInDollars = (thisMonthCompletedWithdrawals / 100).toFixed(2)

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50/50 to-blue-50/30 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's your survey income overview</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-200/50 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-300/60 cursor-pointer">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 transition-all duration-500 hover:bg-white/20"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-blue-100">Total Points</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-200" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{totalPoints.toLocaleString()}</div>
            <div className="flex items-center justify-between mt-2 text-blue-100">
              <div className="flex items-center">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span className="text-sm">Across {accounts.length} accounts</span>
              </div>
              <span className="text-lg font-semibold">${(totalPoints / 100).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg shadow-green-200/50 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-300/60 cursor-pointer">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 transition-all duration-500 hover:bg-white/20"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-green-100">Completed Withdrawals</CardTitle>
            <DollarSign className="h-5 w-5 text-green-200" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{totalCompleted.toLocaleString()} <span className="text-lg text-green-200">pts</span></div>
            <div className="text-xl font-semibold text-green-100 mb-2">${(totalCompleted / 100).toFixed(2)}</div>
            <div className="flex items-center mt-2 text-green-100">
              <div className="w-full bg-green-400/30 rounded-full h-2 mr-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <span className="text-sm">{completionRate.toFixed(0)}% of total</span>
            </div>
            <p className="text-xs text-green-200 mt-1">Successfully withdrawn from accounts</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg shadow-orange-200/50 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-300/60 cursor-pointer">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 transition-all duration-500 hover:bg-white/20"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-orange-100">Pending Withdrawals</CardTitle>
            <Clock className="h-5 w-5 text-orange-200" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{totalPending.toLocaleString()} <span className="text-lg text-orange-200">pts</span></div>
            <div className="text-xl font-semibold text-orange-100 mb-2">${(totalPending / 100).toFixed(2)}</div>
            <div className="flex items-center mt-2 text-orange-100">
              <Activity className="w-4 h-4 mr-1" />
              <span className="text-sm">Awaiting completion</span>
            </div>
            <p className="text-xs text-orange-200 mt-1">Withdrawal requests in progress</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg shadow-purple-200/50 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-300/60 cursor-pointer">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 transition-all duration-500 hover:bg-white/20"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-purple-100">Available Balance</CardTitle>
            <Wallet className="h-5 w-5 text-purple-200" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{totalBalance.toLocaleString()} <span className="text-lg text-purple-200">pts</span></div>
            <div className="text-xl font-semibold text-purple-100 mb-2">${(totalBalance / 100).toFixed(2)}</div>
            <div className="flex items-center mt-2 text-purple-100">
              <Target className="w-4 h-4 mr-1" />
              <span className="text-sm">Ready to withdraw</span>
            </div>
            <p className="text-xs text-purple-200 mt-1">Current balance across all accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-white/90">
          <CardHeader className="transition-colors duration-300 hover:bg-slate-50/50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Account Performance
            </CardTitle>
            <CardDescription>Balance and activity across all accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No accounts yet</p>
                <p className="text-slate-400 text-sm">Add your first account to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                {accounts.map((account, index) => {
                  const progressValue = totalPoints > 0 ? (account.totalPoints / totalPoints) * 100 : 0
                  const isWithdrawalReady = account.currentBalance >= 1000
                  return (
                    <div key={account.id} className={`relative group transition-all duration-300 hover:bg-slate-50/50 rounded-lg p-2 -m-2 ${account.currentBalance >= 1000 ? 'bg-gradient-to-r from-green-50/30 to-emerald-50/30 border border-green-200/50 shadow-sm' : ''
                      }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/20 ${
                              // Premium styling for high balance accounts
                              account.currentBalance >= 1000 ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 shadow-xl shadow-orange-200/50' :
                                account.currentBalance >= 500 ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-lg shadow-emerald-200/50' :
                                  // Regular styling based on index
                                  index % 7 === 0 ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600' :
                                    index % 7 === 1 ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600' :
                                      index % 7 === 2 ? 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600' :
                                        index % 7 === 3 ? 'bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600' :
                                          index % 7 === 4 ? 'bg-gradient-to-br from-pink-500 via-rose-500 to-red-600' :
                                            index % 7 === 5 ? 'bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600' :
                                              'bg-gradient-to-br from-slate-500 via-gray-500 to-zinc-600'
                              }`}>
                              {account.name.charAt(0).toUpperCase()}
                            </div>
                            {/* Performance badges */}
                            {account.currentBalance >= 1000 && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full border-2 border-white shadow-md flex items-center justify-center animate-pulse">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </div>
                            )}
                            {account.currentBalance >= 500 && account.currentBalance < 1000 && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{account.name}</p>
                            <p className="text-sm text-slate-500">
                              {account.totalPoints.toLocaleString()} points earned
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${isWithdrawalReady ? 'text-green-600' : 'text-slate-800'}`}>
                            {account.currentBalance.toLocaleString()} <span className="text-sm text-slate-500">pts</span>
                          </p>
                          <p className="text-sm text-slate-400">${(account.currentBalance / 100).toFixed(2)}</p>

                          <div className="flex flex-col gap-2 mt-2">
                            {isWithdrawalReady && (
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium self-end">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Ready to withdraw
                              </div>
                            )}
                            {account.pendingWithdrawals > 0 && (
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium self-end">
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                ${account.pendingWithdrawals.toFixed(2)} withdrawal pending
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-700 ease-out group-hover:animate-pulse ${account.currentBalance >= 1000 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            index % 4 === 0 ? 'bg-blue-500' :
                              index % 4 === 1 ? 'bg-green-500' :
                                index % 4 === 2 ? 'bg-orange-500' : 'bg-purple-500'
                            }`}
                          style={{ width: `${progressValue}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{progressValue.toFixed(1)}% of total points</p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

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

            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl transition-all duration-300 hover:from-purple-100 hover:to-violet-100 hover:scale-105 cursor-pointer transform">
              <div className="text-2xl font-bold text-purple-600 transition-colors duration-300 hover:text-purple-700">{thisMonthIncome.toLocaleString()} <span className="text-sm text-purple-500">pts</span></div>
              <p className="text-sm text-purple-700">{currentMonthName} Income</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl transition-all duration-300 hover:from-cyan-100 hover:to-teal-100 hover:scale-105 cursor-pointer transform">
              <div className="text-2xl font-bold text-cyan-600 transition-colors duration-300 hover:text-cyan-700">${thisMonthWithdrawalsInDollars}</div>
              <p className="text-sm text-cyan-700">{currentMonthName} Withdrawals</p>
              <p className="text-xs text-cyan-500">{thisMonthCompletedWithdrawals.toLocaleString()} pts</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl transition-all duration-300 hover:from-orange-100 hover:to-amber-100 hover:scale-105 cursor-pointer transform">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-orange-600">{thisMonthEntries.length}</span>
                {lastMonthEntries > 0 && (
                  <div className="flex items-center text-green-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm">+{Math.round(((thisMonthEntries.length - lastMonthEntries) / lastMonthEntries) * 100)}%</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-orange-700">{currentMonthName} Entries</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md ring-1 ring-white/40 ${entry.accountName.charAt(0).charCodeAt(0) % 8 === 0 ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600' :
                          entry.accountName.charAt(0).charCodeAt(0) % 8 === 1 ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600' :
                            entry.accountName.charAt(0).charCodeAt(0) % 8 === 2 ? 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600' :
                              entry.accountName.charAt(0).charCodeAt(0) % 8 === 3 ? 'bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600' :
                                entry.accountName.charAt(0).charCodeAt(0) % 8 === 4 ? 'bg-gradient-to-br from-rose-500 via-pink-500 to-red-600' :
                                  entry.accountName.charAt(0).charCodeAt(0) % 8 === 5 ? 'bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600' :
                                    entry.accountName.charAt(0).charCodeAt(0) % 8 === 6 ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-600' :
                                      'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600'
                          }`}>
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
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md ring-1 ring-white/40 ${withdrawal.accountName.charAt(0).charCodeAt(0) % 8 === 0 ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600' :
                          withdrawal.accountName.charAt(0).charCodeAt(0) % 8 === 1 ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600' :
                            withdrawal.accountName.charAt(0).charCodeAt(0) % 8 === 2 ? 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600' :
                              withdrawal.accountName.charAt(0).charCodeAt(0) % 8 === 3 ? 'bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600' :
                                withdrawal.accountName.charAt(0).charCodeAt(0) % 8 === 4 ? 'bg-gradient-to-br from-rose-500 via-pink-500 to-red-600' :
                                  withdrawal.accountName.charAt(0).charCodeAt(0) % 8 === 5 ? 'bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600' :
                                    withdrawal.accountName.charAt(0).charCodeAt(0) % 8 === 6 ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-600' :
                                      'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600'
                          }`}>
                          {withdrawal.accountName.charAt(0).toUpperCase()}
                        </div>
                        {/* Status indicator */}
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
                                Completed: {new Date(withdrawal.completedAt).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </>
                          )}
                        </div>
                        {withdrawal.status === "COMPLETED" && withdrawal.completedAt && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 7
                              ? 'bg-green-100 text-green-700 border border-green-200' :
                              Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 15
                                ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 25
                                  ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                  'bg-red-100 text-red-700 border border-red-200'
                              }`}>
                              <Clock className="w-3 h-3" />
                              {Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24))} days
                              <span className="ml-1">
                                {Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 7 ? '⚡ Fast' :
                                  Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 15 ? '✅ Normal' :
                                    Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 25 ? '🐌 Slow' : '🔴 Very Slow'}
                              </span>
                            </div>
                          </div>
                        )}
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
                        {withdrawal.status === "COMPLETED" ? "Completed" : "Pending"}
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
