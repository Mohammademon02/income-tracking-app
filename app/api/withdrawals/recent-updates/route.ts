import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get withdrawals updated in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    const recentUpdates = await prisma.withdrawal.findMany({
      where: {
        updatedAt: {
          gte: fiveMinutesAgo
        },
        status: "COMPLETED" // Only notify on completions
      },
      include: {
        account: {
          select: {
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    })

    const updates = recentUpdates.map(withdrawal => ({
      id: withdrawal.id,
      amount: withdrawal.amount,
      status: withdrawal.status,
      date: withdrawal.date,
      completedAt: withdrawal.completedAt,
      accountName: withdrawal.account.name,
      accountColor: withdrawal.account.color,
      updatedAt: withdrawal.updatedAt
    }))

    return NextResponse.json(updates)
  } catch (error) {
    console.error("Error fetching withdrawal updates:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}