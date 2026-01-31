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
import { Badge } from "@/components/ui/badge"
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
import { getAvatarGradient } from "@/lib/avatar-utils"
import { MoreHorizontal, Pencil, Trash2, Wallet, Clock, Filter, X, Calendar, DollarSign } from "lucide-react"
import { updateWithdrawal, deleteWithdrawal } from "@/app/actions/withdrawals"

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

export function WithdrawalsTable({ withdrawals, accounts }: { withdrawals: Withdrawal[]; accounts: Account[] }) {
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(null)
  const [deletingWithdrawal, setDeletingWithdrawal] = useState<Withdrawal | null>(null)
  const [loading, setLoading] = useState(false)

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [accountFilter, setAccountFilter] = useState<string>("all")
  const [dateFromFilter, setDateFromFilter] = useState<string>("")
  const [dateToFilter, setDateToFilter] = useState<string>("")
  const [minAmountFilter, setMinAmountFilter] = useState<string>("")
  const [maxAmountFilter, setMaxAmountFilter] = useState<string>("")

  // Calculate current month's approved withdrawals based on completion date
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const currentMonthApprovedWithdrawals = withdrawals.filter(withdrawal => {
    if (withdrawal.status !== "COMPLETED" || !withdrawal.completedAt) return false

    const completionDate = new Date(withdrawal.completedAt)
    return completionDate.getMonth() === currentMonth &&
      completionDate.getFullYear() === currentYear
  })

  const totalApprovedAmount = currentMonthApprovedWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0)
  const totalApprovedPoints = totalApprovedAmount * 100

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]

  // Filter withdrawals based on current filters
  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter(withdrawal => {
      // Status filter
      if (statusFilter !== "all" && withdrawal.status !== statusFilter) {
        return false
      }

      // Account filter
      if (accountFilter !== "all" && withdrawal.accountId !== accountFilter) {
        return false
      }

      // Date range filter
      const withdrawalDate = new Date(withdrawal.date)
      if (dateFromFilter) {
        const fromDate = new Date(dateFromFilter)
        if (withdrawalDate < fromDate) return false
      }
      if (dateToFilter) {
        const toDate = new Date(dateToFilter)
        if (withdrawalDate > toDate) return false
      }

      // Amount range filter
      if (minAmountFilter) {
        const minAmount = parseFloat(minAmountFilter)
        if (withdrawal.amount < minAmount) return false
      }
      if (maxAmountFilter) {
        const maxAmount = parseFloat(maxAmountFilter)
        if (withdrawal.amount > maxAmount) return false
      }

      return true
    })
  }, [withdrawals, statusFilter, accountFilter, dateFromFilter, dateToFilter, minAmountFilter, maxAmountFilter])

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter("all")
    setAccountFilter("all")
    setDateFromFilter("")
    setDateToFilter("")
    setMinAmountFilter("")
    setMaxAmountFilter("")
  }

  // Check if any filters are active
  const hasActiveFilters = statusFilter !== "all" || accountFilter !== "all" ||
    dateFromFilter || dateToFilter || minAmountFilter || maxAmountFilter

  async function handleUpdate(formData: FormData) {
    if (!editingWithdrawal) return
    setLoading(true)
    await updateWithdrawal(editingWithdrawal.id, formData)
    setEditingWithdrawal(null)
    setLoading(false)
  }

  async function handleDelete() {
    if (!deletingWithdrawal) return
    setLoading(true)
    await deleteWithdrawal(deletingWithdrawal.id)
    setDeletingWithdrawal(null)
    setLoading(false)
  }

  if (withdrawals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-green-600" />
        </div>
        <p className="text-slate-500 text-lg">No withdrawals yet</p>
        <p className="text-slate-400 text-sm">Add your first withdrawal to start tracking requests</p>
      </div>
    )
  }

  return (
    <>
      {/* Monthly Summary Card */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-6 shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-700 mb-2">
              ${totalApprovedAmount.toFixed(2)}
            </div>
            <div className="text-teal-600 font-medium mb-1">
              {monthNames[currentMonth]} Withdrawals
            </div>
            <div className="text-sm text-teal-500">
              {totalApprovedPoints.toLocaleString()} pts
            </div>
          </div>
        </div>
      </div>

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
                      {filteredWithdrawals.length} of {withdrawals.length} results
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 bg-slate-50 border-slate-200 hover:bg-white transition-colors">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="PENDING">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="COMPLETED">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Completed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

              {/* Amount Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Amount Range ($)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={minAmountFilter}
                    onChange={(e) => setMinAmountFilter(e.target.value)}
                    placeholder="Min"
                    className="h-10 bg-slate-50 border-slate-200 hover:bg-white transition-colors flex-1"
                  />
                  <span className="text-slate-400 text-sm px-1">-</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={maxAmountFilter}
                    onChange={(e) => setMaxAmountFilter(e.target.value)}
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
              <TableHead>Request Date</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approved Date</TableHead>
              <TableHead>Processing Time</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWithdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.id}>
                <TableCell>{new Date(withdrawal.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md ring-1 ring-white/30 ${getAvatarGradient(withdrawal.accountColor)}`}>
                        {withdrawal.accountName.charAt(0).toUpperCase()}
                      </div>
                      {/* Status indicator */}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white shadow-sm ${
                        withdrawal.status === 'COMPLETED' 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                          : 'bg-gradient-to-r from-orange-400 to-amber-500'
                      }`}></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{withdrawal.accountName}</span>
                      <span className="text-xs text-slate-500">Survey Platform</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold">{(withdrawal.amount * 100).toLocaleString()} pts</span>
                    <span className="text-xs text-muted-foreground">${withdrawal.amount.toFixed(2)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${withdrawal.status === "COMPLETED" ? "bg-green-500" : "bg-orange-500"
                      }`}></div>
                    <Badge
                      variant="secondary"
                      className={withdrawal.status === "COMPLETED"
                        ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                        : "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100"
                      }
                    >
                      {withdrawal.status === "COMPLETED" ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {withdrawal.completedAt ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-semibold text-green-700">
                          {new Date(withdrawal.completedAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 ml-4">
                        at {new Date(withdrawal.completedAt).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ) : withdrawal.status === "COMPLETED" ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-semibold text-green-700">
                          {new Date(withdrawal.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 ml-4 italic">
                        (Same day completion)
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <span className="text-slate-400 text-sm">Pending...</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {withdrawal.completedAt ? (
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 7
                      ? 'bg-green-100 text-green-700 border border-green-200' :
                      Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 15
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 25
                          ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                          'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                      <Clock className="w-3 h-3" />
                      {Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24))} days
                      <span className="ml-1">
                        {Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 7 ? '⚡ Fast' :
                          Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 15 ? '✅ Normal' :
                            Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 25 ? '🐌 Slow' : '🔴 Very Slow'}
                      </span>
                    </div>
                  ) : withdrawal.status === "COMPLETED" ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                      <Clock className="w-3 h-3" />
                      0 days
                      <span className="ml-1">⚡ Fast</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500 border border-slate-200">
                      <Clock className="w-3 h-3" />
                      <span>Processing</span>
                    </div>
                  )}
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
                      <DropdownMenuItem onClick={() => setEditingWithdrawal(withdrawal)} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const updatedWithdrawal = { ...withdrawal, status: withdrawal.status === "PENDING" ? "COMPLETED" : "PENDING" as "PENDING" | "COMPLETED" }
                          setEditingWithdrawal(updatedWithdrawal)
                        }}
                        className="cursor-pointer"
                      >
                        {withdrawal.status === "PENDING" ? (
                          <>
                            <div className="mr-2 h-4 w-4 rounded-full bg-green-500"></div>
                            Mark as Approved
                          </>
                        ) : (
                          <>
                            <div className="mr-2 h-4 w-4 rounded-full bg-orange-500"></div>
                            Mark as Pending
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingWithdrawal(withdrawal)}
                        className="text-destructive cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
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
      <Dialog open={!!editingWithdrawal} onOpenChange={() => setEditingWithdrawal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Withdrawal</DialogTitle>
            <DialogDescription>Update the withdrawal details.</DialogDescription>
          </DialogHeader>
          <form action={handleUpdate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-account">Account</Label>
                <Select name="accountId" defaultValue={editingWithdrawal?.accountId}>
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
                  defaultValue={editingWithdrawal ? new Date(editingWithdrawal.date).toISOString().split("T")[0] : ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount (Points)</Label>
                <Input
                  id="edit-amount"
                  name="amount"
                  type="number"
                  step="1"
                  defaultValue={editingWithdrawal ? editingWithdrawal.amount * 100 : 0}
                  required
                  placeholder="Enter points (e.g., 1500)"
                />
                <p className="text-xs text-muted-foreground">
                  Dollar equivalent: ${editingWithdrawal ? (editingWithdrawal.amount).toFixed(2) : '0.00'} (100 points = $1)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select name="status" defaultValue={editingWithdrawal?.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="COMPLETED">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Completed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-completed-date">Completion Date (Optional)</Label>
                <Input
                  id="edit-completed-date"
                  name="completedDate"
                  type="date"
                  defaultValue={editingWithdrawal?.completedAt ? new Date(editingWithdrawal.completedAt).toISOString().split("T")[0] : ""}
                  placeholder="Leave empty for automatic date when marked as completed"
                />
                <p className="text-xs text-muted-foreground">
                  Only used when status is "Approved". Leave empty to use current date automatically.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingWithdrawal(null)} className="hover:bg-slate-50 transition-colors">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-lg transition-all duration-200">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingWithdrawal} onOpenChange={() => setDeletingWithdrawal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Withdrawal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deletingWithdrawal ? (deletingWithdrawal.amount * 100).toLocaleString() : 0} points (${deletingWithdrawal?.amount.toFixed(2)}) withdrawal?
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
