"use client"

import { useState } from "react"
import { Eraser, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { enhancedToast } from "@/components/ui/enhanced-toast"

/**
 * Local maintenance actions.
 *
 * The settings page previously offered "Export Data", "Clear Cache" and
 * "Delete Account" as three plain buttons with no onClick at all. Export lives
 * on the dashboard where the data already is, and there is no account system
 * to delete from — the app has one user defined by environment variables — so
 * only the action that can genuinely be performed is offered here.
 */
export function DataMaintenance() {
  const [clearing, setClearing] = useState(false)

  async function clearLocalData() {
    setClearing(true)

    try {
      // Only browser-local state is touched. Nothing here reaches the database,
      // so no survey data can be lost by pressing this.
      localStorage.clear()
      sessionStorage.clear()

      if ("caches" in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((key) => caches.delete(key)))
      }

      enhancedToast.success("Local cache cleared", {
        description: "Your entries and withdrawals are untouched.",
      })
    } catch {
      enhancedToast.error("Could not clear the local cache.")
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Clear local cache</p>
          <p className="text-sm text-muted-foreground">
            Removes cached pages and stored preferences on this device. Your data stays
            on the server.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearLocalData}
          disabled={clearing}
          className="shrink-0"
        >
          {clearing ? (
            <RefreshCw className="mr-2 size-4 animate-spin" />
          ) : (
            <Eraser className="mr-2 size-4" />
          )}
          {clearing ? "Clearing…" : "Clear"}
        </Button>
      </div>
    </div>
  )
}
