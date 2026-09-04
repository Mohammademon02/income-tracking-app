"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ComponentProps } from "react"

/**
 * Dark mode.
 *
 * `next-themes` was already a dependency and `globals.css` already carried a
 * complete `.dark` token set, but nothing ever added the `.dark` class, so the
 * whole block was inert. This is the missing piece: it toggles the class on
 * <html>, which is what `@custom-variant dark (&:is(.dark *))` keys off.
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
