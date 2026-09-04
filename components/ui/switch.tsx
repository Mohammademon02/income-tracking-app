"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * An accessible on/off control.
 *
 * Built on a native button with `role="switch"` rather than pulling in another
 * Radix package. The settings page previously drew two of these as bare divs
 * with a dot inside — no state, no keyboard access, nothing announced to a
 * screen reader, and no effect on anything.
 */
export function Switch({
  checked,
  onCheckedChange,
  disabled,
  id,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
  className?: string
  "aria-label"?: string
  "aria-labelledby"?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors",
        "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-background shadow-sm transition-transform",
          checked ? "translate-x-[1.375rem]" : "translate-x-0.5"
        )}
      />
    </button>
  )
}
