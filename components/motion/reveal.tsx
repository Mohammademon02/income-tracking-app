"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Entrance motion.
 *
 * The app ships framer-motion as a dependency and does not import it anywhere:
 * a previous pass stripped 900 lines of decorative keyframes — water waves,
 * morphing blobs, 3D card tilts, several of them referencing keyframes that did
 * not exist — and removed the motion along with the decoration. What is left
 * here is the part worth keeping. Content arrives rather than appearing, which
 * tells the eye where a region begins and in what order to read it.
 *
 * ## Why these numbers
 *
 * 12px of travel and 500ms is roughly the threshold where movement registers as
 * intent rather than as an effect. The easing is a decelerating curve — fast
 * out of the gate, settling at the end — so elements feel like they are
 * catching up to a layout that already exists, not sliding into an empty one.
 *
 * ## Reduced motion
 *
 * globals.css clamps CSS animation for `prefers-reduced-motion`, but framer
 * writes inline styles from JS and that rule cannot reach it. Every component
 * in this directory therefore checks the preference itself and renders a plain
 * element, which also means no wrapper animation state is left half-applied.
 */

const EASE = [0.22, 1, 0.36, 1] as const

export function Reveal({
  children,
  className,
  delay = 0,
  y = 12,
}: {
  children: ReactNode
  className?: string
  delay?: number
  /** Travel distance in pixels. 0 gives a pure fade. */
  y?: number
}) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/**
 * A container whose children arrive in sequence.
 *
 * Use it for a row of tiles or a list, where the order carries meaning. Pair
 * with `StaggerItem` — a bare child will not animate, because the variants that
 * drive it are inherited from this element.
 */
export function Stagger({
  children,
  className,
  gap = 0.06,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  /** Seconds between each child starting. */
  gap?: number
  delay?: number
}) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  // Checked here as well as in Stagger: under reduced motion the parent renders
  // a plain div, and a motion child inheriting nothing would sit at its hidden
  // variant — invisible — forever.
  const reduced = useReducedMotion()

  if (reduced) return <div className={cn("h-full", className)}>{children}</div>

  return (
    <motion.div
      className={cn("h-full", className)}
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  )
}
