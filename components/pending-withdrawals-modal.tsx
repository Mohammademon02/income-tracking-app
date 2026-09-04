"use client"

import { useState } from "react"
import { Clock, Wallet } from "lucide-react"

import { AccountAvatar } from "@/components/account-avatar"
import { WithdrawalDetailsModal } from "@/components/withdrawal-details-modal"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { businessDaysBetween, formatDate, toDateKey, todayKey } from "@/lib/date-utils"
import { dollarsToPoints, formatDollars, formatPoints } from "@/lib/money"

/**
 * Everything currently awaiting payout.
 *
 * Rebuilt on Radix Dialog, like the detail modal it opens. As two hand-rolled
 * portals these had a nesting bug that made the pair unusable together: the
 * detail modal was rendered inside this overlay's React tree, so every click
 * inside it bubbled to this overlay's onClick and closed the list behind it,
 * while its unmount reset body scroll with this one still open.
 *
 * The US federal holiday calendar the old version computed inline is gone.
 * It was ~40 lines of date arithmetic to shade a "days waiting" number that
 * only ever needed to be approximate, and it was wrong anyway — the weekday
 * checks read local getDay() from UTC-midnight markers.
 */

interface PendingWithdrawal {
  id: string
  accountId: string
  accountName: string
  accountColor: string
  amount: number
  date: Date | string
  status: string
}

/** The minimum needed to tell which withdrawal on an account came first. */
export type WithdrawalOrderRef = { id: string; accountId: string; date: Date | string }

interface PendingWithdrawalsModalProps {
  isOpen: boolean
  onClose: () => void
  withdrawals: PendingWithdrawal[]
  allWithdrawals?: WithdrawalOrderRef[]
}

export function PendingWithdrawalsModal({
  isOpen,
  onClose,
  withdrawals,
  allWithdrawals = [],
}: PendingWithdrawalsModalProps) {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<PendingWithdrawal | null>(null)

  const today = todayKey()
  const totalDollars = withdrawals.reduce((sum, w) => sum + w.amount, 0)

  // Longest wait first: that is the one worth chasing.
  const sorted = [...withdrawals].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  /** Whether this is the earliest withdrawal on its account. */
  const isFirstWithdrawal = (withdrawal: PendingWithdrawal) => {
    const forAccount = allWithdrawals.filter((w) => w.accountId === withdrawal.accountId)
    if (forAccount.length <= 1) return true

    const earliest = [...forAccount].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )[0]

    return earliest?.id === withdrawal.id
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pending withdrawals</DialogTitle>
            <DialogDescription>
              {formatDollars(totalDollars)} across {withdrawals.length}{" "}
              {withdrawals.length === 1 ? "request" : "requests"}, awaiting approval.
            </DialogDescription>
          </DialogHeader>

          {withdrawals.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <Wallet className="size-5" />
              <p className="text-sm">Nothing pending right now.</p>
            </div>
          ) : (
            <ul className="max-h-[60vh] space-y-2 overflow-y-auto">
              {sorted.map((withdrawal) => {
                const requestKey = toDateKey(new Date(withdrawal.date))
                const waiting = businessDaysBetween(requestKey, today)

                return (
                  <li key={withdrawal.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedWithdrawal(withdrawal)}
                      className="flex w-full items-center justify-between gap-3 rounded-md border p-3 text-left transition-colors hover:bg-accent focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <AccountAvatar
                          name={withdrawal.accountName}
                          color={withdrawal.accountColor}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {withdrawal.accountName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Requested {formatDate(requestKey)}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-sm font-semibold tabular-nums">
                          {formatDollars(withdrawal.amount)}
                        </span>
                        <Badge
                          variant="secondary"
                          className={
                            waiting > 15
                              ? "bg-destructive-muted text-destructive"
                              : "bg-warning-muted text-warning"
                          }
                        >
                          <Clock className="mr-1 size-3" />
                          {waiting}d
                        </Badge>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {withdrawals.length > 0 ? (
            <p className="text-xs text-muted-foreground tabular-nums">
              {formatPoints(dollarsToPoints(totalDollars))} points committed in total.
            </p>
          ) : null}
        </DialogContent>
      </Dialog>

      {/*
        A sibling, not a child. Rendering it inside the Dialog above is what
        made a click in the detail view close the list behind it.
      */}
      <WithdrawalDetailsModal
        isOpen={!!selectedWithdrawal}
        onClose={() => setSelectedWithdrawal(null)}
        withdrawal={
          selectedWithdrawal
            ? { ...selectedWithdrawal, status: "PENDING" as const, completedAt: null }
            : null
        }
        isFirstWithdrawal={selectedWithdrawal ? isFirstWithdrawal(selectedWithdrawal) : false}
      />
    </>
  )
}
