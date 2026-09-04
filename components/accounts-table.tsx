"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react"

import { deleteAccount, updateAccount } from "@/app/actions/accounts"
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
import { BulkActions, SelectableItem } from "@/components/ui/bulk-actions"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/ui/color-picker"
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
import { ExportButton } from "@/components/ui/export-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CardList,
  DataCard,
  DataRow,
  EmptyState,
  TableShell,
} from "@/components/ui/responsive-table"
import { SearchInput } from "@/components/ui/search-input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { exportToCSV, formatAccountsForExport } from "@/lib/export-utils"
import { dollarsToPoints, formatDollars, formatPoints, pointsToDollars } from "@/lib/money"

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

  const filteredAccounts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return accounts

    return accounts.filter(
      (account) =>
        account.name.toLowerCase().includes(query) ||
        account.totalPoints.toString().includes(query) ||
        account.currentBalance.toString().includes(query)
    )
  }, [accounts, searchQuery])

  const handleItemSelectionChange = (id: string, selected: boolean) => {
    setSelectedItems((current) => {
      const next = new Set(current)
      if (selected) next.add(id)
      else next.delete(id)
      return next
    })
  }

  /**
   * Delete several accounts, reporting what actually happened.
   *
   * The previous loop had no error handling, so one failure aborted it midway:
   * some accounts were gone, no error was shown, and the caller still reported
   * the full count as deleted.
   */
  const handleBulkDelete = async (selectedIds: string[]) => {
    const failures: string[] = []

    for (const id of selectedIds) {
      try {
        const result = await deleteAccount(id)
        if (result?.error) failures.push(id)
      } catch {
        failures.push(id)
      }
    }

    router.refresh()
    setSelectedItems(new Set())

    const deleted = selectedIds.length - failures.length

    if (failures.length > 0) {
      enhancedToast.error(
        `Deleted ${deleted} of ${selectedIds.length} accounts`,
        { description: "Some accounts could not be removed. Refresh and try again." }
      )
      return
    }

    enhancedToast.success(`Deleted ${deleted} ${deleted === 1 ? "account" : "accounts"}`)
  }

  /**
   * Export the selected accounts.
   *
   * This handler used to compute the selection and then discard it with a
   * comment saying export was handled elsewhere, so the button silently
   * downloaded nothing.
   */
  const handleBulkExport = async (selectedIds: string[]) => {
    const selected = accounts.filter((account) => selectedIds.includes(account.id))
    if (selected.length === 0) return

    exportToCSV(formatAccountsForExport(selected), "survey-accounts-selection")
    enhancedToast.success(
      `Exported ${selected.length} ${selected.length === 1 ? "account" : "accounts"}`
    )
  }

  async function handleUpdate(formData: FormData) {
    if (!editingAccount) return
    setLoading(true)
    setError(null)

    const result = await updateAccount(editingAccount.id, formData)
    setLoading(false)

    if (result?.error) {
      setError(result.error)
      enhancedToast.error("Failed to update account", { description: result.error })
      return
    }

    setEditingAccount(null)
    router.refresh()
    commonToasts.accountUpdated()
  }

  async function handleDelete() {
    if (!deletingAccount) return
    setLoading(true)

    const result = await deleteAccount(deletingAccount.id)
    setLoading(false)

    if (result?.error) {
      enhancedToast.error(result.error)
      return
    }

    const name = deletingAccount.name
    setDeletingAccount(null)
    router.refresh()
    commonToasts.accountDeleted(name)
  }

  function handleEditClick(account: Account) {
    setEditingAccount(account)
    setEditColor(account.color || "blue")
    setError(null)
  }

  if (accounts.length === 0) {
    return (
      <EmptyState
        icon={<Users className="size-5" />}
        title="No accounts yet"
        description="Add your first survey account to start tracking income."
      />
    )
  }

  const rowActions = (account: Account) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions for {account.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleEditClick(account)}>
          <Pencil className="mr-2 size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => setDeletingAccount(account)}>
          <Trash2 className="mr-2 size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          placeholder="Search accounts…"
          value={searchQuery}
          onChange={setSearchQuery}
          className="sm:max-w-sm"
        />
        <ExportButton
          data={filteredAccounts}
          type="accounts"
          filename="survey-accounts"
          className="shrink-0"
        />
      </div>

      {searchQuery ? (
        <p className="text-sm text-muted-foreground">
          Showing {filteredAccounts.length} of {accounts.length} accounts
        </p>
      ) : null}

      {filteredAccounts.length > 0 ? (
        <BulkActions
          items={filteredAccounts}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleBulkExport}
          getItemId={(account) => account.id}
          getItemName={(account) => account.name}
        />
      ) : null}

      {filteredAccounts.length === 0 ? (
        <EmptyState
          title="No accounts found"
          description="Try a different search term."
          action={
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear search
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
                  <TableHead className="w-12">
                    <span className="sr-only">Select</span>
                  </TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Earned</TableHead>
                  <TableHead className="text-right">Withdrawn</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <SelectableItem
                        id={account.id}
                        selected={selectedItems.has(account.id)}
                        onSelectionChange={handleItemSelectionChange}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <AccountAvatar name={account.name} color={account.color} />
                        <span className="font-medium">{account.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-semibold tabular-nums">
                        {formatPoints(account.totalPoints)}
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {formatDollars(pointsToDollars(account.totalPoints))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium tabular-nums text-success">
                        {formatPoints(dollarsToPoints(account.completedWithdrawals))}
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {formatDollars(account.completedWithdrawals)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {account.pendingWithdrawals > 0 ? (
                        <>
                          <Badge variant="secondary" className="bg-warning-muted text-warning">
                            {formatPoints(dollarsToPoints(account.pendingWithdrawals))}
                          </Badge>
                          <div className="mt-1 text-xs text-muted-foreground tabular-nums">
                            {formatDollars(account.pendingWithdrawals)}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-semibold tabular-nums">
                        {formatPoints(account.currentBalance)}
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {formatDollars(pointsToDollars(account.currentBalance))}
                      </div>
                    </TableCell>
                    <TableCell>{rowActions(account)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableShell>

          {/* Mobile */}
          <CardList>
            {filteredAccounts.map((account) => (
              <DataCard
                key={account.id}
                title={
                  <span className="flex items-center gap-2">
                    <AccountAvatar name={account.name} color={account.color} size="sm" />
                    {account.name}
                  </span>
                }
                subtitle={`${formatPoints(account.currentBalance)} points available`}
                actions={rowActions(account)}
              >
                <DataRow label="Earned" value={formatPoints(account.totalPoints)} />
                <DataRow
                  label="Withdrawn"
                  value={formatDollars(account.completedWithdrawals)}
                />
                <DataRow
                  label="Pending"
                  value={
                    account.pendingWithdrawals > 0
                      ? formatDollars(account.pendingWithdrawals)
                      : "—"
                  }
                />
                <DataRow
                  label="Available"
                  value={formatDollars(pointsToDollars(account.currentBalance))}
                />
              </DataCard>
            ))}
          </CardList>
        </>
      )}

      {/* Edit */}
      <Dialog
        open={!!editingAccount}
        onOpenChange={(open) => {
          if (!open) {
            setEditingAccount(null)
            setError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit account</DialogTitle>
            <DialogDescription>Update the account name and colour.</DialogDescription>
          </DialogHeader>
          <form action={handleUpdate}>
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Account name</Label>
                <Input id="edit-name" name="name" defaultValue={editingAccount?.name} required />
              </div>

              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="flex items-center gap-3 rounded-md border bg-muted/40 p-3">
                  <AccountAvatar name={editingAccount?.name ?? "?"} color={editColor} />
                  <span className="font-medium">{editingAccount?.name}</span>
                </div>
              </div>

              <ColorPicker
                selectedColor={editColor}
                onColorChange={setEditColor}
                name="color"
              />

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingAccount(null)
                  setError(null)
                }}
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
        open={!!deletingAccount}
        onOpenChange={(open) => {
          if (!open) setDeletingAccount(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this account?</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting &quot;{deletingAccount?.name}&quot; also deletes every entry and
              withdrawal recorded against it. This cannot be undone.
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
    </div>
  )
}
