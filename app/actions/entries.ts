"use server"

import { revalidatePath } from "next/cache"

import { dateKeyToDate } from "@/lib/date-utils"
import { prisma } from "@/lib/prisma"
import { type ActionResult, requireSession, toActionError } from "@/lib/server-utils"
import { createEntrySchema, parseFormData, updateEntrySchema } from "@/lib/validation"

/** Pages whose data changes whenever an entry does. */
const ENTRY_PATHS = ["/dashboard", "/entries", "/daily-earnings", "/reports"] as const

function revalidateEntryPaths() {
  for (const path of ENTRY_PATHS) revalidatePath(path, "page")
}

export async function getEntries(accountId?: string) {
  await requireSession()

  const entries = await prisma.dailyEntry.findMany({
    where: accountId ? { accountId } : undefined,
    include: {
      account: {
        select: {
          name: true,
          color: true,
        },
      },
    },
    orderBy: { date: "desc" },
  })

  return entries.map((entry) => ({
    id: entry.id,
    date: entry.date,
    points: entry.points,
    accountId: entry.accountId,
    accountName: entry.account.name,
    accountColor: entry.account.color || "blue",
    createdAt: entry.createdAt, // Add this for sorting in components
  }))
}

/** Fetch ALL entries for goal tracking and analytics */
export async function getAllEntries() {
  await requireSession()

  const entries = await prisma.dailyEntry.findMany({
    include: { account: { select: { name: true, color: true } } },
    orderBy: { date: "desc" },
  })

  return entries.map((entry) => ({
    id: entry.id,
    date: entry.date,
    points: entry.points,
    accountId: entry.accountId,
    accountName: entry.account.name,
    accountColor: entry.account.color || "blue",
  }))
}

/** Fetch only the N most recent entries — used by the dashboard. */
export async function getRecentEntries(take = 5) {
  await requireSession()

  const entries = await prisma.dailyEntry.findMany({
    take,
    include: { account: { select: { name: true, color: true } } },
    orderBy: { date: "desc" },
  })

  return entries.map((entry) => ({
    id: entry.id,
    date: entry.date,
    points: entry.points,
    accountId: entry.accountId,
    accountName: entry.account.name,
    accountColor: entry.account.color || "blue",
  }))
}

export async function createEntry(formData: FormData): Promise<ActionResult> {
  await requireSession()

  const parsed = parseFormData(createEntrySchema, formData)
  if (!parsed.ok) return { success: false, error: parsed.error }

  const { accountId, date, points } = parsed.data

  try {
    await prisma.dailyEntry.create({
      data: {
        accountId,
        // Stored as a UTC date marker so every range query lines up. See lib/date-utils.
        date: dateKeyToDate(date),
        points,
      },
    })
  } catch (error) {
    return toActionError(error, "Failed to save the entry.")
  }

  revalidateEntryPaths()

  return { success: true }
}

export async function updateEntry(id: string, formData: FormData): Promise<ActionResult> {
  await requireSession()

  const parsed = parseFormData(updateEntrySchema, formData)
  if (!parsed.ok) return { success: false, error: parsed.error }

  const { accountId, date, points } = parsed.data

  try {
    await prisma.dailyEntry.update({
      where: { id },
      data: {
        accountId,
        date: dateKeyToDate(date),
        points,
      },
    })
  } catch (error) {
    return toActionError(error, "Failed to update the entry.")
  }

  revalidateEntryPaths()

  return { success: true }
}

export async function deleteEntry(id: string): Promise<ActionResult> {
  await requireSession()

  try {
    await prisma.dailyEntry.delete({
      where: { id },
    })
  } catch (error) {
    return toActionError(error, "Failed to delete the entry.")
  }

  revalidateEntryPaths()

  return { success: true }
}
