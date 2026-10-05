"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function toggleActivityLog(
  accountId: string,
  activityId: string,
  activityDate: string,
  completed: boolean
) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const now = completed ? new Date() : null;

    await prisma.activityLog.upsert({
      where: {
        accountId_activityId_activityDate: {
          accountId,
          activityId,
          activityDate,
        },
      },
      create: {
        accountId,
        activityId,
        activityDate,
        isCompleted: completed,
        completedAt: now,
      },
      update: {
        isCompleted: completed,
        completedAt: now,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle activity log:", error);
    return { success: false, error: "Failed to update activity." };
  }
}

export async function completeAccountDaily(
  accountId: string,
  activityDate: string
) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const accountActivities = await prisma.accountActivity.findMany({
      where: {
        accountId,
        isActive: true,
        activity: { isActive: true },
      },
      select: { activityId: true },
    });

    if (accountActivities.length === 0) {
      return { success: true };
    }

    const now = new Date();

    // Fast atomic replacement using 2 operations
    await prisma.$transaction([
      prisma.activityLog.deleteMany({
        where: {
          accountId,
          activityDate,
          activityId: { in: accountActivities.map((a) => a.activityId) },
        },
      }),
      prisma.activityLog.createMany({
        data: accountActivities.map((a) => ({
          accountId,
          activityId: a.activityId,
          activityDate,
          isCompleted: true,
          completedAt: now,
        })),
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Failed to complete account daily:", error);
    return { success: false, error: "Failed to update account." };
  }
}

export async function resetAccountDaily(
  accountId: string,
  activityDate: string
) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.activityLog.deleteMany({
      where: {
        accountId,
        activityDate,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to reset account daily:", error);
    return { success: false, error: "Failed to reset account." };
  }
}

export async function completeAllDaily(activityDate: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Find all active account activities for active accounts in a single query
    const accountActivities = await prisma.accountActivity.findMany({
      where: {
        isActive: true,
        account: { status: "Active" },
        activity: { isActive: true },
      },
      select: { accountId: true, activityId: true },
    });

    if (accountActivities.length === 0) {
      return { success: true };
    }

    const now = new Date();

    // Fast bulk transaction: delete today's logs for active accounts & insert completed records
    await prisma.$transaction([
      prisma.activityLog.deleteMany({
        where: {
          activityDate,
          account: { status: "Active" },
        },
      }),
      prisma.activityLog.createMany({
        data: accountActivities.map((aa) => ({
          accountId: aa.accountId,
          activityId: aa.activityId,
          activityDate,
          isCompleted: true,
          completedAt: now,
        })),
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Failed to complete all daily:", error);
    return { success: false, error: "Failed to complete all activities." };
  }
}

export async function resetAllDaily(activityDate: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.activityLog.deleteMany({
      where: {
        activityDate,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to reset all daily:", error);
    return { success: false, error: "Failed to reset all activities." };
  }
}
