"use server"

import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getEntries(accountId?: string) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const entries = await prisma.dailyEntry.findMany({
    where: accountId ? { accountId } : undefined,
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
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

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

export async function createEntry(formData: FormData) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const accountId = formData.get("accountId") as string
  const date = formData.get("date") as string
  const points = parseFloat(formData.get("points") as string)

  if (!accountId || !date || isNaN(points)) {
    return { error: "All fields are required" }
  }

  await prisma.dailyEntry.create({
    data: {
      accountId,
      date: new Date(date),
      points,
    },
  })

  revalidatePath("/dashboard", "page")
  revalidatePath("/entries", "page")
  revalidatePath("/daily-earnings", "page")

  return { success: true }
}

export async function updateEntry(id: string, formData: FormData) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const accountId = formData.get("accountId") as string
  const date = formData.get("date") as string
  const points = parseFloat(formData.get("points") as string)

  if (!accountId || !date || isNaN(points)) {
    return { error: "All fields are required" }
  }

  await prisma.dailyEntry.update({
    where: { id },
    data: {
      accountId,
      date: new Date(date),
      points,
    },
  })

  revalidatePath("/dashboard", "page")
  revalidatePath("/entries", "page")
  revalidatePath("/daily-earnings", "page")

  return { success: true }
}

export async function deleteEntry(id: string) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  await prisma.dailyEntry.delete({
    where: { id },
  })

  revalidatePath("/dashboard", "page")
  revalidatePath("/entries", "page")
  revalidatePath("/daily-earnings", "page")

  return { success: true }
}
