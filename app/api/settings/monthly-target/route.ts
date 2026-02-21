import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"

// For now, we'll use a simple in-memory storage
// In production, this should be stored in database
let userTargets = new Map<string, { points: number; earnings: number; lastUpdated: Date }>()

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userTarget = userTargets.get(session.username) || {
      points: 14000,
      earnings: 140,
      lastUpdated: new Date()
    }

    return NextResponse.json(userTarget)
  } catch (error) {
    console.error("Error fetching monthly target:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { points, earnings } = await request.json()

    if (!points || !earnings || points < 1000 || earnings < 10 || points > 100000 || earnings > 1000) {
      return NextResponse.json({ error: "Invalid target values. Points: 1000-100000, Earnings: $10-$1000" }, { status: 400 })
    }

    const target = {
      points: parseInt(points),
      earnings: parseFloat(earnings),
      lastUpdated: new Date()
    }

    userTargets.set(session.username, target)

    return NextResponse.json({ success: true, target })
  } catch (error) {
    console.error("Error saving monthly target:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}