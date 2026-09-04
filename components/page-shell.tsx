import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * The shared page frame.
 *
 * Every authenticated page previously repeated the same root class string by
 * hand — and in two different Tailwind v4 spellings for the same gradient. That
 * duplication also carried three problems into every page: a `min-h-screen`
 * nested inside the app shell's own, a second background gradient painted over
 * the shell's, and no max width at all, so content stretched edge to edge on a
 * wide monitor.
 */

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8", className)}>
      <div className="space-y-6 sm:space-y-8">{children}</div>
    </div>
  )
}

/**
 * A page's title block.
 *
 * `actions` sits beside the title on wide screens and stacks below on narrow
 * ones. The heading is a real `<h1>` — the dashboard had none, having handed
 * that role to a decorative clock.
 */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1>{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

/** A titled section within a page, for grouping below the header. */
export function PageSection({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("space-y-4", className)}>
      {title || actions ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            {title ? <h2>{title}</h2> : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}
