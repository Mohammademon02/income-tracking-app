import { getAvatarGradient } from "@/lib/avatar-utils"
import { cn } from "@/lib/utils"

/**
 * The circular account initial.
 *
 * This markup was repeated in five places with slightly different sizes, ring
 * widths and status-dot treatments. One component keeps them consistent and
 * makes the avatar a single place to change.
 */
export function AccountAvatar({
  name,
  color,
  size = "md",
  className,
}: {
  name: string
  color: string
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const sizeClass = {
    sm: "size-6 text-[10px]",
    md: "size-9 text-xs",
    lg: "size-10 text-sm",
  }[size]

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        sizeClass,
        getAvatarGradient(color || "blue"),
        className
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}
