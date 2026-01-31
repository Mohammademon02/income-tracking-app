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
    accountId: withdrawal.accountId,
    accountName: withdrawal.account.name,
  }))
}

export async function createWithdrawal(formData: FormData) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const accountId = formData.get("accountId") as string
  const date = formData.get("date") as string
  const amount = parseFloat(formData.get("amount") as string)
  const status = (formData.get("status") as "PENDING" | "COMPLETED") || "PENDING"

  if (!accountId || !date || isNaN(amount)) {
    return { error: "All fields are required" }
  }

  await prisma.withdrawal.create({
    data: {
      accountId,
      date: new Date(date),
      amount,
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
  const amount = parseFloat(formData.get("amount") as string)
  const status = formData.get("status") as "PENDING" | "COMPLETED"

  if (!accountId || !date || isNaN(amount) || !status) {
    return { error: "All fields are required" }
  }

  await prisma.withdrawal.update({
    where: { id },
    data: {
      accountId,
      date: new Date(date),
      amount,
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
