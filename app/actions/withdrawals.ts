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
    completedAt: (withdrawal as any).completedAt || null,
    accountId: withdrawal.accountId,
    accountName: withdrawal.account.name,
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

  revalidatePath("/dashboard")
  revalidatePath("/withdrawals")
  return { success: true }
}

export async function updateWithdrawal(id: string, formData: FormData) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const accountId = formData.get("accountId") as string
  const date = formData.get("date") as string
  const pointsAmount = parseFloat(formData.get("amount") as string)
  const status = formData.get("status") as "PENDING" | "COMPLETED"

  if (!accountId || !date || isNaN(pointsAmount) || !status) {
    return { error: "All fields are required" }
  }

  // Convert points to dollars (100 points = $1)
  const dollarAmount = pointsAmount / 100

  // For now, just update basic fields until database migration is complete
  await prisma.withdrawal.update({
    where: { id },
    data: {
      accountId,
      date: new Date(date),
      amount: dollarAmount,
      status,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/withdrawals")
  return { success: true }
}

export async function deleteWithdrawal(id: string) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  await prisma.withdrawal.delete({
    where: { id },
  })

  revalidatePath("/dashboard")
  revalidatePath("/withdrawals")
  return { success: true }
}
