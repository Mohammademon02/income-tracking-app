"use client"

import { useState } from "react"
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
import { createWithdrawal } from "@/app/actions/withdrawals"

type Account = {
  id: string
  name: string
  color: string
}

export function AddWithdrawalDialog({ accounts }: { accounts: Account[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState("")

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId)
  const today = new Date().toISOString().split("T")[0]

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = await createWithdrawal(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setOpen(false)
      setLoading(false)
      setSelectedAccountId("")
      // Force page refresh to see new withdrawal
      window.location.reload()
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
        <Button className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-lg shadow-purple-200/50 transition-all duration-200 hover:scale-105">
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md ring-1 ring-white/30 ${getAvatarGradient(selectedAccount.color || "blue")}`}>
                      {selectedAccount.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full border border-white shadow-sm"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800">{selectedAccount.name}</span>
                    <span className="text-xs text-slate-500">Withdrawal Request</span>
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
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="hover:bg-slate-50 transition-colors">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-lg transition-all duration-200">
              {loading ? "Adding..." : "Add Withdrawal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
