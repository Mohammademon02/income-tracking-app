"use client"

import { useEffect } from "react"

import { initializeAccessibility } from "@/lib/accessibility"

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // A real cleanup now — this used to return an empty function while the
    // listener it registered was anonymous and unremovable.
    return initializeAccessibility()
  }, [])

  return (
    <>
      {/*
        Skip link first in the DOM, so it is the first thing a keyboard user
        reaches on the page.
      */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      {children}

      {/*
        This used to inject a second <h1> ("Survey Tracker Application") into
        every page, competing with each page's own heading, and describe
        keyboard shortcuts that were never implemented. Only what is true and
        not already on the page belongs here.
      */}
    </>
  )
}
