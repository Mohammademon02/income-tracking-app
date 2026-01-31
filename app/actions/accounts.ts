"use server"

import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getAccounts() {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const accounts = await prisma.account.findMany({
    include: {
      entries: true,
      withdrawals: true,
    },
    orderBy: { name: "asc" },
  })

  return accounts.map((account) => {
    const totalPoints = account.entries.reduce((sum, e) => sum + e.points, 0)
    const completedWithdrawals = account.withdrawals
      .filter((w) => w.status === "COMPLETED")
      .reduce((sum, w) => sum + w.amount, 0)
    const pendingWithdrawals = account.withdrawals
      .filter((w) => w.status === "PENDING")
      .reduce((sum, w) => sum + w.amount, 0)

    return {
      id: account.id,
      name: account.name,
      totalPoints,
      completedWithdrawals,
      pendingWithdrawals,
      currentBalance: totalPoints - completedWithdrawals - pendingWithdrawals,
      createdAt: account.createdAt,
    }
  })
}

export async function createAccount(formData: FormData) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const name = formData.get("name") as string

  if (!name || name.trim() === "") {
    return { error: "Account name is required" }
  }

  await prisma.account.create({
    data: { name: name.trim() },
  })

  revalidatePath("/dashboard")
  revalidatePath("/accounts")
  return { success: true }
}

export async function updateAccount(id: string, formData: FormData) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const name = formData.get("name") as string

  if (!name || name.trim() === "") {
    return { error: "Account name is required" }
  }

  await prisma.account.update({
    where: { id },
    data: { name: name.trim() },
  })

  revalidatePath("/dashboard")
  revalidatePath("/accounts")
  return { success: true }
}

export async function deleteAccount(id: string) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  await prisma.account.delete({
    where: { id },
  })

  revalidatePath("/dashboard")
  revalidatePath("/accounts")
  return { success: true }
}
