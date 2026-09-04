"use server"

import { revalidatePath } from "next/cache"

import { computeBalance } from "@/lib/money"
import { prisma } from "@/lib/prisma"
import { type ActionResult, requireSession, toActionError } from "@/lib/server-utils"
import { createAccountSchema, parseFormData, updateAccountSchema } from "@/lib/validation"

/**
 * Deleting an account cascades to its entries and withdrawals (see the
 * `onDelete: Cascade` relations in schema.prisma), so every page that reads
 * either of those has to be revalidated too — not just the account pages.
 */
const ACCOUNT_PATHS = [
  "/dashboard",
  "/accounts",
  "/entries",
  "/daily-earnings",
  "/withdrawals",
  "/withdrawals-reports",
  "/reports",
] as const

function revalidateAccountPaths() {
  for (const path of ACCOUNT_PATHS) revalidatePath(path, "page")
}

export async function getAccounts() {
  await requireSession()

  // Use aggregation instead of loading all entries/withdrawals into memory
  const accounts = await prisma.account.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { entries: true, withdrawals: true } },
    },
  })

  // Fetch aggregated sums in a single DB call per account set
  const [entrySums, withdrawalSums] = await Promise.all([
    prisma.dailyEntry.groupBy({
      by: ["accountId"],
      _sum: { points: true },
    }),
    prisma.withdrawal.groupBy({
      by: ["accountId", "status"],
      _sum: { amount: true },
    }),
  ])

  // Build lookup maps for O(1) access
  const entryPointsMap = new Map(
    entrySums.map((e) => [e.accountId, e._sum.points ?? 0])
  )

  const completedMap = new Map<string, number>()
  const pendingMap = new Map<string, number>()
  for (const w of withdrawalSums) {
    if (w.status === "COMPLETED") {
      completedMap.set(w.accountId, w._sum.amount ?? 0)
    } else if (w.status === "PENDING") {
      pendingMap.set(w.accountId, w._sum.amount ?? 0)
    }
  }

  return accounts.map((account) => {
    const completedWithdrawals = completedMap.get(account.id) ?? 0
    const pendingWithdrawals = pendingMap.get(account.id) ?? 0

    // One shared definition of balance, so this page, insights and the
    // performance card can no longer disagree about the same account.
    const balance = computeBalance({
      lifetimePoints: entryPointsMap.get(account.id) ?? 0,
      completedDollars: completedWithdrawals,
      pendingDollars: pendingWithdrawals,
    })

    return {
      id: account.id,
      name: account.name,
      color: account.color || "blue",
      totalPoints: balance.lifetimePoints,
      completedWithdrawals,
      pendingWithdrawals,
      currentBalance: balance.availablePoints,
      entriesCount: account._count.entries,
      withdrawalsCount: account._count.withdrawals,
      createdAt: account.createdAt,
    }
  })
}

export async function createAccount(formData: FormData): Promise<ActionResult> {
  await requireSession()

  const parsed = parseFormData(createAccountSchema, formData)
  if (!parsed.ok) return { success: false, error: parsed.error }

  try {
    await prisma.account.create({
      data: parsed.data,
    })
  } catch (error) {
    return toActionError(error, "Failed to create the account.")
  }

  revalidateAccountPaths()

  return { success: true }
}

export async function updateAccount(id: string, formData: FormData): Promise<ActionResult> {
  await requireSession()

  const parsed = parseFormData(updateAccountSchema, formData)
  if (!parsed.ok) return { success: false, error: parsed.error }

  try {
    await prisma.account.update({
      where: { id },
      data: parsed.data,
    })
  } catch (error) {
    return toActionError(error, "Failed to update the account.")
  }

  revalidateAccountPaths()

  return { success: true }
}

export async function deleteAccount(id: string): Promise<ActionResult> {
  await requireSession()

  try {
    await prisma.account.delete({
      where: { id },
    })
  } catch (error) {
    return toActionError(error, "Failed to delete the account.")
  }

  revalidateAccountPaths()

  return { success: true }
}
