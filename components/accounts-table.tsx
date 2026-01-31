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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react"
import { updateAccount, deleteAccount } from "@/app/actions/accounts"

type Account = {
  id: string
  name: string
  totalPoints: number
  completedWithdrawals: number
  pendingWithdrawals: number
  currentBalance: number
  createdAt: Date
}

export function AccountsTable({ accounts }: { accounts: Account[] }) {
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleUpdate(formData: FormData) {
    if (!editingAccount) return
    setLoading(true)
    await updateAccount(editingAccount.id, formData)
    setEditingAccount(null)
    setLoading(false)
  }

  async function handleDelete() {
    if (!deletingAccount) return
    setLoading(true)
    await deleteAccount(deletingAccount.id)
    setDeletingAccount(null)
    setLoading(false)
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-blue-600" />
        </div>
        <p className="text-slate-500 text-lg">No accounts yet</p>
        <p className="text-slate-400 text-sm">Add your first account to start tracking survey income</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Total Points</TableHead>
              <TableHead className="text-right">Completed (pts)</TableHead>
              <TableHead className="text-right">Pending (pts)</TableHead>
              <TableHead className="text-right">Balance (pts)</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account, index) => (
              <TableRow key={account.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                      index % 6 === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      index % 6 === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      index % 6 === 2 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                      index % 6 === 3 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                      index % 6 === 4 ? 'bg-gradient-to-r from-pink-500 to-pink-600' :
                      'bg-gradient-to-r from-cyan-500 to-cyan-600'
                    }`}>
                      {account.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{account.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-blue-600">{account.totalPoints.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">${(account.totalPoints / 100).toFixed(2)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-green-600">{(account.completedWithdrawals * 100).toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">${account.completedWithdrawals.toFixed(2)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {account.pendingWithdrawals > 0 ? (
                    <div className="flex flex-col items-end">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                        {(account.pendingWithdrawals * 100).toLocaleString()} pts
                      </Badge>
                      <span className="text-xs text-muted-foreground">${account.pendingWithdrawals.toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">0 pts</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-slate-800">{account.currentBalance.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">${(account.currentBalance / 100).toFixed(2)}</span>
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
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingAccount(account)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingAccount(account)}
                        className="text-destructive"
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
      <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>Update the account name.</DialogDescription>
          </DialogHeader>
          <form action={handleUpdate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Account Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingAccount?.name}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingAccount(null)} className="hover:bg-slate-50 transition-colors">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg transition-all duration-200">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingAccount} onOpenChange={() => setDeletingAccount(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingAccount?.name}&quot;? This will also delete all
              associated entries and withdrawals. This action cannot be undone.
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
