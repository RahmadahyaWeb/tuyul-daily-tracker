"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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

    revalidatePath("/tracker");
    revalidatePath("/weekly");
    revalidatePath("/");
    revalidatePath(`/accounts/${accountId}`);

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
    // Get all active activities assigned to this account
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        accountActivities: {
          where: { isActive: true },
          include: { activity: { select: { isActive: true } } },
        },
      },
    });

    if (!account) {
      return { success: false, error: "Account not found" };
    }

    const validActivityIds = account.accountActivities
      .filter((aa) => aa.activity.isActive)
      .map((aa) => aa.activityId);

    const now = new Date();

    await prisma.$transaction(
      validActivityIds.map((actId) =>
        prisma.activityLog.upsert({
          where: {
            accountId_activityId_activityDate: {
              accountId,
              activityId: actId,
              activityDate,
            },
          },
          create: {
            accountId,
            activityId: actId,
            activityDate,
            isCompleted: true,
            completedAt: now,
          },
          update: {
            isCompleted: true,
            completedAt: now,
          },
        })
      )
    );

    revalidatePath("/tracker");
    revalidatePath("/weekly");
    revalidatePath("/");
    revalidatePath(`/accounts/${accountId}`);

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

    revalidatePath("/tracker");
    revalidatePath("/weekly");
    revalidatePath("/");
    revalidatePath(`/accounts/${accountId}`);

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
    const activeAccounts = await prisma.account.findMany({
      where: { status: "Active" },
      include: {
        accountActivities: {
          where: { isActive: true },
          include: { activity: { select: { isActive: true } } },
        },
      },
    });

    const now = new Date();
    const ops = [];

    for (const acc of activeAccounts) {
      for (const aa of acc.accountActivities) {
        if (aa.activity.isActive) {
          ops.push(
            prisma.activityLog.upsert({
              where: {
                accountId_activityId_activityDate: {
                  accountId: acc.id,
                  activityId: aa.activityId,
                  activityDate,
                },
              },
              create: {
                accountId: acc.id,
                activityId: aa.activityId,
                activityDate,
                isCompleted: true,
                completedAt: now,
              },
              update: {
                isCompleted: true,
                completedAt: now,
              },
            })
          );
        }
      }
    }

    if (ops.length > 0) {
      await prisma.$transaction(ops);
    }

    revalidatePath("/tracker");
    revalidatePath("/weekly");
    revalidatePath("/");

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

    revalidatePath("/tracker");
    revalidatePath("/weekly");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to reset all daily:", error);
    return { success: false, error: "Failed to reset all activities." };
  }
}
