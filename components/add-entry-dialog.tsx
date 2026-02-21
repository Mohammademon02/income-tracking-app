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
import { getAvatarGradient } from "@/lib/avatar-utils"
import { Plus } from "lucide-react"
import { createEntry } from "@/app/actions/entries"
import { enhancedToast, commonToasts } from "@/components/ui/enhanced-toast"
import { notifications } from "@/lib/notification-service"

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
  const today = new Date().toISOString().split("T")[0]

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await createEntry(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      notifications.error("Failed to add entry", {
        description: result.error
      })
    } else {
      const points = parseInt(formData.get("points") as string)
      const accountName = accounts.find(a => a.id === selectedAccountId)?.name || "Unknown"
      setOpen(false)
      setLoading(false)
      setSelectedAccountId("")
      router.refresh()
      notifications.entry.added(points, accountName)
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
        <Button className="bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-200/50 transition-all duration-200 hover:scale-105">
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
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${getAvatarGradient(account.color || "blue")}`}>
                          {account.name.charAt(0).toUpperCase()}
                        </div>
                        {account.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAccount && (
              <div className="space-y-3">
                <Label>Preview</Label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="relative">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-1 ring-white/30 ${getAvatarGradient(selectedAccount.color || "blue")}`}>
                      {selectedAccount.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-linear-to-r from-green-400 to-emerald-500 rounded-full border border-white shadow-sm"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800">{selectedAccount.name}</span>
                    <span className="text-xs text-slate-500">Survey Entry</span>
                  </div>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="hover:bg-slate-50 transition-colors">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg transition-all duration-200">
              {loading ? "Adding..." : "Add Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
