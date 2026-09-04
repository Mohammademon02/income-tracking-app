/**
 * The account colour palette.
 *
 * This list existed three times: the gradient map here, a parallel array of
 * `{name, value, gradient}` in the colour picker, and a shorter, *different*
 * set of allowed names in the CSV importer — so a colour the picker offered
 * (teal, amber, rose…) was rejected on import and silently rewritten to blue.
 */

export const ACCOUNT_COLORS = [
  { name: "Blue", value: "blue", gradient: "from-blue-500 to-indigo-600" },
  { name: "Green", value: "green", gradient: "from-green-500 to-emerald-600" },
  { name: "Purple", value: "purple", gradient: "from-purple-500 to-indigo-600" },
  { name: "Pink", value: "pink", gradient: "from-pink-500 to-rose-600" },
  { name: "Orange", value: "orange", gradient: "from-orange-500 to-red-600" },
  { name: "Teal", value: "teal", gradient: "from-teal-500 to-cyan-600" },
  { name: "Violet", value: "violet", gradient: "from-violet-500 to-purple-600" },
  { name: "Amber", value: "amber", gradient: "from-amber-500 to-orange-600" },
  { name: "Emerald", value: "emerald", gradient: "from-emerald-500 to-teal-600" },
  { name: "Rose", value: "rose", gradient: "from-rose-500 to-pink-600" },
  { name: "Cyan", value: "cyan", gradient: "from-cyan-500 to-blue-600" },
  { name: "Indigo", value: "indigo", gradient: "from-indigo-500 to-purple-600" },
] as const

export const ACCOUNT_COLOR_VALUES: readonly string[] = ACCOUNT_COLORS.map(
  (color) => color.value
)

export const DEFAULT_ACCOUNT_COLOR = "blue"

const GRADIENTS = new Map<string, string>(
  ACCOUNT_COLORS.map((color) => [color.value, `bg-linear-to-br ${color.gradient}`])
)

/** The avatar background for an account colour, falling back to the default. */
export function getAvatarGradient(color: string): string {
  return GRADIENTS.get(color) ?? GRADIENTS.get(DEFAULT_ACCOUNT_COLOR)!
}
