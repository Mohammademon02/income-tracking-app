import { z } from "zod"

/**
 * Input schemas for every mutation the app accepts.
 *
 * These existed before but were imported by nothing — every server action
 * hand-parsed `FormData` instead, which is how negative points, `Infinity`,
 * arbitrary status strings and malformed ObjectIds all became writable. The
 * helpers at the bottom are what actions use to run a schema over a `FormData`
 * and get back either clean data or a message safe to show the user.
 */

/** MongoDB ObjectId — 24 hex characters. Anything else throws inside Prisma. */
const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid account selected")

/** A calendar date as produced by `<input type="date">`. */
const dateKey = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Not a real date")

const accountColor = z
  .string()
  .regex(/^[a-z]+$/, "Invalid color")
  .max(20, "Invalid color")

export const createAccountSchema = z.object({
  name: z.string().trim().min(1, "Account name is required").max(50, "Account name is too long"),
  color: accountColor.default("blue"),
})

export const updateAccountSchema = createAccountSchema

export const createEntrySchema = z.object({
  accountId: objectId,
  date: dateKey,
  points: z.coerce
    .number()
    .finite("Points must be a number")
    .min(0, "Points cannot be negative")
    .max(1_000_000, "Points cannot exceed 1,000,000"),
})

export const updateEntrySchema = createEntrySchema

const withdrawalStatus = z.enum(["PENDING", "COMPLETED"])

export const createWithdrawalSchema = z.object({
  accountId: objectId,
  date: dateKey,
  /** Submitted in points, converted to dollars before storage. */
  amount: z.coerce
    .number()
    .finite("Amount must be a number")
    .min(1, "Amount must be at least 1 point")
    .max(1_000_000, "Amount cannot exceed 1,000,000 points"),
  status: withdrawalStatus.default("PENDING"),
  completedDate: dateKey.optional(),
})

export const updateWithdrawalSchema = createWithdrawalSchema.extend({
  status: withdrawalStatus,
})

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required").max(50, "Username too long"),
  password: z.string().min(1, "Password is required").max(200, "Password too long"),
})

export const userSettingsSchema = z.object({
  dailyGoalPoints: z.coerce.number().int().min(100).max(50_000).optional(),
  weeklyGoalPoints: z.coerce.number().int().min(100).max(350_000).optional(),
  monthlyGoalPoints: z.coerce.number().int().min(100).max(1_500_000).optional(),
  notificationsEnabled: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  quietHoursStart: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:MM")
    .nullable()
    .optional(),
  quietHoursEnd: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:MM")
    .nullable()
    .optional(),
})

/** A rejected parse, in the shape server actions already return to the client. */
export type ValidationFailure = { error: string }

/**
 * Collapse a `ZodError` into a single sentence.
 *
 * The forms in this app show one message at a time, so surfacing the first
 * problem keeps the contract simple. Field-level errors can be added later
 * without changing any call site, since the shape stays `{ error }`.
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the values you entered."
}

/**
 * Run a schema over `FormData`.
 *
 * Returns a discriminated union so callers can `if (!result.ok) return result`
 * and hand the failure straight back as the action's return value.
 */
export function parseFormData<T extends z.ZodTypeAny>(
  schema: T,
  formData: FormData
): { ok: true; data: z.infer<T> } | { ok: false; error: string } {
  const raw: Record<string, unknown> = {}

  for (const [key, value] of formData.entries()) {
    // Skip empty optional fields so `.optional()` and `.default()` apply
    // instead of the schema seeing an empty string.
    if (value === "") continue
    raw[key] = value
  }

  const result = schema.safeParse(raw)

  if (!result.success) {
    return { ok: false, error: formatZodError(result.error) }
  }

  return { ok: true, data: result.data }
}

/** Same, for a parsed JSON body from a route handler. */
export function parseBody<T extends z.ZodTypeAny>(
  schema: T,
  body: unknown
): { ok: true; data: z.infer<T> } | { ok: false; error: string } {
  const result = schema.safeParse(body)

  if (!result.success) {
    return { ok: false, error: formatZodError(result.error) }
  }

  return { ok: true, data: result.data }
}
