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
import { createEntry } from "@/app/actions/entries"
import { enhancedToast, commonToasts } from "@/components/ui/enhanced-toast"

type Account = {
  id: string
  name: string
  color: string
}

export function AddEntryDialog({ accounts }: { accounts: Account[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState("")

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId)
  // `new Date().toISOString()` is UTC, so for anyone east of UTC this used to
  // pre-fill yesterday's date in the small hours — and filed the entry against
  // the wrong day. todayKey() resolves in the app's timezone on both the server
  // render and the client, so there is no hydration mismatch either.
  const today = todayKey()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await createEntry(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      enhancedToast.error("Failed to add entry", {
        description: result.error
      })
    } else {
      const points = parseInt(formData.get("points") as string)
      const accountName = accounts.find(a => a.id === selectedAccountId)?.name || "Unknown"
      setOpen(false)
      setLoading(false)
      setSelectedAccountId("")
      router.refresh()
      commonToasts.entryAdded(points)
    }
  }

  if (accounts.length === 0) {
    return (
      <Button disabled>
        <Plus className="mr-2 h-4 w-4" />
        Add Entry
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
          Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Daily Entry</DialogTitle>
          <DialogDescription>Record your survey points for the day.</DialogDescription>
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
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                name="points"
                type="number"
                step="1"
                placeholder="e.g., 1500"
                required
              />
              <p className="text-xs text-muted-foreground">
                100 points = $1.00
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
