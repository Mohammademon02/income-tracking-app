import { prisma } from "@/lib/prisma";

export type NotificationType = "WITHDRAWAL" | "GOAL" | "SYSTEM";
export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH";

interface CreateNotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  timestamp?: Date;
}

export async function createNotification(data: CreateNotificationData) {
  try {
    // Check if notification already exists
    const existingNotification = await prisma.notification.findUnique({
      where: { id: data.id },
    });

    if (existingNotification) {
      return existingNotification;
    }

    // Create new notification
    const notification = await prisma.notification.create({
      data: {
        id: data.id,
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || "MEDIUM",
        actionUrl: data.actionUrl,
        timestamp: data.timestamp || new Date(),
      },
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

export async function deleteNotification(id: string) {
  try {
    await prisma.notification.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
}

export async function markAllNotificationsAsRead() {
  try {
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

// Helper functions for common notification types
export async function createWithdrawalCompletedNotification(
  withdrawalId: string,
  amount: number,
  accountName: string,
  processingDays: number,
  completedAt: Date,
) {
  return createNotification({
    id: `withdrawal-completed-${withdrawalId}`,
    type: "WITHDRAWAL",
    title: "Withdrawal Approved! 🎉",
    message: `${amount.toFixed(2)} from ${accountName} processed in ${processingDays} days`,
    priority: "HIGH",
    actionUrl: "/withdrawals",
    timestamp: completedAt,
  });
}

export async function createDailyGoalNotification(
  date: string,
  points: number,
  goal: number,
) {
  return createNotification({
    id: `daily-goal-${date}`,
    type: "GOAL",
    title: "Daily Goal Achieved! 🌟",
    message: `${points.toLocaleString()} / ${goal.toLocaleString()} points earned today ($${(points / 100).toFixed(2)})`,
    priority: "MEDIUM",
  });
}

export async function createMonthlyGoalNotification(
  year: number,
  month: number,
  points: number,
  goal: number,
) {
  const monthName = new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  return createNotification({
    id: `monthly-goal-${year}-${month}`,
    type: "GOAL",
    title: "Monthly Goal Achieved! 🎯",
    message: `${points.toLocaleString()} / ${goal.toLocaleString()} points earned in ${monthName} ($${(points / 100).toFixed(2)})`,
    priority: "HIGH",
  });
}

export async function createWelcomeNotification() {
  return createNotification({
    id: "welcome-message",
    type: "SYSTEM",
    title: "Welcome Message 🌟",
    message:
      "You'll receive updates about withdrawals, daily goals, and monthly goals here.",
    priority: "LOW",
  });
}

export async function createWithdrawalDelayNotification(
  withdrawalId: string,
  amount: number,
  accountName: string,
  daysWaiting: number,
  requestDate: Date,
) {
  return createNotification({
    id: `withdrawal-delayed-${withdrawalId}`,
    type: "SYSTEM",
    title: "Withdrawal Delay Alert",
    message: `${accountName} withdrawal ($${amount.toFixed(2)}) pending for ${daysWaiting} days`,
    priority: "HIGH",
    actionUrl: "/withdrawals",
    timestamp: requestDate,
  });
}
