import { cn } from "@/lib/utils"

/**
 * A loading placeholder.
 *
 * `animate-pulse` fades a block in and out in place, which reads as a thing
 * that is broken rather than a thing that is arriving. A highlight travelling
 * left to right reads as progress, and it is the same gesture the sparklines
 * and the progress bars use, so loading and loaded share one visual idea.
 *
 * `motion-safe:` rather than a JS check: this is pure CSS, so the media query
 * in globals.css can actually reach it.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-md bg-surface-2", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/8 to-transparent motion-safe:animate-[shimmer_1.6s_ease-in-out_infinite]"
      />
    </div>
  )
}

export { Skeleton }
