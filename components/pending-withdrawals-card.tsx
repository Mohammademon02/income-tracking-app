"use client"

import { useState } from "react"
import { Clock } from "lucide-react"

import {
  PendingWithdrawalsModal,
  type WithdrawalOrderRef,
} from "@/components/pending-withdrawals-modal"
import { CountUp } from "@/components/motion/count-up"
import { Card, CardContent } from "@/components/ui/card"
import { dollarsToPoints, formatDollars } from "@/lib/money"

interface PendingWithdrawal {
  id: string
  accountId: string
  accountName: string
  accountColor: string
  amount: number
  date: Date | string
  status: string
}

/**
 * The pending tile on the dashboard, which opens the full list.
 *
 * It matches StatCard's shape so the four headline tiles read as one row —
 * this one previously carried its own gradient, glass overlay, decorative
 * "wave" divs and a hover scale, none of which the others had.
 *
 * The total is derived from the list rather than passed in beside it, so the
 * number and the rows behind it cannot disagree.
 */
export function PendingWithdrawalsCard({
  withdrawals,
  allWithdrawals = [],
}: {
  withdrawals: PendingWithdrawal[]
  allWithdrawals?: WithdrawalOrderRef[]
}) {
  const [isOpen, setIsOpen] = useState(false)

  const totalDollars = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0)
  const totalPoints = dollarsToPoints(totalDollars)

  return (
    <>
      <Card interactive className="h-full gap-0 overflow-hidden py-0">
        <CardContent className="p-0">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex w-full items-start justify-between gap-4 rounded-xl p-5 text-left focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
          >
            <div className="min-w-0 space-y-1.5">
              <p className="label-caps">Pending</p>
              <p className="metric text-warning">
                <CountUp value={totalPoints} format="points" />
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDollars(totalDollars)} across {withdrawals.length}{" "}
                {withdrawals.length === 1 ? "request" : "requests"}
              </p>
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-warning">
              <Clock className="size-4" />
            </span>
          </button>
        </CardContent>
      </Card>

      <PendingWithdrawalsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        withdrawals={withdrawals}
        allWithdrawals={allWithdrawals}
      />
    </>
  )
}
