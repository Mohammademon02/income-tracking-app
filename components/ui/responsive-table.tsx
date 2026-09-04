import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Table on wide screens, cards on phones.
 *
 * All three tables in this app rendered a plain `<table>` inside a wrapper with
 * `overflow-hidden` — not `overflow-x-auto` — so on a phone the rightmost
 * columns were clipped rather than scrollable. That included the actions menu,
 * which made edit and delete unreachable on mobile entirely. A `MobileTable`
 * component existed to solve this but was never imported anywhere.
 *
 * Rendering both trees costs a little markup and is worth it: a single tree
 * with CSS-hidden columns still leaves the row unreadable at 375px.
 */

export function TableShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("hidden overflow-x-auto rounded-lg border bg-card md:block", className)}>
      {children}
    </div>
  )
}

/** The phone-width counterpart to TableShell. */
export function CardList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn("space-y-3 md:hidden", className)}>{children}</div>
}

/** One record as a card, with its actions always reachable. */
export function DataCard({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <div className="truncate font-medium">{title}</div>
          {subtitle ? (
            <div className="text-sm text-muted-foreground">{subtitle}</div>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children ? <div className="mt-3 space-y-2">{children}</div> : null}
    </div>
  )
}

/** A label/value pair inside a DataCard. */
export function DataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium tabular-nums">{value}</span>
    </div>
  )
}

/** Shown in place of the table when there is nothing to list. */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-dashed bg-card px-6 py-16 text-center">
      {icon ? (
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      ) : null}
      <h3>{title}</h3>
      {description ? (
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
