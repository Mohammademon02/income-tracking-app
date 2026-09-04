import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Reveal } from "@/components/motion/reveal"
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
      {/*
        A fade with no travel, so every page arrives rather than snapping in —
        including the several that are a header plus one component and would
        otherwise need the wrapper adding by hand. Sections that want to move as
        well nest their own Reveal inside this; opacity here and translate there
        compose without fighting.
      */}
      <Reveal y={0} className="space-y-6 sm:space-y-8">
        {children}
      </Reveal>
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

/**
 * The tinted glyph that opens a card title.
 *
 * Card headers all carried `text-muted-foreground` icons, which made ten
 * sections look like ten instances of the same section. The tone is a wash
 * rather than a fill, so a page of them reads as tinted rather than as a row of
 * competing buttons, and it is the only way this app gets colour onto a screen
 * that is otherwise ink and one accent.
 *
 * `info`, `violet` and `rose` are not semantic — they exist to tell neutral
 * sections apart, and they map onto the chart series so a panel and the line
 * inside it can wear the same hue.
 */
const SECTION_TONE = {
  primary: "bg-primary/12 text-primary",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning",
  info: "bg-chart-2/12 text-chart-2",
  violet: "bg-chart-4/12 text-chart-4",
  rose: "bg-chart-5/12 text-chart-5",
} as const

export function SectionIcon({
  icon: Icon,
  tone = "primary",
}: {
  icon: LucideIcon
  tone?: keyof typeof SECTION_TONE
}) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-lg",
        SECTION_TONE[tone]
      )}
    >
      <Icon className="size-4" />
    </span>
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
