"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getAvatarGradient } from "@/lib/avatar-utils"
import { cn } from "@/lib/utils"
import { MoreHorizontal, Pencil, Trash2, Plus, Filter, X } from "lucide-react"
import { updateEntry, deleteEntry } from "@/app/actions/entries"

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
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [deletingEntry, setDeletingEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filter states
  const [accountFilter, setAccountFilter] = useState<string>("all")
  const [dateFromFilter, setDateFromFilter] = useState<string>("")
  const [dateToFilter, setDateToFilter] = useState<string>("")
  const [minPointsFilter, setMinPointsFilter] = useState<string>("")
  const [maxPointsFilter, setMaxPointsFilter] = useState<string>("")

  // Filter entries based on current filters
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Account filter
      if (accountFilter !== "all" && entry.accountId !== accountFilter) {
        return false
      }

      // Date range filter
      const entryDate = new Date(entry.date)
      if (dateFromFilter) {
        const fromDate = new Date(dateFromFilter)
        if (entryDate < fromDate) return false
      }
      if (dateToFilter) {
        const toDate = new Date(dateToFilter)
        if (entryDate > toDate) return false
      }

      // Points range filter
      if (minPointsFilter) {
        const minPoints = parseInt(minPointsFilter)
        if (entry.points < minPoints) return false
      }
      if (maxPointsFilter) {
        const maxPoints = parseInt(maxPointsFilter)
        if (entry.points > maxPoints) return false
      }

      return true
    })
  }, [entries, accountFilter, dateFromFilter, dateToFilter, minPointsFilter, maxPointsFilter])

  // Pagination calculations
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex)

  // Reset to first page when filters change or page size changes
  useMemo(() => {
    setCurrentPage(1)
  }, [accountFilter, dateFromFilter, dateToFilter, minPointsFilter, maxPointsFilter, itemsPerPage])

  // Clear all filters
  const clearFilters = () => {
    setAccountFilter("all")
    setDateFromFilter("")
    setDateToFilter("")
    setMinPointsFilter("")
    setMaxPointsFilter("")
    setCurrentPage(1)
  }

  // Check if any filters are active
  const hasActiveFilters = accountFilter !== "all" ||
    dateFromFilter || dateToFilter || minPointsFilter || maxPointsFilter

  async function handleUpdate(formData: FormData) {
    if (!editingEntry) return
    setLoading(true)
    await updateEntry(editingEntry.id, formData)
    setEditingEntry(null)
    setLoading(false)
  }

  async function handleDelete() {
    if (!deletingEntry) return
    setLoading(true)
    await deleteEntry(deletingEntry.id)
    setDeletingEntry(null)
    setLoading(false)
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="text-center py-16 px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Plus className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No entries yet</h3>
          <p className="text-slate-500 text-base max-w-md mx-auto">
            Start tracking your daily points by adding your first entry. Every point counts towards your goals!
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
            <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
            <span>Ready to begin your journey</span>
            <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Modern Filter Bar */}
      <div className="mb-8">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-100 rounded-lg">
                    <Filter className="h-4 w-4 text-slate-600" />
                  </div>
                  <span className="font-semibold text-slate-800">Filters</span>
                </div>
                {hasActiveFilters && (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
                      {filteredEntries.length} of {entries.length} results
                    </Badge>
                  </div>
                )}
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Account Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Account</Label>
                <Select value={accountFilter} onValueChange={setAccountFilter}>
                  <SelectTrigger className="h-10 bg-slate-50 border-slate-200 hover:bg-white transition-colors">
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

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Date Range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                    className="h-10 bg-slate-50 border-slate-200 hover:bg-white transition-colors flex-1"
                  />
                  <span className="text-slate-400 text-sm px-1">to</span>
                  <Input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                    className="h-10 bg-slate-50 border-slate-200 hover:bg-white transition-colors flex-1"
                  />
                </div>
              </div>

              {/* Points Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Points Range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="1"
                    value={minPointsFilter}
                    onChange={(e) => setMinPointsFilter(e.target.value)}
                    placeholder="Min"
                    className="h-10 bg-slate-50 border-slate-200 hover:bg-white transition-colors flex-1"
                  />
                  <span className="text-slate-400 text-sm px-1">-</span>
                  <Input
                    type="number"
                    step="1"
                    value={maxPointsFilter}
                    onChange={(e) => setMaxPointsFilter(e.target.value)}
                    placeholder="Max"
                    className="h-10 bg-slate-50 border-slate-200 hover:bg-white transition-colors flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700 py-4">Date</TableHead>
              <TableHead className="font-semibold text-slate-700 py-4">Account</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 py-4">Points</TableHead>
              <TableHead className="w-[50px] py-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEntries.map((entry, index) => (
              <TableRow 
                key={entry.id} 
                className={cn(
                  "hover:bg-blue-50/30 transition-all duration-200 border-b border-slate-100 last:border-b-0",
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                )}
              >
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">
                      {new Date(entry.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(entry.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/50 ${getAvatarGradient(entry.accountColor)}`}>
                        {entry.accountName.charAt(0).toUpperCase()}
                      </div>
                      {/* Entry type indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{entry.accountName}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-slate-500">Survey Entry</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium py-4">
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-bold text-blue-600">{entry.points.toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500">≈</span>
                      <span className="text-sm font-medium text-green-600">${(entry.points / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 hover:bg-slate-100 transition-colors duration-200"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 shadow-lg border-slate-200">
                      <DropdownMenuItem 
                        onClick={() => setEditingEntry(entry)} 
                        className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                      >
                        <Pencil className="mr-2 h-4 w-4 text-blue-600" />
                        <span className="text-slate-700">Edit Entry</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingEntry(entry)}
                        className="text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Entry
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Enhanced Pagination and Results Info */}
      {filteredEntries.length > 0 && (
        <div className="mt-8 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Results Info */}
              <div className="text-center sm:text-left">
                <div className="text-sm font-medium text-slate-800">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredEntries.length)} of {filteredEntries.length} entries
                </div>
                {filteredEntries.length !== entries.length && (
                  <div className="text-xs text-slate-500 mt-1">
                    Filtered from {entries.length} total entries
                  </div>
                )}
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-2">
                <Label className="text-sm font-medium text-slate-700 whitespace-nowrap">Rows per page:</Label>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger className="w-20 h-8 bg-white border-slate-200 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
            <DialogDescription>Update the daily entry details.</DialogDescription>
          </DialogHeader>
          <form action={handleUpdate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-account">Account</Label>
                <Select name="accountId" defaultValue={editingEntry?.accountId}>
                  <SelectTrigger>
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
                  defaultValue={editingEntry ? new Date(editingEntry.date).toISOString().split("T")[0] : ""}
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
                  defaultValue={editingEntry?.points}
                  required
                  placeholder="Enter points (e.g., 1500)"
                />
                <p className="text-xs text-muted-foreground">
                  Dollar equivalent: ${editingEntry ? (editingEntry.points / 100).toFixed(2) : '0.00'} (100 points = $1)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingEntry(null)} className="hover:bg-slate-50 transition-colors">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg transition-all duration-200">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingEntry} onOpenChange={() => setDeletingEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entry for {deletingEntry?.points.toLocaleString()} points?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-slate-50 transition-colors">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-200/50 transition-all duration-200"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
