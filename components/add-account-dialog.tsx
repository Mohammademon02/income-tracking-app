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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ColorPicker } from "@/components/ui/color-picker"
import { getAvatarGradient } from "@/lib/avatar-utils"
import { Plus } from "lucide-react"
import { createAccount } from "@/app/actions/accounts"
import { enhancedToast, commonToasts } from "@/components/ui/enhanced-toast"

export function AddAccountDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState("blue")
  const [accountName, setAccountName] = useState("")

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await createAccount(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      enhancedToast.error("Failed to create account", {
        description: result.error
      })
    } else {
      setOpen(false)
      setLoading(false)
      setAccountName("")
      setSelectedColor("blue")
      router.refresh()
      commonToasts.accountCreated()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-200/50 transition-all duration-200 hover:scale-105">
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>Create a new survey platform account to track.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                name="name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g., Swagbucks, Survey Junkie"
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Preview</Label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/20 ${getAvatarGradient(selectedColor)}`}>
                  {accountName ? accountName.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-800">
                    {accountName || "Account Name"}
                  </span>
                  <span className="text-xs text-slate-500">Survey Platform</span>
                </div>
              </div>
            </div>

            <ColorPicker
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              name="color"
            />

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="hover:bg-slate-50 transition-colors">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg transition-all duration-200">
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
