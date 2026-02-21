"use server"

import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getWithdrawals(accountId?: string) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

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
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

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
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

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

export async function createWithdrawal(formData: FormData) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const accountId = formData.get("accountId") as string
  const date = formData.get("date") as string
  const pointsAmount = parseFloat(formData.get("amount") as string)
  const status = (formData.get("status") as "PENDING" | "COMPLETED") || "PENDING"

  if (!accountId || !date || isNaN(pointsAmount)) {
    return { error: "All fields are required" }
  }

  // Convert points to dollars (100 points = $1)
  const dollarAmount = pointsAmount / 100

  await prisma.withdrawal.create({
    data: {
      accountId,
      date: new Date(date),
      amount: dollarAmount,
      status,
    },
  })

  revalidatePath("/dashboard", "page")
  revalidatePath("/withdrawals", "page")
  revalidatePath("/withdrawals-reports", "page")

  return { success: true }
}

export async function updateWithdrawal(id: string, formData: FormData) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const accountId = formData.get("accountId") as string
  const date = formData.get("date") as string
  const pointsAmount = parseFloat(formData.get("amount") as string)
  const status = formData.get("status") as "PENDING" | "COMPLETED"
  const completedDate = formData.get("completedDate") as string

  if (!accountId || !date || isNaN(pointsAmount) || !status) {
    return { error: "All fields are required" }
  }

  // Convert points to dollars (100 points = $1)
  const dollarAmount = pointsAmount / 100

  // Get current withdrawal only to check status change for completedAt logic
  const currentWithdrawal = await prisma.withdrawal.findUnique({
    where: { id },
    select: { status: true },
  })

  if (!currentWithdrawal) {
    return { error: "Withdrawal not found" }
  }

  const updateData: {
    accountId: string
    date: Date
    amount: number
    status: "PENDING" | "COMPLETED"
    completedAt?: Date | null
  } = {
    accountId,
    date: new Date(date),
    amount: dollarAmount,
    status,
  }

  // Handle completion date logic
  if (status === "COMPLETED") {
    if (completedDate) {
      updateData.completedAt = new Date(completedDate)
    } else if (currentWithdrawal.status !== "COMPLETED") {
      updateData.completedAt = new Date()
    }
  } else if (status === "PENDING") {
    updateData.completedAt = null
  }

  await prisma.withdrawal.update({
    where: { id },
    data: updateData,
  })

  revalidatePath("/dashboard", "page")
  revalidatePath("/withdrawals", "page")
  revalidatePath("/withdrawals-reports", "page")

  return { success: true }
}

export async function deleteWithdrawal(id: string) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  await prisma.withdrawal.delete({
    where: { id },
  })

  revalidatePath("/dashboard", "page")
  revalidatePath("/withdrawals", "page")
  revalidatePath("/withdrawals-reports", "page")

  return { success: true }
}
