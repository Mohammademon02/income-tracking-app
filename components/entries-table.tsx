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
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Trash2, Plus, Filter, X, Calendar, Hash } from "lucide-react"
import { updateEntry, deleteEntry } from "@/app/actions/entries"

type Entry = {
  id: string
  date: Date
  points: number
  accountId: string
  accountName: string
}

type Account = {
  id: string
  name: string
}

export function EntriesTable({ entries, accounts }: { entries: Entry[]; accounts: Account[] }) {
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [deletingEntry, setDeletingEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(false)
  
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

  // Clear all filters
  const clearFilters = () => {
    setAccountFilter("all")
    setDateFromFilter("")
    setDateToFilter("")
    setMinPointsFilter("")
    setMaxPointsFilter("")
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
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-blue-600" />
        </div>
        <p className="text-slate-500 text-lg">No entries yet</p>
        <p className="text-slate-400 text-sm">Add your first entry to start tracking daily points</p>
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

      <div className="rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={entry.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                <TableCell>{new Date(entry.date).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-1 ring-white/30 ${
                        // Use account name hash for consistent colors
                        entry.accountName.charAt(0).charCodeAt(0) % 8 === 0 ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600' :
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
                      {/* Entry type indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border border-white shadow-sm"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{entry.accountName}</span>
                      <span className="text-xs text-slate-500">Survey Entry</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-blue-600">{entry.points.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">${(entry.points / 100).toFixed(2)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setEditingEntry(entry)} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Entry
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingEntry(entry)}
                        className="text-destructive cursor-pointer"
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
