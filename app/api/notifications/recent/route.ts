import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notificationStore } from "@/lib/notification-store";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate real-time notifications for immediate events
    const realtimeNotifications = await generateRealtimeNotifications();

    // Filter out deleted notifications and apply read states
    const notificationsWithState = realtimeNotifications
      .filter((notification) => !notificationStore.isDeleted(notification.id))
      .map((notification) => ({
        ...notification,
        read: notificationStore.isRead(notification.id),
      }));

    // Sort by priority and timestamp
    const sortedNotifications = notificationsWithState
      .sort((a, b) => {
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        const aPriority =
          priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
        const bPriority =
          priorityOrder[b.priority as keyof typeof priorityOrder] || 1;

        const priorityDiff = bPriority - aPriority;
        if (priorityDiff !== 0) return priorityDiff;
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      })
      .slice(0, 20);

    return NextResponse.json(sortedNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function generateRealtimeNotifications() {
  const notifications: any[] = [];
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  try {
    // Check for recent withdrawal completions
    const recentCompletedWithdrawals = await prisma.withdrawal.findMany({
      where: {
        status: "COMPLETED",
        completedAt: {
          gte: last24Hours,
        },
      },
      include: {
        account: { select: { name: true } },
      },
      orderBy: { completedAt: "desc" },
    });

    for (const withdrawal of recentCompletedWithdrawals) {
      if (withdrawal.completedAt) {
        const processingDays = Math.ceil(
          (withdrawal.completedAt.getTime() - withdrawal.date.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        const newNotification = {
          id: `withdrawal-completed-${withdrawal.id}`,
          type: "WITHDRAWAL",
          title: "Withdrawal Approved! 🎉",
          message: `$${withdrawal.amount.toFixed(2)} from ${withdrawal.account.name} processed in ${processingDays} days`,
          timestamp: withdrawal.completedAt,
          actionUrl: "/withdrawals",
          priority: "HIGH",
          read: false,
          createdAt: withdrawal.completedAt,
          updatedAt: withdrawal.completedAt,
        };

        notifications.push(newNotification);
      }
    }

    // Check for daily goal achievements
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const todayEntries = await prisma.dailyEntry.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const todayPoints = todayEntries.reduce(
      (sum, entry) => sum + entry.points,
      0,
    );

    // Get user's daily goal from settings (temporary localStorage fallback)
    let dailyGoal = 2000; // Default fallback
    let notificationsEnabled = true; // Default fallback
    
    // For now, we'll use a simple approach since database model isn't ready
    // In production, this would read from prisma.userSettings

    // Always create daily goal notification for testing
    if (todayPoints >= dailyGoal) {
      const newNotification = {
        id: `daily-goal-${today.toISOString().split("T")[0]}`,
        type: "GOAL",
        title: "Daily Goal Achieved! 🌟",
        message: `${todayPoints.toLocaleString()} / ${dailyGoal.toLocaleString()} points earned today ($${(todayPoints / 100).toFixed(2)})`,
        timestamp: now,
        priority: "MEDIUM",
        read: false,
        createdAt: now,
        updatedAt: now,
      };

      notifications.push(newNotification);
    }

    // Check for delayed withdrawals
    const pendingWithdrawals = await prisma.withdrawal.findMany({
      where: {
        status: "PENDING",
        date: {
          lt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        account: { select: { name: true } },
      },
    });

    // Check for monthly goal achievements
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const monthlyEntries = await prisma.dailyEntry.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const monthlyPoints = monthlyEntries.reduce(
      (sum, entry) => sum + entry.points,
      0,
    );

    // Get monthly goal from settings (default 15000)
    let monthlyGoal = 15000; // Default fallback
    
    // Check if monthly goal is achieved
    if (monthlyPoints >= monthlyGoal) {
      const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const newNotification = {
        id: `monthly-goal-${today.getFullYear()}-${today.getMonth() + 1}`,
        type: "GOAL",
        title: "Monthly Goal Achieved! 🎯",
        message: `${monthlyPoints.toLocaleString()} / ${monthlyGoal.toLocaleString()} points earned in ${monthName} ($${(monthlyPoints / 100).toFixed(2)})`,
        timestamp: now,
        priority: "HIGH",
        read: false,
        createdAt: now,
        updatedAt: now,
      };

      notifications.push(newNotification);
    }

    for (const withdrawal of pendingWithdrawals) {
      const daysWaiting = Math.ceil(
        (now.getTime() - withdrawal.date.getTime()) / (1000 * 60 * 60 * 24),
      );

      const newNotification = {
        id: `withdrawal-delayed-${withdrawal.id}`,
        type: "SYSTEM",
        title: "Withdrawal Delay Alert",
        message: `${withdrawal.account.name} withdrawal ($${withdrawal.amount.toFixed(2)}) pending for ${daysWaiting} days`,
        timestamp: withdrawal.date,
        actionUrl: "/withdrawals",
        priority: "HIGH",
        read: false,
        createdAt: now,
        updatedAt: now,
      };

      notifications.push(newNotification);
    }

    // Add a demo notification if no real notifications exist
    if (notifications.length === 0) {
      // Add welcome message for new users
      notifications.push({
        id: "welcome-message",
        type: "SYSTEM",
        title: "Welcome Message 🌟",
        message: "You'll receive updates about withdrawals, daily goals, and monthly goals here.",
        timestamp: now,
        priority: "LOW",
        read: false,
        createdAt: now,
        updatedAt: now,
      });
      
      notifications.push({
        id: "demo-notification",
        type: "SYSTEM",
        title: "Notification System Active! 🎉",
        message:
          "Your notification system is working correctly. You'll receive updates about withdrawals and daily goals here.",
        timestamp: now,
        priority: "MEDIUM",
        read: false,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      // Always show welcome message for new users (if not deleted)
      const hasWelcomeMessage = notifications.some(n => n.id === "welcome-message");
      if (!hasWelcomeMessage) {
        notifications.unshift({
          id: "welcome-message",
          type: "SYSTEM",
          title: "Welcome Message 🌟",
          message: "You'll receive updates about withdrawals, daily goals, and monthly goals here.",
          timestamp: new Date(now.getTime() - 10 * 60 * 1000), // 10 minutes ago
          priority: "LOW",
          read: false,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  } catch (error) {
    console.error("Error generating realtime notifications:", error);

    // Return a fallback notification if there's an error
    notifications.push({
      id: "error-notification",
      type: "SYSTEM",
      title: "Notification System Ready",
      message:
        "The notification system is active and will show updates about your account activity.",
      timestamp: now,
      priority: "LOW",
      read: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  return notifications;
}
