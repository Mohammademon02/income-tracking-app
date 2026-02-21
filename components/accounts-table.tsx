"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { SearchInput } from "@/components/ui/search-input"
import { BulkActions, SelectableItem } from "@/components/ui/bulk-actions"
import { ExportButton } from "@/components/ui/export-button"
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
import { ColorPicker } from "@/components/ui/color-picker"
import { getAvatarGradient } from "@/lib/avatar-utils"
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react"
import { updateAccount, deleteAccount } from "@/app/actions/accounts"
import { enhancedToast, commonToasts } from "@/components/ui/enhanced-toast"

type Account = {
  id: string
  name: string
  color: string
  totalPoints: number
  completedWithdrawals: number
  pendingWithdrawals: number
  currentBalance: number
  createdAt: Date
}

export function AccountsTable({ accounts }: { accounts: Account[] }) {
  const router = useRouter()
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(false)
  const [editColor, setEditColor] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // Bulk operations
  const handleSelectionChange = (selectedIds: Set<string>) => {
    setSelectedItems(selectedIds)
  }

  const handleItemSelectionChange = (id: string, selected: boolean) => {
    const newSelection = new Set(selectedItems)
    if (selected) {
      newSelection.add(id)
    } else {
      newSelection.delete(id)
    }
    setSelectedItems(newSelection)
  }

  const handleBulkDelete = async (selectedIds: string[]) => {
    for (const id of selectedIds) {
      await deleteAccount(id)
    }
    router.refresh()
    enhancedToast.success(`Deleted ${selectedIds.length} accounts`, {
      description: "Selected accounts have been removed"
    })
  }

  const handleBulkExport = async (selectedIds: string[]) => {
    const selectedAccounts = filteredAccounts.filter(account => 
      selectedIds.includes(account.id)
    )
    // Export functionality will be handled by ExportButton component
    return Promise.resolve()
  }

  // Filter accounts based on search query
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts
    
    const query = searchQuery.toLowerCase()
    return accounts.filter(account => 
      account.name.toLowerCase().includes(query) ||
      account.totalPoints.toString().includes(query) ||
      account.currentBalance.toString().includes(query)
    )
  }, [accounts, searchQuery])

  async function handleUpdate(formData: FormData) {
    if (!editingAccount) return
    setLoading(true)
    setError(null)

    const result = await updateAccount(editingAccount.id, formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      enhancedToast.error("Failed to update account", {
        description: result.error
      })
    } else {
      setEditingAccount(null)
      setLoading(false)
      router.refresh()
      commonToasts.accountUpdated()
    }
  }

  async function handleDelete() {
    if (!deletingAccount) return
    setLoading(true)
    await deleteAccount(deletingAccount.id)
    setDeletingAccount(null)
    setLoading(false)
    router.refresh()
    commonToasts.accountDeleted(deletingAccount.name)
  }

  function handleEditClick(account: Account) {
    setEditingAccount(account)
    setEditColor(account.color || "blue")
    setError(null)
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
      {/* Search Bar and Export */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <SearchInput
          placeholder="Search accounts by name, points, or balance..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="max-w-md flex-1"
        />
        <ExportButton 
          data={filteredAccounts}
          type="accounts"
          filename="survey-accounts"
          className="shrink-0"
        />
      </div>

      {searchQuery && (
        <p className="text-sm text-slate-500 mb-4">
          Showing {filteredAccounts.length} of {accounts.length} accounts
        </p>
      )}

      {/* Bulk Actions */}
      {filteredAccounts.length > 0 && (
        <BulkActions
          items={filteredAccounts}
          selectedItems={selectedItems}
          onSelectionChange={handleSelectionChange}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleBulkExport}
          getItemId={(account) => account.id}
          getItemName={(account) => account.name}
          className="mb-4"
        />
      )}

      {filteredAccounts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 text-lg">No accounts found</p>
          <p className="text-slate-400 text-sm">Try adjusting your search terms</p>
        </div>
      ) : (
      <div className="rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <span className="sr-only">Select</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Total Points</TableHead>
              <TableHead className="text-right">Completed (pts)</TableHead>
              <TableHead className="text-right">Pending (pts)</TableHead>
              <TableHead className="text-right">Balance (pts)</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.map((account) => (
              <TableRow key={account.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                <TableCell>
                  <SelectableItem
                    id={account.id}
                    selected={selectedItems.has(account.id)}
                    onSelectionChange={handleItemSelectionChange}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/20 ${getAvatarGradient(account.color || "blue")}`}>
                        {account.name.charAt(0).toUpperCase()}
                      </div>
                      {/* Performance indicator dot */}
                      {account.totalPoints >= 1000 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-linear-to-r from-yellow-400 to-amber-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      )}
                      {account.totalPoints >= 500 && account.totalPoints < 1000 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-linear-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{account.name}</span>
                      <span className="text-xs text-slate-500">
                        {account.totalPoints >= 1000 ? '🏆 Top Performer' :
                          account.totalPoints >= 500 ? '⭐ Active' :
                            account.totalPoints >= 100 ? '📈 Growing' :
                              '🌱 New Account'}
                      </span>
                    </div>
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
                      <DropdownMenuItem onClick={() => handleEditClick(account)}>
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
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>Update the account name and color.</DialogDescription>
          </DialogHeader>
          <form action={handleUpdate}>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Account Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingAccount?.name}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Preview</Label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/20 ${getAvatarGradient(editColor)}`}>
                    {editingAccount?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800">
                      {editingAccount?.name}
                    </span>
                    <span className="text-xs text-slate-500">Survey Platform</span>
                  </div>
                </div>
              </div>

              <ColorPicker
                selectedColor={editColor}
                onColorChange={setEditColor}
                name="color"
              />

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setEditingAccount(null)
                setError(null)
              }} className="hover:bg-slate-50 transition-colors">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg transition-all duration-200">
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
              className="bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-200/50 transition-all duration-200"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
