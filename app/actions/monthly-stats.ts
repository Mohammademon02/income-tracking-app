"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function getMonthlyStats(year?: number, month?: number) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");

  const now = new Date();
  const targetYear = year || now.getFullYear();
  const targetMonth = month || now.getMonth() + 1; // getMonth() returns 0-11

  // Start and end of the target month
  const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
  const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

  // Get entries for the month
  const monthlyEntries = await prisma.dailyEntry.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      account: {
        select: {
          name: true,
          color: true,
        },
      },
    },
  });

  // Get withdrawals completed in the month
  const monthlyCompletedWithdrawals = await prisma.withdrawal.findMany({
    where: {
      status: "COMPLETED",
      completedAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      account: {
        select: {
          name: true,
          color: true,
        },
      },
    },
  });

  // Calculate totals
  const totalMonthlyPoints = monthlyEntries.reduce(
    (sum, entry) => sum + entry.points,
    0,
  );
  const totalMonthlyWithdrawals = monthlyCompletedWithdrawals.reduce(
    (sum, withdrawal) => sum + withdrawal.amount,
    0,
  );
  const totalEntriesCount = monthlyEntries.length;
  const totalWithdrawalsCount = monthlyCompletedWithdrawals.length;

  return {
    month: targetMonth,
    year: targetYear,
    monthName: startOfMonth.toLocaleDateString("en-US", { month: "long" }),
    totalPoints: totalMonthlyPoints,
    totalWithdrawals: totalMonthlyWithdrawals,
    entriesCount: totalEntriesCount,
    withdrawalsCount: totalWithdrawalsCount,
    entries: monthlyEntries.map((entry) => ({
      id: entry.id,
      date: entry.date,
      points: entry.points,
      accountName: entry.account.name,
      accountColor: entry.account.color || "blue",
    })),
    withdrawals: monthlyCompletedWithdrawals.map((withdrawal) => ({
      id: withdrawal.id,
      date: withdrawal.date,
      completedAt: withdrawal.completedAt,
      amount: withdrawal.amount,
      accountName: withdrawal.account.name,
      accountColor: withdrawal.account.color || "blue",
    })),
  };
}
