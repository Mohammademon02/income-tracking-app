"use client"

import { Users } from "lucide-react"

import { AccountAvatar } from "@/components/account-avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatDollars, formatPoints, pointsToDollars } from "@/lib/money"

/**
 * Account performance, ranked.
 *
 * This was 430 lines of framer-motion: a 3D rotateX spring entrance, animated
 * background particles, a sparkle layer, a water-wave effect behind cards that
 * were "withdrawal ready", and a no-op setTimeout effect. What it communicates
 * is each account's share of total points and what is available to withdraw,
 * which is what remains.
 */

type Account = {
  id: string
  name: string
  color: string
  totalPoints: number
  completedWithdrawals: number
  pendingWithdrawals: number
  currentBalance: number
  createdAt: Date
}

/** Points at which an account is worth withdrawing from ($25). */
const WITHDRAWAL_READY_THRESHOLD = 2500

export function AnimatedAccountPerformance({
  accounts,
  totalPoints,
}: {
  accounts: Account[]
  totalPoints: number
}) {
  // Copy before sorting: this array comes from a prop.
  const ranked = [...accounts].sort((a, b) => b.totalPoints - a.totalPoints)

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          Accounts
        </CardTitle>
        <CardDescription>Share of total points earned, and what is available.</CardDescription>
      </CardHeader>
      <CardContent>
        {ranked.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <Users className="size-5" />
            <p className="text-sm">No accounts yet.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {ranked.map((account) => {
              const share = totalPoints > 0 ? (account.totalPoints / totalPoints) * 100 : 0
              const ready = account.currentBalance >= WITHDRAWAL_READY_THRESHOLD

              return (
                <li key={account.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <AccountAvatar name={account.name} color={account.color} size="sm" />
                      <span className="truncate text-sm font-medium">{account.name}</span>
                      {ready ? (
                        <Badge variant="secondary" className="bg-success-muted text-success">
                          Ready
                        </Badge>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatPoints(account.totalPoints)}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {share.toFixed(0)}% of total
                      </p>
                    </div>
                  </div>

                  <Progress value={share} />

                  <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                    <span>
                      Available {formatDollars(pointsToDollars(account.currentBalance))}
                    </span>
                    {account.pendingWithdrawals > 0 ? (
                      <span className="text-warning">
                        {formatDollars(account.pendingWithdrawals)} pending
                      </span>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
