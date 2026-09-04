"use client"

import { animate, useReducedMotion } from "framer-motion"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { formatDollars, formatPoints } from "@/lib/money"

/**
 * A number that counts to its value.
 *
 * Worth doing here specifically because this app's headline figures are
 * cumulative earnings: the count is not decoration, it re-states that the
 * number got there by accumulating. It is also the one place a chart cannot
 * help, since a single total has no shape to draw.
 *
 * ## Avoiding the flash of zero
 *
 * The server renders the real value, so the markup is correct without JS and
 * search/preview crawlers see the figure. The animation then has to start from
 * zero on the client, and doing that in `useEffect` — which runs after paint —
 * shows the final number for one frame before it snaps back. Running it in a
 * layout effect commits the reset in the same frame, so nothing flashes.
 * `useLayoutEffect` warns when called during SSR, hence the switch.
 */

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

/**
 * Named rather than a callback, because the dashboard pages that use this are
 * server components and a function prop does not cross that boundary. Every
 * formatter has to tolerate the fractional values the animation passes through.
 */
export type CountFormat = "points" | "dollars" | "integer"

const FORMATTERS: Record<CountFormat, (value: number) => string> = {
  points: formatPoints,
  dollars: formatDollars,
  integer: (value) => Math.round(value).toLocaleString("en-US"),
}

export function CountUp({
  value,
  format = "points",
  duration = 1.1,
  className,
}: {
  value: number
  format?: CountFormat
  duration?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(value)
  // The value the last animation ran to. Re-animating only on a real change
  // keeps a parent re-render from restarting the count.
  const animatedTo = useRef<number | null>(null)

  useIsomorphicLayoutEffect(() => {
    if (reduced) {
      setDisplay(value)
      return
    }
    if (animatedTo.current === value) return
    animatedTo.current = value

    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setDisplay,
    })

    return () => controls.stop()
  }, [value, duration, reduced])

  return (
    <span className={className} suppressHydrationWarning>
      {FORMATTERS[format](display)}
    </span>
  )
}
