"use server"

import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getAccounts() {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

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
    const totalPoints = entryPointsMap.get(account.id) ?? 0
    const completedWithdrawals = completedMap.get(account.id) ?? 0
    const pendingWithdrawals = pendingMap.get(account.id) ?? 0

    const completedWithdrawalsInPoints = completedWithdrawals * 100
    const pendingWithdrawalsInPoints = pendingWithdrawals * 100

    return {
      id: account.id,
      name: account.name,
      color: account.color || "blue",
      totalPoints,
      completedWithdrawals,
      pendingWithdrawals,
      currentBalance: totalPoints - completedWithdrawalsInPoints - pendingWithdrawalsInPoints,
      createdAt: account.createdAt,
    }
  })
}

export async function createAccount(formData: FormData) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const color = (formData.get("color") as string) || "blue"

  if (!name || name.trim() === "") {
    return { error: "Account name is required" }
  }

  await prisma.account.create({
    data: {
      name: name.trim(),
      color,
    },
  })

  revalidatePath("/dashboard", "page")
  revalidatePath("/accounts", "page")
  revalidatePath("/entries", "page")

  return { success: true }
}

export async function updateAccount(id: string, formData: FormData) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const color = (formData.get("color") as string) || "blue"

  if (!name || name.trim() === "") {
    return { error: "Account name is required" }
  }

  try {
    await prisma.account.update({
      where: { id },
      data: {
        name: name.trim(),
        color,
      },
    })

    revalidatePath("/dashboard", "page")
    revalidatePath("/accounts", "page")
    revalidatePath("/entries", "page")

    return { success: true }
  } catch (error) {
    // Prisma error code P2025 = record not found
    if (
      error instanceof Error &&
      (error.message.includes("P2025") || error.message.includes("not found"))
    ) {
      return { error: "Account not found" }
    }
    return {
      error: `Failed to update account: ${error instanceof Error ? error.message : "Unknown error"
        }`,
    }
  }
}

export async function deleteAccount(id: string) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  await prisma.account.delete({
    where: { id },
  })

  revalidatePath("/dashboard", "page")
  revalidatePath("/accounts", "page")
  return { success: true }
}
