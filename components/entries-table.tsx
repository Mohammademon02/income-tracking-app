"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarPlus, Filter, MoreHorizontal, Pencil, Trash2, X } from "lucide-react"

import { deleteEntry, updateEntry } from "@/app/actions/entries"
import { AccountAvatar } from "@/components/account-avatar"
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
import { enhancedToast, commonToasts } from "@/components/ui/enhanced-toast"
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
import { formatDate, toDateKey } from "@/lib/date-utils"
import { formatDollars, formatPoints, pointsToDollars } from "@/lib/money"

type Entry = {
  id: string
  date: Date
  points: number
  accountId: string
  accountName: string
  accountColor: string
}

type Account = {
  id: string
  name: string
  color: string
}

export function EntriesTable({ entries, accounts }: { entries: Entry[]; accounts: Account[] }) {
  const router = useRouter()
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [deletingEntry, setDeletingEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [accountFilter, setAccountFilter] = useState<string>("all")
  const [dateFromFilter, setDateFromFilter] = useState<string>("")
  const [dateToFilter, setDateToFilter] = useState<string>("")
  const [minPointsFilter, setMinPointsFilter] = useState<string>("")
  const [maxPointsFilter, setMaxPointsFilter] = useState<string>("")

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (accountFilter !== "all" && entry.accountId !== accountFilter) return false

      // Compare calendar dates as strings rather than instants. The old code
      // parsed the "to" value as UTC midnight and excluded anything later,
      // so filtering "to today" hid today's own entries.
      const entryKey = toDateKey(new Date(entry.date))
      if (dateFromFilter && entryKey < dateFromFilter) return false
      if (dateToFilter && entryKey > dateToFilter) return false

      if (minPointsFilter) {
        const min = Number(minPointsFilter)
        if (Number.isFinite(min) && entry.points < min) return false
      }
      if (maxPointsFilter) {
        const max = Number(maxPointsFilter)
        if (Number.isFinite(max) && entry.points > max) return false
      }

      return true
    })
  }, [entries, accountFilter, dateFromFilter, dateToFilter, minPointsFilter, maxPointsFilter])

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex)

  // An effect, not a useMemo. Calling setState during render is not guaranteed
  // to run (a memo can be discarded) and React 19 flags it.
  useEffect(() => {
    setCurrentPage(1)
  }, [accountFilter, dateFromFilter, dateToFilter, minPointsFilter, maxPointsFilter, itemsPerPage])

  const clearFilters = () => {
    setAccountFilter("all")
    setDateFromFilter("")
    setDateToFilter("")
    setMinPointsFilter("")
    setMaxPointsFilter("")
  }

  const hasActiveFilters =
    accountFilter !== "all" ||
    Boolean(dateFromFilter || dateToFilter || minPointsFilter || maxPointsFilter)

  async function handleUpdate(formData: FormData) {
    if (!editingEntry) return
    setLoading(true)

    // The action's error was previously discarded and the success toast fired
    // unconditionally, so a rejected save still said "Entry updated!".
    const result = await updateEntry(editingEntry.id, formData)
    setLoading(false)

    if (result?.error) {
      enhancedToast.error(result.error)
      return
    }

    setEditingEntry(null)
    router.refresh()
    commonToasts.entryUpdated()
  }

  async function handleDelete() {
    if (!deletingEntry) return
    setLoading(true)

    const result = await deleteEntry(deletingEntry.id)
    setLoading(false)

    if (result?.error) {
      enhancedToast.error(result.error)
      return
    }

    setDeletingEntry(null)
    router.refresh()
    commonToasts.entryDeleted()
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<CalendarPlus className="size-5" />}
        title="No entries yet"
        description="Add your first daily entry to start tracking points against your goals."
      />
    )
  }

  const rowActions = (entry: Entry) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions for {entry.accountName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setEditingEntry(entry)}>
          <Pencil className="mr-2 size-4" />
          Edit entry
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => setDeletingEntry(entry)}>
          <Trash2 className="mr-2 size-4" />
          Delete entry
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters ? (
              <Badge variant="secondary">
                {filteredEntries.length} of {entries.length}
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

        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="filter-account">Account</Label>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger id="filter-account" className="w-full">
                <SelectValue placeholder="All accounts" />
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
            <Label htmlFor="filter-date-from">Date range</Label>
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
            <Label htmlFor="filter-points-min">Points range</Label>
            <div className="flex items-center gap-2">
              <Input
                id="filter-points-min"
                type="number"
                step="1"
                inputMode="numeric"
                value={minPointsFilter}
                onChange={(e) => setMinPointsFilter(e.target.value)}
                placeholder="Min"
                aria-label="Minimum points"
              />
              <span className="text-sm text-muted-foreground">–</span>
              <Input
                type="number"
                step="1"
                inputMode="numeric"
                value={maxPointsFilter}
                onChange={(e) => setMaxPointsFilter(e.target.value)}
                placeholder="Max"
                aria-label="Maximum points"
              />
            </div>
          </div>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <EmptyState
          title="No entries match these filters"
          description="Try widening the date or points range."
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
                  <TableHead>Date</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="font-medium">{formatDate(new Date(entry.date))}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(new Date(entry.date), { weekday: "long" })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <AccountAvatar name={entry.accountName} color={entry.accountColor} />
                        <span className="font-medium">{entry.accountName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-semibold tabular-nums">
                        {formatPoints(entry.points)}
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {formatDollars(pointsToDollars(entry.points))}
                      </div>
                    </TableCell>
                    <TableCell>{rowActions(entry)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableShell>

          {/* Mobile */}
          <CardList>
            {paginatedEntries.map((entry) => (
              <DataCard
                key={entry.id}
                title={
                  <span className="flex items-center gap-2">
                    <AccountAvatar
                      name={entry.accountName}
                      color={entry.accountColor}
                      size="sm"
                    />
                    {entry.accountName}
                  </span>
                }
                subtitle={formatDate(new Date(entry.date), {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                actions={rowActions(entry)}
              >
                <DataRow label="Points" value={formatPoints(entry.points)} />
                <DataRow
                  label="Value"
                  value={formatDollars(pointsToDollars(entry.points))}
                />
              </DataCard>
            ))}
          </CardList>

          {/* Pagination */}
          <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}–{Math.min(endIndex, filteredEntries.length)} of{" "}
                {filteredEntries.length}
                {filteredEntries.length !== entries.length ? ` (of ${entries.length} total)` : ""}
              </p>
              <div className="flex items-center gap-2">
                <Label htmlFor="rows-per-page" className="whitespace-nowrap text-sm">
                  Rows
                </Label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                >
                  <SelectTrigger id="rows-per-page" className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 25, 50, 100].map((size) => (
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
        open={!!editingEntry}
        onOpenChange={(open) => {
          if (!open) setEditingEntry(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit entry</DialogTitle>
            <DialogDescription>Update this daily entry.</DialogDescription>
          </DialogHeader>
          <form action={handleUpdate}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-account">Account</Label>
                <Select name="accountId" defaultValue={editingEntry?.accountId}>
                  <SelectTrigger id="edit-account" className="w-full">
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
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  name="date"
                  type="date"
                  // Read the UTC parts: these are date markers, so a local-time
                  // conversion would shift the day.
                  defaultValue={editingEntry ? toDateKey(new Date(editingEntry.date)) : ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-points">Points</Label>
                <Input
                  id="edit-points"
                  name="points"
                  type="number"
                  step="1"
                  min="0"
                  inputMode="numeric"
                  defaultValue={editingEntry?.points}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {editingEntry
                    ? `${formatDollars(pointsToDollars(editingEntry.points))} at 100 points to the dollar`
                    : "100 points = $1.00"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingEntry(null)}>
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
        open={!!deletingEntry}
        onOpenChange={(open) => {
          if (!open) setDeletingEntry(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingEntry
                ? `${formatPoints(deletingEntry.points)} points on ${formatDate(new Date(deletingEntry.date))} from ${deletingEntry.accountName}. This cannot be undone.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              // Keep the dialog open until the delete resolves; AlertDialogAction
              // closes on click by default, which let a double click fire the
              // delete twice and hid any error.
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
    </div>
  )
}
