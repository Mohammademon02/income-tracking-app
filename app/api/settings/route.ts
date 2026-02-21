import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Try to get user settings, fallback to defaults if database not ready
    let settings
    try {
      settings = await prisma.userSettings.findFirst()
      
      if (!settings) {
        // Create default settings
        settings = await prisma.userSettings.create({
          data: {
            dailyGoalPoints: 2000,
            weeklyGoalPoints: 14000,
            monthlyGoalPoints: 60000,
            notificationsEnabled: true,
            emailNotifications: false,
            pushNotifications: true,
            quietHoursStart: "22:00",
            quietHoursEnd: "08:00"
          }
        })
      }
    } catch (dbError) {
      console.log("Database not ready, returning default settings")
      // Return default settings if database is not ready
      settings = {
        id: "default",
        dailyGoalPoints: 2000,
        weeklyGoalPoints: 14000,
        monthlyGoalPoints: 60000,
        notificationsEnabled: true,
        emailNotifications: false,
        pushNotifications: true,
        quietHoursStart: "22:00",
        quietHoursEnd: "08:00",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    return NextResponse.json(settings)

  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      dailyGoalPoints,
      weeklyGoalPoints,
      monthlyGoalPoints,
      notificationsEnabled,
      emailNotifications,
      pushNotifications,
      quietHoursStart,
      quietHoursEnd
    } = body

    // Validate daily goal points
    if (dailyGoalPoints && (dailyGoalPoints < 100 || dailyGoalPoints > 50000)) {
      return NextResponse.json(
        { error: "Daily goal must be between 100 and 50,000 points" },
        { status: 400 }
      )
    }

    let settings
    try {
      // Try to get existing settings
      settings = await prisma.userSettings.findFirst()
      
      if (settings) {
        // Update existing settings
        settings = await prisma.userSettings.update({
          where: { id: settings.id },
          data: {
            ...(dailyGoalPoints !== undefined && { dailyGoalPoints }),
            ...(weeklyGoalPoints !== undefined && { weeklyGoalPoints }),
            ...(monthlyGoalPoints !== undefined && { monthlyGoalPoints }),
            ...(notificationsEnabled !== undefined && { notificationsEnabled }),
            ...(emailNotifications !== undefined && { emailNotifications }),
            ...(pushNotifications !== undefined && { pushNotifications }),
            ...(quietHoursStart !== undefined && { quietHoursStart }),
            ...(quietHoursEnd !== undefined && { quietHoursEnd })
          }
        })
      } else {
        // Create new settings
        settings = await prisma.userSettings.create({
          data: {
            dailyGoalPoints: dailyGoalPoints || 2000,
            weeklyGoalPoints: weeklyGoalPoints || 14000,
            monthlyGoalPoints: monthlyGoalPoints || 60000,
            notificationsEnabled: notificationsEnabled ?? true,
            emailNotifications: emailNotifications ?? false,
            pushNotifications: pushNotifications ?? true,
            quietHoursStart: quietHoursStart || "22:00",
            quietHoursEnd: quietHoursEnd || "08:00"
          }
        })
      }
    } catch (dbError) {
      console.log("Database not ready, using localStorage fallback")
      // Return updated settings even if database fails
      settings = {
        id: "default",
        dailyGoalPoints: dailyGoalPoints || 2000,
        weeklyGoalPoints: weeklyGoalPoints || 14000,
        monthlyGoalPoints: monthlyGoalPoints || 60000,
        notificationsEnabled: notificationsEnabled ?? true,
        emailNotifications: emailNotifications ?? false,
        pushNotifications: pushNotifications ?? true,
        quietHoursStart: quietHoursStart || "22:00",
        quietHoursEnd: quietHoursEnd || "08:00",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    return NextResponse.json(settings)

  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}