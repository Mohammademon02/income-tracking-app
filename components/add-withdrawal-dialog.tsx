"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AccountAvatar } from "@/components/account-avatar"
import { todayKey } from "@/lib/date-utils"
import { Plus } from "lucide-react"
import { createWithdrawal } from "@/app/actions/withdrawals"
import { enhancedToast } from "@/components/ui/enhanced-toast"

type Account = {
  id: string
  name: string
  color: string
}

export function AddWithdrawalDialog({ accounts }: { accounts: Account[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState("")

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId)
  // Resolved in the app's timezone rather than UTC — see add-entry-dialog.
  const today = todayKey()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await createWithdrawal(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      enhancedToast.error(result.error)
    } else {
      setOpen(false)
      setLoading(false)
      setSelectedAccountId("")
      router.refresh()
      enhancedToast.withdrawal("Withdrawal added successfully!")
    }
  }

  if (accounts.length === 0) {
    return (
      <Button disabled>
        <Plus className="mr-2 h-4 w-4" />
        Add Withdrawal
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        setSelectedAccountId("")
        setError(null)
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Withdrawal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Withdrawal</DialogTitle>
          <DialogDescription>Record a new withdrawal request.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="accountId">Account</Label>
              <Select name="accountId" required onValueChange={setSelectedAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <span className="flex items-center gap-2">
                        <AccountAvatar name={account.name} color={account.color} size="sm" />
                        {account.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAccount && (
              <div className="space-y-3">
                <Label>Preview</Label>
                <div className="flex items-center gap-3 rounded-md border bg-muted/40 p-3">
                  <AccountAvatar name={selectedAccount.name} color={selectedAccount.color} />
                  <span className="font-medium">{selectedAccount.name}</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={today}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (Points)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="1"
                placeholder="e.g., 2500"
                required
              />
              <p className="text-xs text-muted-foreground">
                100 points = $1.00
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="PENDING">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-warning"></div>
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="COMPLETED">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success"></div>
                      Completed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Withdrawal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
