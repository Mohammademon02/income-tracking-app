"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  Eye,
  Filter,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
  Wallet,
  X,
} from "lucide-react"

import { deleteWithdrawal, updateWithdrawal } from "@/app/actions/withdrawals"
import { AccountAvatar } from "@/components/account-avatar"
import { ProcessingTimeBadge } from "@/components/processing-time-badge"
import { WithdrawalDetailsModal } from "@/components/withdrawal-details-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { enhancedToast } from "@/components/ui/enhanced-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pagination } from "@/components/ui/pagination"
import {
  CardList,
  DataCard,
  DataRow,
  EmptyState,
  TableShell,
} from "@/components/ui/responsive-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, toDateKey, todayKey } from "@/lib/date-utils"
import { dollarsToPoints, formatDollars, formatPoints } from "@/lib/money"

type Withdrawal = {
  id: string
  date: Date
  amount: number
  status: "PENDING" | "COMPLETED"
  completedAt: Date | null
  accountId: string
  accountName: string
  accountColor: string
}

type Account = {
  id: string
  name: string
  color: string
}

export function WithdrawalsTable({
  withdrawals,
  accounts,
}: {
  withdrawals: Withdrawal[]
  accounts: Account[]
}) {
  const router = useRouter()
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(null)
  const [deletingWithdrawal, setDeletingWithdrawal] = useState<Withdrawal | null>(null)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [loading, setLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [accountFilter, setAccountFilter] = useState<string>("all")
  const [dateFromFilter, setDateFromFilter] = useState<string>("")
  const [dateToFilter, setDateToFilter] = useState<string>("")
  const [minAmountFilter, setMinAmountFilter] = useState<string>("")
  const [maxAmountFilter, setMaxAmountFilter] = useState<string>("")

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)

  // The month label and totals are derived from a stable calendar date rather
  // than `new Date()` read during render, which produced a server/client
  // mismatch at month boundaries and went stale in a long-lived tab.
  const today = todayKey()
  const currentMonthKey = today.slice(0, 7)

  const monthSummary = useMemo(() => {
    const completedThisMonth = withdrawals.filter(
      (withdrawal) =>
        withdrawal.status === "COMPLETED" &&
        withdrawal.completedAt &&
        toDateKey(new Date(withdrawal.completedAt)).startsWith(currentMonthKey)
    )

    const dollars = completedThisMonth.reduce((sum, withdrawal) => sum + withdrawal.amount, 0)

    return {
      count: completedThisMonth.length,
      dollars,
      points: dollarsToPoints(dollars),
    }
  }, [withdrawals, currentMonthKey])

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((withdrawal) => {
      if (statusFilter !== "all" && withdrawal.status !== statusFilter) return false
      if (accountFilter !== "all" && withdrawal.accountId !== accountFilter) return false

      const dateKey = toDateKey(new Date(withdrawal.date))
      if (dateFromFilter && dateKey < dateFromFilter) return false
      if (dateToFilter && dateKey > dateToFilter) return false

      if (minAmountFilter) {
        const min = Number(minAmountFilter)
        if (Number.isFinite(min) && withdrawal.amount < min) return false
      }
      if (maxAmountFilter) {
        const max = Number(maxAmountFilter)
        if (Number.isFinite(max) && withdrawal.amount > max) return false
      }

      return true
    })
  }, [
    withdrawals,
    statusFilter,
    accountFilter,
    dateFromFilter,
    dateToFilter,
    minAmountFilter,
    maxAmountFilter,
  ])

  const totalPages = Math.max(1, Math.ceil(filteredWithdrawals.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginated = filteredWithdrawals.slice(startIndex, startIndex + itemsPerPage)

  // Adjusted during render rather than in an effect — see entries-table.
  const filterSignature = [
    statusFilter,
    accountFilter,
    dateFromFilter,
    dateToFilter,
    minAmountFilter,
    maxAmountFilter,
    itemsPerPage,
  ].join("|")
  const [previousFilters, setPreviousFilters] = useState(filterSignature)

  if (filterSignature !== previousFilters) {
    setPreviousFilters(filterSignature)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setStatusFilter("all")
    setAccountFilter("all")
    setDateFromFilter("")
    setDateToFilter("")
    setMinAmountFilter("")
    setMaxAmountFilter("")
  }

  const hasActiveFilters =
    statusFilter !== "all" ||
    accountFilter !== "all" ||
    Boolean(dateFromFilter || dateToFilter || minAmountFilter || maxAmountFilter)

  /** Whether this is the earliest withdrawal on its account. */
  const isFirstWithdrawal = (withdrawal: Withdrawal) => {
    const forAccount = withdrawals.filter((w) => w.accountId === withdrawal.accountId)
    if (forAccount.length <= 1) return true

    // Copy before sorting. `.sort()` mutates, and this array is derived from a
    // prop, so sorting it in place reordered the caller's data mid-render.
    const earliest = [...forAccount].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )[0]

    return earliest.id === withdrawal.id
  }

  async function handleUpdate(formData: FormData) {
    if (!editingWithdrawal) return
    setLoading(true)

    const result = await updateWithdrawal(editingWithdrawal.id, formData)
    setLoading(false)

    if (result?.error) {
      enhancedToast.error(result.error)
      return
    }

    setEditingWithdrawal(null)
    router.refresh()
    enhancedToast.withdrawal("Withdrawal updated")
  }

  /**
   * Flip a withdrawal between pending and completed.
   *
   * The menu item used to only pre-fill the edit dialog with a flipped status,
   * so "Mark as Approved" silently required a second confirmation step that its
   * label did not mention. It now performs the change.
   */
  async function toggleStatus(withdrawal: Withdrawal) {
    const nextStatus = withdrawal.status === "PENDING" ? "COMPLETED" : "PENDING"
    setTogglingId(withdrawal.id)

    const formData = new FormData()
    formData.set("accountId", withdrawal.accountId)
    formData.set("date", toDateKey(new Date(withdrawal.date)))
    formData.set("amount", String(dollarsToPoints(withdrawal.amount)))
    formData.set("status", nextStatus)

    const result = await updateWithdrawal(withdrawal.id, formData)
    setTogglingId(null)

    if (result?.error) {
      enhancedToast.error(result.error)
      return
    }

    router.refresh()
    enhancedToast.withdrawal(
      nextStatus === "COMPLETED" ? "Marked as approved" : "Moved back to pending"
    )
  }

  async function handleDelete() {
    if (!deletingWithdrawal) return
    setLoading(true)

    const result = await deleteWithdrawal(deletingWithdrawal.id)
    setLoading(false)

    if (result?.error) {
      enhancedToast.error(result.error)
      return
    }

    setDeletingWithdrawal(null)
    router.refresh()
    enhancedToast.remove("Withdrawal deleted")
  }

  if (withdrawals.length === 0) {
    return (
      <EmptyState
        icon={<Wallet className="size-5" />}
        title="No withdrawals yet"
        description="Add your first withdrawal request to start tracking payouts."
      />
    )
  }

  const statusBadge = (withdrawal: Withdrawal) => (
    <Badge variant={withdrawal.status === "COMPLETED" ? "success" : "warning"}>
      {withdrawal.status === "COMPLETED" ? "Approved" : "Pending"}
    </Badge>
  )

  // Was a line-for-line copy of `ProcessingTimeBadge`, including its threshold
  // table — two places to change whenever "Slow" moves.
  const processingBadge = (withdrawal: Withdrawal) => (
    <ProcessingTimeBadge requestedAt={withdrawal.date} completedAt={withdrawal.completedAt} />
  )

  const rowActions = (withdrawal: Withdrawal) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={(e) => e.stopPropagation()}
          disabled={togglingId === withdrawal.id}
        >
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions for {withdrawal.accountName} withdrawal</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            setSelectedWithdrawal(withdrawal)
          }}
        >
          <Eye className="mr-2 size-4" />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            setEditingWithdrawal(withdrawal)
          }}
        >
          <Pencil className="mr-2 size-4" />
          Edit details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            void toggleStatus(withdrawal)
          }}
        >
          {withdrawal.status === "PENDING" ? (
            <>
              <CheckCircle2 className="mr-2 size-4 text-success" />
              Mark as approved
            </>
          ) : (
            <>
              <RotateCcw className="mr-2 size-4 text-warning" />
              Move back to pending
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation()
            setDeletingWithdrawal(withdrawal)
          }}
        >
          <Trash2 className="mr-2 size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="space-y-6">
      {/* This month */}
      <div className="rounded-lg border bg-card p-5">
        <p className="text-sm font-medium text-muted-foreground">
          Approved in {formatDate(`${currentMonthKey}-01`, { month: "long", year: "numeric" })}
        </p>
        <p className="metric mt-1 text-success">{formatDollars(monthSummary.dollars)}</p>
        <p className="mt-1 text-xs text-muted-foreground tabular-nums">
          {formatPoints(monthSummary.points)} points across {monthSummary.count}{" "}
          {monthSummary.count === 1 ? "withdrawal" : "withdrawals"}
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters ? (
              <Badge variant="secondary">
                {filteredWithdrawals.length} of {withdrawals.length}
              </Badge>
            ) : null}
          </div>
          {hasActiveFilters ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1.5 size-4" />
              Clear
            </Button>
          ) : null}
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="filter-status">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="filter-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-account">Account</Label>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger id="filter-account" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All accounts</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-date-from">Request date</Label>
            <div className="flex items-center gap-2">
              <Input
                id="filter-date-from"
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                aria-label="From date"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                aria-label="To date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-amount-min">Amount ($)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="filter-amount-min"
                type="number"
                step="0.01"
                inputMode="decimal"
                value={minAmountFilter}
                onChange={(e) => setMinAmountFilter(e.target.value)}
                placeholder="Min"
                aria-label="Minimum amount"
              />
              <span className="text-sm text-muted-foreground">–</span>
              <Input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={maxAmountFilter}
                onChange={(e) => setMaxAmountFilter(e.target.value)}
                placeholder="Max"
                aria-label="Maximum amount"
              />
            </div>
          </div>
        </div>
      </div>

      {filteredWithdrawals.length === 0 ? (
        <EmptyState
          title="No withdrawals match these filters"
          description="Try a different status or a wider date range."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop */}
          <TableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requested</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Processing</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((withdrawal) => (
                  <TableRow
                    key={withdrawal.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedWithdrawal(withdrawal)}
                  >
                    <TableCell className="font-medium">
                      {formatDate(new Date(withdrawal.date))}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <AccountAvatar
                          name={withdrawal.accountName}
                          color={withdrawal.accountColor}
                          size="sm"
                        />
                        <span className="font-medium">{withdrawal.accountName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-semibold tabular-nums">
                        {formatDollars(withdrawal.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {formatPoints(dollarsToPoints(withdrawal.amount))} pts
                      </div>
                    </TableCell>
                    <TableCell>{statusBadge(withdrawal)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {withdrawal.completedAt
                        ? formatDate(new Date(withdrawal.completedAt))
                        : "—"}
                    </TableCell>
                    <TableCell>{processingBadge(withdrawal)}</TableCell>
                    <TableCell>{rowActions(withdrawal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableShell>

          {/* Mobile */}
          <CardList>
            {paginated.map((withdrawal) => (
              <DataCard
                key={withdrawal.id}
                title={
                  <span className="flex items-center gap-2">
                    <AccountAvatar
                      name={withdrawal.accountName}
                      color={withdrawal.accountColor}
                      size="sm"
                    />
                    {withdrawal.accountName}
                  </span>
                }
                subtitle={`Requested ${formatDate(new Date(withdrawal.date))}`}
                actions={rowActions(withdrawal)}
              >
                <DataRow label="Amount" value={formatDollars(withdrawal.amount)} />
                <DataRow
                  label="Points"
                  value={formatPoints(dollarsToPoints(withdrawal.amount))}
                />
                <DataRow label="Status" value={statusBadge(withdrawal)} />
                <DataRow
                  label="Approved"
                  value={
                    withdrawal.completedAt
                      ? formatDate(new Date(withdrawal.completedAt))
                      : "—"
                  }
                />
                <DataRow label="Processing" value={processingBadge(withdrawal)} />
              </DataCard>
            ))}
          </CardList>

          {/* Pagination */}
          <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}–
                {Math.min(startIndex + itemsPerPage, filteredWithdrawals.length)} of{" "}
                {filteredWithdrawals.length}
              </p>
              <div className="flex items-center gap-2">
                <Label htmlFor="withdrawal-rows" className="whitespace-nowrap text-sm">
                  Rows
                </Label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                >
                  <SelectTrigger id="withdrawal-rows" className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50, 100].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      {/* Edit */}
      <Dialog
        open={!!editingWithdrawal}
        onOpenChange={(open) => {
          if (!open) setEditingWithdrawal(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit withdrawal</DialogTitle>
            <DialogDescription>Update this withdrawal request.</DialogDescription>
          </DialogHeader>
          <form action={handleUpdate}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-w-account">Account</Label>
                <Select name="accountId" defaultValue={editingWithdrawal?.accountId}>
                  <SelectTrigger id="edit-w-account" className="w-full">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-w-date">Request date</Label>
                <Input
                  id="edit-w-date"
                  name="date"
                  type="date"
                  defaultValue={
                    editingWithdrawal ? toDateKey(new Date(editingWithdrawal.date)) : ""
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-w-amount">Amount (points)</Label>
                <Input
                  id="edit-w-amount"
                  name="amount"
                  type="number"
                  step="1"
                  min="1"
                  inputMode="numeric"
                  defaultValue={
                    editingWithdrawal ? dollarsToPoints(editingWithdrawal.amount) : ""
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {editingWithdrawal
                    ? `${formatDollars(editingWithdrawal.amount)} at 100 points to the dollar`
                    : "100 points = $1.00"}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-w-status">Status</Label>
                <Select name="status" defaultValue={editingWithdrawal?.status}>
                  <SelectTrigger id="edit-w-status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-w-completed">Approval date</Label>
                <Input
                  id="edit-w-completed"
                  name="completedDate"
                  type="date"
                  defaultValue={
                    editingWithdrawal?.completedAt
                      ? toDateKey(new Date(editingWithdrawal.completedAt))
                      : ""
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Used when the status is Approved. Leave empty to use today.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingWithdrawal(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog
        open={!!deletingWithdrawal}
        onOpenChange={(open) => {
          if (!open) setDeletingWithdrawal(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this withdrawal?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingWithdrawal
                ? `${formatDollars(deletingWithdrawal.amount)} from ${deletingWithdrawal.accountName}, requested ${formatDate(new Date(deletingWithdrawal.date))}. This cannot be undone.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <WithdrawalDetailsModal
        isOpen={!!selectedWithdrawal}
        onClose={() => setSelectedWithdrawal(null)}
        withdrawal={selectedWithdrawal}
        isFirstWithdrawal={selectedWithdrawal ? isFirstWithdrawal(selectedWithdrawal) : false}
      />
    </div>
  )
}
