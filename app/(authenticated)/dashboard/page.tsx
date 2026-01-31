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
  const totalCompleted = accounts.reduce((sum, a) => sum + a.completedWithdrawals, 0)
  const totalPending = accounts.reduce((sum, a) => sum + a.pendingWithdrawals, 0)
  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0)

  // Calculate additional metrics
  const totalEarnings = totalCompleted + totalPending + totalBalance
  const completionRate = totalEarnings > 0 ? (totalCompleted / totalEarnings) * 100 : 0
  const activeAccounts = accounts.filter(a => a.currentBalance > 0).length

  // Get recent entries and withdrawals
  const recentEntries = entries.slice(0, 5)
  const recentWithdrawals = withdrawals.slice(0, 5)

  // Calculate trends (mock data for demonstration)
  const thisMonthEntries = entries.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).length
  const lastMonthEntries = Math.floor(thisMonthEntries * 0.8) // Mock previous month data

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
            <div className="flex items-center mt-2 text-blue-100">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span className="text-sm">Across {accounts.length} accounts</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg shadow-green-200/50 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-300/60 cursor-pointer">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 transition-all duration-500 hover:bg-white/20"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-green-100">Completed</CardTitle>
            <DollarSign className="h-5 w-5 text-green-200" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{totalCompleted.toLocaleString()} <span className="text-lg text-green-200">pts</span></div>
            <div className="flex items-center mt-2 text-green-100">
              <div className="w-full bg-green-400/30 rounded-full h-2 mr-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <span className="text-sm">{completionRate.toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg shadow-orange-200/50 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-300/60 cursor-pointer">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 transition-all duration-500 hover:bg-white/20"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-orange-100">Pending</CardTitle>
            <Clock className="h-5 w-5 text-orange-200" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{totalPending.toLocaleString()} <span className="text-lg text-orange-200">pts</span></div>
            <div className="flex items-center mt-2 text-orange-100">
              <Activity className="w-4 h-4 mr-1" />
              <span className="text-sm">Processing...</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg shadow-purple-200/50 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-300/60 cursor-pointer">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 transition-all duration-500 hover:bg-white/20"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-purple-100">Available</CardTitle>
            <Wallet className="h-5 w-5 text-purple-200" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{totalBalance.toLocaleString()} <span className="text-lg text-purple-200">pts</span></div>
            <div className="flex items-center mt-2 text-purple-100">
              <Target className="w-4 h-4 mr-1" />
              <span className="text-sm">Ready to withdraw</span>
            </div>
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
                  return (
                    <div key={account.id} className="relative group transition-all duration-300 hover:bg-slate-50/50 rounded-lg p-2 -m-2">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${index % 4 === 0 ? 'bg-blue-500' :
                            index % 4 === 1 ? 'bg-green-500' :
                              index % 4 === 2 ? 'bg-orange-500' : 'bg-purple-500'
                            }`}></div>
                          <div>
                            <p className="font-semibold text-slate-800">{account.name}</p>
                            <p className="text-sm text-slate-500">
                              {account.totalPoints.toLocaleString()} points earned
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-800">{account.currentBalance.toLocaleString()} <span className="text-sm text-slate-500">pts</span></p>
                          {account.pendingWithdrawals > 0 && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                              {account.pendingWithdrawals.toLocaleString()} pts pending
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-700 ease-out group-hover:animate-pulse ${index % 4 === 0 ? 'bg-blue-500' :
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
              <div className="text-2xl font-bold text-green-600 transition-colors duration-300 hover:text-green-700">{totalEarnings.toLocaleString()} <span className="text-sm text-green-500">pts</span></div>
              <p className="text-sm text-green-700">Total Earnings</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl transition-all duration-300 hover:from-orange-100 hover:to-amber-100 hover:scale-105 cursor-pointer transform">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-orange-600">{thisMonthEntries}</span>
                {lastMonthEntries > 0 && (
                  <div className="flex items-center text-green-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm">+{Math.round(((thisMonthEntries - lastMonthEntries) / lastMonthEntries) * 100)}%</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-orange-700">This Month's Entries</p>
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
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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
                      <span className="font-bold text-blue-600">
                        +{entry.points.toLocaleString()}
                      </span>
                      <span className="text-xs text-blue-500">pts</span>
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
                      <div className={`w-2 h-2 rounded-full ${withdrawal.status === "COMPLETED" ? "bg-green-500" : "bg-orange-500"
                        }`}></div>
                      <div>
                        <p className="font-medium text-slate-800">{withdrawal.accountName}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(withdrawal.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${withdrawal.status === "COMPLETED" ? "text-green-600" : "text-orange-600"
                        }`}>{withdrawal.amount.toLocaleString()} <span className="text-xs opacity-70">pts</span></span>
                      <Badge
                        variant="secondary"
                        className={withdrawal.status === "COMPLETED"
                          ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                          : "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100"
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
