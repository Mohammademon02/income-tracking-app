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

    // Convert dollar amounts to points for balance calculation (100 points = $1)
    const completedWithdrawalsInPoints = completedWithdrawals * 100
    const pendingWithdrawalsInPoints = pendingWithdrawals * 100

    return {
      id: account.id,
      name: account.name,
      color: account.color || "blue", // Fallback to blue if color is missing
      totalPoints,
      completedWithdrawals, // Keep in dollars for dashboard display conversion
      pendingWithdrawals, // Keep in dollars for dashboard display conversion
      currentBalance: totalPoints - completedWithdrawalsInPoints - pendingWithdrawalsInPoints, // Calculate in points
      createdAt: account.createdAt,
    }
  })
}

export async function createAccount(formData: FormData) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const color = formData.get("color") as string || "blue"

  if (!name || name.trim() === "") {
    return { error: "Account name is required" }
  }

  await prisma.account.create({
    data: { 
      name: name.trim(),
      color: color
    },
  })

  // Revalidate multiple paths to ensure UI updates
  revalidatePath("/dashboard")
  revalidatePath("/accounts")
  revalidatePath("/entries")
  revalidatePath("/", "layout") // Revalidate root layout
  
  return { success: true }
}

export async function updateAccount(id: string, formData: FormData) {
  const session = await verifySession()
  if (!session) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const color = (formData.get("color") as string) || "blue"

  console.log("Updating account:", { id, name, color }) // Debug log

  if (!name || name.trim() === "") {
    return { error: "Account name is required" }
  }

  try {
    // First, try to ensure the account exists and has a color field
    const existingAccount = await prisma.account.findUnique({
      where: { id }
    })

    if (!existingAccount) {
      return { error: "Account not found" }
    }

    // Update the account
    const result = await prisma.account.update({
      where: { id },
      data: {
        name: name.trim(),
        color: color
      },
    })

    console.log("Account updated successfully:", result) // Debug log

    // Clear all possible caches
    revalidatePath("/dashboard", "page")
    revalidatePath("/accounts", "page") 
    revalidatePath("/entries", "page")
    revalidatePath("/", "layout")
    
    // Also try to revalidate by tag if using tags
    try {
      const { revalidateTag } = await import('next/cache')
      revalidateTag('accounts')
    } catch (e) {
      // Ignore if revalidateTag is not available
    }
    
    return { success: true }
  } catch (error) {
    console.error("Error updating account:", error)
    
    // If the error is related to the color field not existing, try to add it first
    if (error instanceof Error && error.message.includes('color')) {
      try {
        console.log("Attempting to add color field to account...")
        
        // Use raw MongoDB operation to add the color field
        await prisma.$runCommandRaw({
          update: "accounts",
          updates: [
            {
              q: { _id: { $oid: id } },
              u: { 
                $set: { 
                  name: name.trim(),
                  color: color 
                }
              }
            }
          ]
        })

        revalidatePath("/dashboard")
        revalidatePath("/accounts")
        return { success: true }
      } catch (rawError) {
        console.error("Raw update also failed:", rawError)
        return { error: `Failed to update account: ${rawError instanceof Error ? rawError.message : 'Unknown error'}` }
      }
    }
    
    return { error: `Failed to update account: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
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
