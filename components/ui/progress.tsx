"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

/**
 * A share bar.
 *
 * Two things were wrong with it. The fill was `from-blue-500 to-indigo-600` —
 * one of the last hardcoded palette pairs in the app, and the reason these bars
 * stayed blue after the brand stopped being blue. And at `h-4` it was as tall
 * as the text beside it, which reads as a component rather than as a
 * measurement; a share bar wants to be a rule, not a container.
 *
 * `color` takes a CSS colour so a row can plot its own account's colour, which
 * is the only way a list of five bars says anything more than "these are
 * different lengths".
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { color?: string }
>(({ className, value, color, ...props }, ref) => {
  const reduced = useReducedMotion()
  const ratio = Math.min(Math.max(value ?? 0, 0), 100) / 100

  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={value}
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)}
      {...props}
    >
      {/* scaleX rather than the translateX this used before: a transform from
          zero is what makes the bar grow on mount instead of appearing at its
          final length. */}
      <ProgressPrimitive.Indicator asChild>
        <motion.div
          className="h-full w-full origin-left rounded-full"
          style={{
            background: color
              ? `linear-gradient(90deg, color-mix(in oklab, ${color} 70%, transparent), ${color})`
              : "linear-gradient(90deg, var(--chart-2), var(--primary))",
          }}
          initial={reduced ? false : { scaleX: 0 }}
          animate={{ scaleX: ratio }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
