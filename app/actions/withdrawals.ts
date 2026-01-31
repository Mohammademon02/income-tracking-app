"use server"

import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getWithdrawals(accountId?: string) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const withdrawals = await prisma.withdrawal.findMany({
    where: accountId ? { accountId } : undefined,
    include: { account: true },
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

  // Clear all possible caches
  revalidatePath("/dashboard", "page")
  revalidatePath("/withdrawals", "page")
  revalidatePath("/accounts", "page")
  revalidatePath("/", "layout")
  
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

  // Get current withdrawal to check if status is changing
  const currentWithdrawal = await prisma.withdrawal.findUnique({
    where: { id }
  })

  const updateData: any = {
    accountId,
    date: new Date(date),
    amount: dollarAmount,
    status,
  }

  // Handle completion date logic
  if (status === "COMPLETED") {
    if (completedDate) {
      // Use the manually provided completion date
      updateData.completedAt = new Date(completedDate)
    } else if (currentWithdrawal?.status !== "COMPLETED") {
      // If no manual date provided and status is changing to COMPLETED, use current time
      updateData.completedAt = new Date()
    }
    // If already completed and no new date provided, keep existing completedAt
  } else if (status === "PENDING") {
    // If status is changing to PENDING, clear completedAt
    updateData.completedAt = null
  }

  await prisma.withdrawal.update({
    where: { id },
    data: updateData,
  })

  // Clear all possible caches
  revalidatePath("/dashboard", "page")
  revalidatePath("/withdrawals", "page")
  revalidatePath("/accounts", "page")
  revalidatePath("/", "layout")
  
  return { success: true }
}

export async function deleteWithdrawal(id: string) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  await prisma.withdrawal.delete({
    where: { id },
  })

  // Clear all possible caches
  revalidatePath("/dashboard", "page")
  revalidatePath("/withdrawals", "page")
  revalidatePath("/accounts", "page")
  revalidatePath("/", "layout")
  
  return { success: true }
}
