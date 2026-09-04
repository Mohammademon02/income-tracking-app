"use server"

import { revalidatePath } from "next/cache"

import { dateKeyToDate, todayKey } from "@/lib/date-utils"
import { pointsToDollars } from "@/lib/money"
import { prisma } from "@/lib/prisma"
import { type ActionResult, requireSession, toActionError } from "@/lib/server-utils"
import { createWithdrawalSchema, parseFormData, updateWithdrawalSchema } from "@/lib/validation"

/** Pages whose data changes whenever a withdrawal does. */
const WITHDRAWAL_PATHS = [
  "/dashboard",
  "/withdrawals",
  "/withdrawals-reports",
  "/reports",
] as const

function revalidateWithdrawalPaths() {
  for (const path of WITHDRAWAL_PATHS) revalidatePath(path, "page")
}

export async function getWithdrawals(accountId?: string) {
  await requireSession()

  const withdrawals = await prisma.withdrawal.findMany({
    where: accountId ? { accountId } : undefined,
    include: { account: { select: { name: true, color: true } } },
    orderBy: { date: "desc" },
  })

  return withdrawals.map((withdrawal) => ({
    id: withdrawal.id,
    date: withdrawal.date,
    amount: withdrawal.amount,
    status: withdrawal.status,
    completedAt: withdrawal.completedAt || null,
    accountId: withdrawal.accountId,
    accountName: withdrawal.account.name,
    accountColor: withdrawal.account.color || "blue",
  }))
}

/** Fetch only the N most recent withdrawals — used by the dashboard. */
export async function getRecentWithdrawals(take = 5) {
  await requireSession()

  const withdrawals = await prisma.withdrawal.findMany({
    take,
    include: { account: { select: { name: true, color: true } } },
    orderBy: { date: "desc" },
  })

  return withdrawals.map((withdrawal) => ({
    id: withdrawal.id,
    date: withdrawal.date,
    amount: withdrawal.amount,
    status: withdrawal.status,
    completedAt: withdrawal.completedAt || null,
    accountId: withdrawal.accountId,
    accountName: withdrawal.account.name,
    accountColor: withdrawal.account.color || "blue",
  }))
}

/** Fetch only pending withdrawals — used by the dashboard pending card. */
export async function getPendingWithdrawals() {
  await requireSession()

  const withdrawals = await prisma.withdrawal.findMany({
    where: { status: "PENDING" },
    include: { account: { select: { name: true, color: true } } },
    orderBy: { date: "desc" },
  })

  return withdrawals.map((withdrawal) => ({
    id: withdrawal.id,
    date: withdrawal.date,
    amount: withdrawal.amount,
    status: withdrawal.status as "PENDING",
    completedAt: null,
    accountId: withdrawal.accountId,
    accountName: withdrawal.account.name,
    accountColor: withdrawal.account.color || "blue",
  }))
}

export async function createWithdrawal(formData: FormData): Promise<ActionResult> {
  await requireSession()

  const parsed = parseFormData(createWithdrawalSchema, formData)
  if (!parsed.ok) return { success: false, error: parsed.error }

  const { accountId, date, amount, status, completedDate } = parsed.data

  // The form collects points; the column stores dollars.
  const dollarAmount = pointsToDollars(amount)

  // A withdrawal created as COMPLETED still needs completedAt — every monthly
  // report filters on that column, so leaving it null (as this used to) meant
  // the withdrawal never appeared in any report at all.
  //
  // When no completion date is given, the request date is used rather than
  // today: creating an already-completed withdrawal is back-filling history,
  // and dating it today would file an old payout into the current month.
  const completedAt =
    status === "COMPLETED" ? dateKeyToDate(completedDate ?? date) : null

  try {
    await prisma.withdrawal.create({
      data: {
        accountId,
        date: dateKeyToDate(date),
        amount: dollarAmount,
        status,
        completedAt,
      },
    })
  } catch (error) {
    return toActionError(error, "Failed to save the withdrawal.")
  }

  revalidateWithdrawalPaths()

  return { success: true }
}

export async function updateWithdrawal(id: string, formData: FormData): Promise<ActionResult> {
  await requireSession()

  const parsed = parseFormData(updateWithdrawalSchema, formData)
  if (!parsed.ok) return { success: false, error: parsed.error }

  const { accountId, date, amount, status, completedDate } = parsed.data

  const dollarAmount = pointsToDollars(amount)

  const current = await prisma.withdrawal.findUnique({
    where: { id },
    select: { status: true, completedAt: true },
  })

  if (!current) {
    return { success: false, error: "Withdrawal not found" }
  }

  let completedAt: Date | null = current.completedAt
  if (status === "COMPLETED") {
    if (completedDate) {
      completedAt = dateKeyToDate(completedDate)
    } else if (current.status !== "COMPLETED") {
      // Newly completed with no date supplied: it landed today.
      completedAt = dateKeyToDate(todayKey())
    }
  } else {
    completedAt = null
  }

  try {
    await prisma.withdrawal.update({
      where: { id },
      data: {
        accountId,
        date: dateKeyToDate(date),
        amount: dollarAmount,
        status,
        completedAt,
      },
    })
  } catch (error) {
    return toActionError(error, "Failed to update the withdrawal.")
  }

  revalidateWithdrawalPaths()

  return { success: true }
}

export async function deleteWithdrawal(id: string): Promise<ActionResult> {
  await requireSession()

  try {
    await prisma.withdrawal.delete({
      where: { id },
    })
  } catch (error) {
    return toActionError(error, "Failed to delete the withdrawal.")
  }

  revalidateWithdrawalPaths()

  return { success: true }
}
