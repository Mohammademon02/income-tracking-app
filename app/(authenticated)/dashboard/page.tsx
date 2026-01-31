import { getAccounts } from "@/app/actions/accounts"
import { getEntries } from "@/app/actions/entries"
import { getWithdrawals } from "@/app/actions/withdrawals"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Wallet, Clock, DollarSign } from "lucide-react"

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

  // Get recent entries and withdrawals (last 5 each)
  const recentEntries = entries.slice(0, 5)
  const recentWithdrawals = withdrawals.slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-balance">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your survey income</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across {accounts.length} accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Withdrawals</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCompleted.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total withdrawn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Available to withdraw</p>
          </CardContent>
        </Card>
      </div>

      {/* Account summary */}
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
          <CardDescription>Balance across all your accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No accounts yet. Add your first account to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {account.totalPoints.toLocaleString()} points earned
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${account.currentBalance.toFixed(2)}</p>
                    {account.pendingWithdrawals > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        ${account.pendingWithdrawals.toFixed(2)} pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>Your latest point entries</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEntries.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No entries yet</p>
            ) : (
              <div className="space-y-3">
                {recentEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{entry.accountName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-semibold text-primary">
                      +{entry.points.toLocaleString()} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Withdrawals</CardTitle>
            <CardDescription>Your latest withdrawal requests</CardDescription>
          </CardHeader>
          <CardContent>
            {recentWithdrawals.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No withdrawals yet</p>
            ) : (
              <div className="space-y-3">
                {recentWithdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{withdrawal.accountName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(withdrawal.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">${withdrawal.amount.toFixed(2)}</span>
                      <Badge
                        variant={withdrawal.status === "COMPLETED" ? "default" : "secondary"}
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
