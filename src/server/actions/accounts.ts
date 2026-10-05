"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { encryptPassword, decryptPassword } from "@/lib/encryption";
import { accountSchema, accountUpdateSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createAccount(data: {
  nickname: string;
  username: string;
  password: string;
  server: string;
  owner: string;
  job: string;
  level: number;
  startDate: string;
  status?: "Active" | "Paused" | "Finished";
  notes?: string | null;
  groupId?: string | null;
  activityIds: string[];
}) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = accountSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
  }

  try {
    const encryptedPassword = encryptPassword(parsed.data.password);
    const startDate = new Date(parsed.data.startDate);

    await prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: {
          nickname: parsed.data.nickname,
          username: parsed.data.username,
          password: encryptedPassword,
          server: parsed.data.server,
          owner: parsed.data.owner,
          job: parsed.data.job,
          level: parsed.data.level,
          startDate: isNaN(startDate.getTime()) ? new Date() : startDate,
          status: parsed.data.status,
          notes: parsed.data.notes || null,
          groupId: parsed.data.groupId || null,
        },
      });

      if (parsed.data.activityIds && parsed.data.activityIds.length > 0) {
        await tx.accountActivity.createMany({
          data: parsed.data.activityIds.map((activityId) => ({
            accountId: account.id,
            activityId,
            isActive: true,
          })),
        });
      }
    });

    revalidatePath("/accounts");
    revalidatePath("/tracker");
    revalidatePath("/weekly");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to create account:", error);
    return { success: false, error: "Failed to create account." };
  }
}

export async function updateAccount(data: {
  id: string;
  nickname?: string;
  username?: string;
  password?: string;
  server?: string;
  owner?: string;
  job?: string;
  level?: number;
  startDate?: string;
  status?: "Active" | "Paused" | "Finished";
  notes?: string | null;
  groupId?: string | null;
  activityIds?: string[];
}) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = accountUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = {};

      if (parsed.data.nickname) updateData.nickname = parsed.data.nickname;
      if (parsed.data.username) updateData.username = parsed.data.username;
      if (parsed.data.password && parsed.data.password.trim() !== "") {
        updateData.password = encryptPassword(parsed.data.password);
      }
      if (parsed.data.server) updateData.server = parsed.data.server;
      if (parsed.data.owner) updateData.owner = parsed.data.owner;
      if (parsed.data.job) updateData.job = parsed.data.job;
      if (parsed.data.level !== undefined) updateData.level = parsed.data.level;
      if (parsed.data.startDate) {
        const d = new Date(parsed.data.startDate);
        if (!isNaN(d.getTime())) updateData.startDate = d;
      }
      if (parsed.data.status) updateData.status = parsed.data.status;
      if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
      if (parsed.data.groupId !== undefined) updateData.groupId = parsed.data.groupId || null;

      await tx.account.update({
        where: { id: parsed.data.id },
        data: updateData,
      });

      if (parsed.data.activityIds) {
        // Delete current associations and recreate
        await tx.accountActivity.deleteMany({
          where: { accountId: parsed.data.id },
        });

        if (parsed.data.activityIds.length > 0) {
          await tx.accountActivity.createMany({
            data: parsed.data.activityIds.map((activityId) => ({
              accountId: parsed.data.id,
              activityId,
              isActive: true,
            })),
          });
        }
      }
    });

    revalidatePath("/accounts");
    revalidatePath(`/accounts/${data.id}`);
    revalidatePath("/tracker");
    revalidatePath("/weekly");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to update account:", error);
    return { success: false, error: "Failed to update account." };
  }
}

export async function updateAccountNotes(id: string, notes: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.account.update({
      where: { id },
      data: { notes },
    });

    revalidatePath(`/accounts/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update notes:", error);
    return { success: false, error: "Failed to update notes." };
  }
}

export async function toggleAccountStatus(
  id: string,
  status: "Active" | "Paused" | "Finished"
) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.account.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/accounts");
    revalidatePath(`/accounts/${id}`);
    revalidatePath("/tracker");
    revalidatePath("/weekly");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to update account status:", error);
    return { success: false, error: "Failed to update status." };
  }
}

export async function deleteAccount(id: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.account.delete({
      where: { id },
    });

    revalidatePath("/accounts");
    revalidatePath("/tracker");
    revalidatePath("/weekly");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return { success: false, error: "Failed to delete account." };
  }
}

/**
 * Securely fetch and decrypt credentials only upon explicit request
 */
export async function getAccountCredentials(id: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const account = await prisma.account.findUnique({
      where: { id },
      select: {
        id: true,
        nickname: true,
        username: true,
        password: true,
        server: true,
      },
    });

    if (!account) {
      return { success: false, error: "Account not found" };
    }

    const decrypted = decryptPassword(account.password);

    return {
      success: true,
      data: {
        id: account.id,
        nickname: account.nickname,
        username: account.username,
        password: decrypted,
        server: account.server,
      },
    };
  } catch (error) {
    console.error("Failed to retrieve credentials:", error);
    return { success: false, error: "Failed to retrieve credentials." };
  }
}
