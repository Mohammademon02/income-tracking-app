"use client"

import { useState } from "react"
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
import { MoreHorizontal, Pencil, Trash2, Wallet } from "lucide-react"
import { updateWithdrawal, deleteWithdrawal } from "@/app/actions/withdrawals"

type Withdrawal = {
  id: string
  date: Date
  amount: number
  status: "PENDING" | "COMPLETED"
  completedAt: Date | null
  accountId: string
  accountName: string
}

type Account = {
  id: string
  name: string
}

export function WithdrawalsTable({ withdrawals, accounts }: { withdrawals: Withdrawal[]; accounts: Account[] }) {
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(null)
  const [deletingWithdrawal, setDeletingWithdrawal] = useState<Withdrawal | null>(null)
  const [loading, setLoading] = useState(false)

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
      <div className="rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request Date</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completed Date</TableHead>
              <TableHead>Processing Time</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.id}>
                <TableCell>{new Date(withdrawal.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}</TableCell>
                <TableCell>{withdrawal.accountName}</TableCell>
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
                      {withdrawal.status === "COMPLETED" ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {withdrawal.completedAt ? (
                    <div className="text-sm">
                      <div className="font-medium text-green-600">
                        {new Date(withdrawal.completedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(withdrawal.completedAt).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ) : withdrawal.status === "COMPLETED" ? (
                    <div className="text-sm">
                      <div className="font-medium text-green-600">
                        {new Date(withdrawal.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        (Estimated)
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {withdrawal.completedAt ? (
                    <div className="text-sm">
                      <div className="font-medium text-blue-600">
                        {Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                      <div className={`text-xs font-medium ${Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 10 ? 'text-green-600' :
                        Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 20 ? 'text-blue-600' :
                          Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 30 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                        {Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 10 ? 'Fast' :
                          Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 20 ? 'Normal' :
                            Math.ceil((new Date(withdrawal.completedAt).getTime() - new Date(withdrawal.date).getTime()) / (1000 * 60 * 60 * 24)) <= 30 ? 'Slow' : 'Very Slow'}
                      </div>
                    </div>
                  ) : withdrawal.status === "COMPLETED" ? (
                    <div className="text-sm">
                      <div className="font-medium text-blue-600">0 days</div>
                      <div className="text-xs text-green-600">Instant</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
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
                            Mark as Completed
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
