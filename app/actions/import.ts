"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { normalizeToDateMarker } from "@/lib/date-utils"
import { prisma } from "@/lib/prisma"
import { type ActionResult, requireSession, toActionError } from "@/lib/server-utils"

/**
 * Bulk create from an imported CSV.
 *
 * The import dialog parsed, validated and previewed a file and then handed the
 * rows to a callback that discarded them — there was no write path at all. This
 * is that path.
 *
 * The rows arrive already parsed by the client, so they are re-validated here.
 * Client-side validation is a convenience for the user; it is not a guarantee
 * about what reaches the database.
 */

/** Every page that can show imported data. */
const ALL_PATHS = [
  "/dashboard",
  "/accounts",
  "/entries",
  "/daily-earnings",
  "/withdrawals",
  "/withdrawals-reports",
  "/reports",
] as const

function revalidateAll() {
  for (const path of ALL_PATHS) revalidatePath(path, "page")
}

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid account reference")

/** Accepts a Date or an ISO string — server actions serialize Dates as either. */
const dateLike = z.union([z.date(), z.string()])

const accountRow = z.object({
  name: z.string().trim().min(1).max(50),
  color: z.string().regex(/^[a-z]+$/).max(20).default("blue"),
})

const entryRow = z.object({
  accountId: objectId,
  date: dateLike,
  points: z.coerce.number().finite().min(0).max(1_000_000),
})

const withdrawalRow = z.object({
  accountId: objectId,
  date: dateLike,
  /** Dollars, as parsed from the CSV. */
  amount: z.coerce.number().finite().min(0.01).max(10_000),
  status: z.enum(["PENDING", "COMPLETED"]).default("PENDING"),
  completedAt: dateLike.nullish(),
})

/** How many rows one import may create, to bound a runaway file. */
const MAX_ROWS = 2000

export type ImportOutcome = ActionResult & { imported?: number; skipped?: number }

function tooManyRows(count: number): ImportOutcome | null {
  if (count <= MAX_ROWS) return null
  return {
    success: false,
    error: `That file has ${count} rows. Import at most ${MAX_ROWS} at a time.`,
  }
}

export async function importAccountRows(rows: unknown[]): Promise<ImportOutcome> {
  await requireSession()

  const limit = tooManyRows(rows.length)
  if (limit) return limit

  const parsed = z.array(accountRow).safeParse(rows)
  if (!parsed.success) {
    return { success: false, error: "Some rows were not valid accounts." }
  }

  try {
    // Skip names that already exist rather than creating duplicates.
    const existing = await prisma.account.findMany({ select: { name: true } })
    const taken = new Set(existing.map((account) => account.name.toLowerCase()))

    const toCreate = parsed.data.filter((row) => !taken.has(row.name.toLowerCase()))

    if (toCreate.length > 0) {
      await prisma.account.createMany({ data: toCreate })
    }

    revalidateAll()

    return {
      success: true,
      imported: toCreate.length,
      skipped: parsed.data.length - toCreate.length,
    }
  } catch (error) {
    return toActionError(error, "Failed to import accounts.")
  }
}

export async function importEntryRows(rows: unknown[]): Promise<ImportOutcome> {
  await requireSession()

  const limit = tooManyRows(rows.length)
  if (limit) return limit

  const parsed = z.array(entryRow).safeParse(rows)
  if (!parsed.success) {
    return { success: false, error: "Some rows were not valid entries." }
  }

  const data: { accountId: string; date: Date; points: number }[] = []

  for (const row of parsed.data) {
    const date = normalizeToDateMarker(row.date)
    if (!date) continue
    data.push({ accountId: row.accountId, date, points: row.points })
  }

  if (data.length === 0) {
    return { success: false, error: "No rows had a usable date." }
  }

  try {
    await prisma.dailyEntry.createMany({ data })
    revalidateAll()

    return {
      success: true,
      imported: data.length,
      skipped: parsed.data.length - data.length,
    }
  } catch (error) {
    return toActionError(error, "Failed to import entries.")
  }
}

export async function importWithdrawalRows(rows: unknown[]): Promise<ImportOutcome> {
  await requireSession()

  const limit = tooManyRows(rows.length)
  if (limit) return limit

  const parsed = z.array(withdrawalRow).safeParse(rows)
  if (!parsed.success) {
    return { success: false, error: "Some rows were not valid withdrawals." }
  }

  const data: {
    accountId: string
    date: Date
    amount: number
    status: "PENDING" | "COMPLETED"
    completedAt: Date | null
  }[] = []

  for (const row of parsed.data) {
    const date = normalizeToDateMarker(row.date)
    if (!date) continue

    // A completed withdrawal always gets a completedAt, falling back to its
    // request date — every monthly report filters on that column, so a null
    // would make the row invisible in reports.
    const completedAt =
      row.status === "COMPLETED" ? (normalizeToDateMarker(row.completedAt) ?? date) : null

    data.push({
      accountId: row.accountId,
      date,
      amount: row.amount,
      status: row.status,
      completedAt,
    })
  }

  if (data.length === 0) {
    return { success: false, error: "No rows had a usable date." }
  }

  try {
    await prisma.withdrawal.createMany({ data })
    revalidateAll()

    return {
      success: true,
      imported: data.length,
      skipped: parsed.data.length - data.length,
    }
  } catch (error) {
    return toActionError(error, "Failed to import withdrawals.")
  }
}
