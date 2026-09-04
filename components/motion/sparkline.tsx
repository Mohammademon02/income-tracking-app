"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useId } from "react"

import { cn } from "@/lib/utils"

/**
 * A trend, at the size of a word.
 *
 * The dashboard's headline tiles state a total and nothing about how it got
 * there, which is the single most useful thing to know about an earnings
 * figure. A full chart cannot go in a tile; thirty points of shape can, and it
 * answers "is this climbing" without the reader leaving the row.
 *
 * The line draws itself on mount rather than fading in, because a line drawn
 * left to right is the same gesture as time passing — the motion says what the
 * mark means.
 */

export function Sparkline({
  values,
  className,
  tone,
  height = 32,
}: {
  values: number[]
  className?: string
  /**
   * Any CSS colour. Left unset the line inherits, so a caller can tint it with
   * a text-* class — which an unconditional `color: currentColor` in the style
   * attribute would silently win against.
   */
  tone?: string
  height?: number
}) {
  const reduced = useReducedMotion()
  // Gradient ids must be unique per instance or every sparkline on the page
  // paints with the first one's stops.
  const gradientId = useId()

  // Two points is the minimum that describes a direction.
  if (values.length < 2) return null

  const max = Math.max(...values)
  const min = Math.min(...values)
  // A flat series would divide by zero; drawing it through the middle is both
  // safe and honest — no change is no slope.
  const span = max - min || 1

  const step = 100 / (values.length - 1)
  const coords = values.map((value, index) => {
    const x = index * step
    // SVG y grows downward, so the ratio is inverted. The 4px inset keeps the
    // stroke's own width from clipping at the extremes.
    const y = 4 + (1 - (value - min) / span) * (height - 8)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })

  const line = `M ${coords.join(" L ")}`
  const area = `${line} L 100,${height} L 0,${height} Z`

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className={cn("w-full overflow-visible", className)}
      style={tone ? { height, color: tone } : { height }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      <motion.path
        d={area}
        fill={`url(#${gradientId})`}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        // Without this the stroke stretches with the viewBox and thins out on
        // wide tiles, since preserveAspectRatio is off.
        vectorEffect="non-scaling-stroke"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}
