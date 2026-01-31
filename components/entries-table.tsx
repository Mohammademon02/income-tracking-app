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
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react"
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
            {entries.map((entry, index) => (
              <TableRow key={entry.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                <TableCell>{new Date(entry.date).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                      index % 6 === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      index % 6 === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      index % 6 === 2 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                      index % 6 === 3 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                      index % 6 === 4 ? 'bg-gradient-to-r from-pink-500 to-pink-600' :
                      'bg-gradient-to-r from-cyan-500 to-cyan-600'
                    }`}>
                      {entry.accountName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{entry.accountName}</span>
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
