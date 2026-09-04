"use client"

import { AlertCircle, CheckCircle2, Clock } from "lucide-react"

import { AccountAvatar } from "@/components/account-avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { businessDaysBetween, formatDate, toDateKey, todayKey } from "@/lib/date-utils"
import { dollarsToPoints, formatDollars, formatPoints } from "@/lib/money"
import { cn } from "@/lib/utils"

/**
 * Withdrawal detail.
 *
 * Rebuilt on Radix Dialog. The hand-rolled portal version had no role="dialog",
 * no aria-modal, no accessible name, no Escape handler, no focus trap and no
 * focus restore. It also managed `document.body.style.overflow` itself, and
 * because it was rendered inside the pending-withdrawals overlay in the React
 * tree, every click inside it bubbled to that overlay's onClick and closed the
 * modal behind it — while the unmount reset body scroll with a modal still
 * open. Radix handles stacking, scroll locking and focus for all of it.
 */

interface WithdrawalDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  withdrawal: {
    id: string
    accountId: string
    accountName: string
    accountColor: string
    amount: number
    date: Date | string
    status: "PENDING" | "COMPLETED"
    completedAt?: Date | string | null
  } | null
  isFirstWithdrawal?: boolean
}

export function WithdrawalDetailsModal({
  isOpen,
  onClose,
  withdrawal,
  isFirstWithdrawal = false,
}: WithdrawalDetailsModalProps) {
  if (!withdrawal) return null

  const requestKey = toDateKey(new Date(withdrawal.date))
  const completedKey = withdrawal.completedAt
    ? toDateKey(new Date(withdrawal.completedAt))
    : null

  // Business days counted from UTC parts. The previous implementation walked
  // dates with local getDay(), which misreads the weekday of a UTC-midnight
  // marker on any server west of UTC.
  const elapsedBusinessDays = businessDaysBetween(requestKey, completedKey ?? todayKey())

  // First withdrawals are verified more slowly on most survey platforms.
  const expectedDays = isFirstWithdrawal ? 30 : 15
  const onTrackDays = isFirstWithdrawal ? 25 : 12

  const status = (() => {
    if (withdrawal.status === "COMPLETED") {
      return {
        icon: CheckCircle2,
        label: "Approved",
        detail:
          elapsedBusinessDays === 0
            ? "Cleared the same day"
            : `Cleared in ${elapsedBusinessDays} business ${elapsedBusinessDays === 1 ? "day" : "days"}`,
        className: "bg-success-muted text-success",
      }
    }

    if (elapsedBusinessDays <= onTrackDays) {
      return {
        icon: Clock,
        label: "Processing",
        detail: `${elapsedBusinessDays} of ${onTrackDays}–${expectedDays} expected business days`,
        className: "bg-muted text-muted-foreground",
      }
    }

    return {
      icon: AlertCircle,
      label: "Delayed",
      detail: `${elapsedBusinessDays} business days, past the expected ${onTrackDays}–${expectedDays}`,
      className: "bg-destructive-muted text-destructive",
    }
  })()

  const StatusIcon = status.icon
  const progress =
    withdrawal.status === "COMPLETED"
      ? 100
      : Math.min((elapsedBusinessDays / expectedDays) * 100, 100)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AccountAvatar name={withdrawal.accountName} color={withdrawal.accountColor} />
            <div className="min-w-0">
              <DialogTitle>Withdrawal details</DialogTitle>
              <DialogDescription>{withdrawal.accountName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Amount and status */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="metric-sm mt-1">{formatDollars(withdrawal.amount)}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {formatPoints(dollarsToPoints(withdrawal.amount))} pts
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Status</p>
              <span
                className={cn(
                  "mt-1 inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-sm font-medium",
                  status.className
                )}
              >
                <StatusIcon className="size-3.5" />
                {status.label}
              </span>
              <p className="mt-1 text-xs text-muted-foreground">{status.detail}</p>
            </div>
          </div>

          {/* Progress against the expected window */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Progress</p>
                {isFirstWithdrawal ? (
                  <Badge variant="secondary">First withdrawal</Badge>
                ) : null}
              </div>
              <span className="text-sm text-muted-foreground tabular-nums">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Day 0</span>
              <span>Day {expectedDays} expected</span>
            </div>
          </div>

          {/* The dates the app actually knows */}
          <dl className="divide-y rounded-md border">
            <div className="flex items-center justify-between px-3 py-2.5">
              <dt className="text-sm text-muted-foreground">Requested</dt>
              <dd className="text-sm font-medium">{formatDate(requestKey)}</dd>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5">
              <dt className="text-sm text-muted-foreground">Approved</dt>
              <dd className="text-sm font-medium">
                {completedKey ? formatDate(completedKey) : "Not yet"}
              </dd>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5">
              <dt className="text-sm text-muted-foreground">Business days</dt>
              <dd className="text-sm font-medium tabular-nums">{elapsedBusinessDays}</dd>
            </div>
          </dl>
        </div>
      </DialogContent>
    </Dialog>
  )
}
