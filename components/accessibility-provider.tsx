"use client"

import { useEffect } from "react"
import { initializeAccessibility } from "@/lib/accessibility"

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const cleanup = initializeAccessibility()
    return cleanup
  }, [])

  return (
    <>
      {children}
      {/* Screen reader only content */}
      <div className="sr-only">
        <h1>Survey Tracker Application</h1>
        <p>
          This application helps you track survey income, points, and withdrawals.
          Use keyboard shortcuts: Ctrl+K for search, Ctrl+N for new entry, Alt+1-4 for navigation.
        </p>
      </div>

      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>
    </>
  )
}