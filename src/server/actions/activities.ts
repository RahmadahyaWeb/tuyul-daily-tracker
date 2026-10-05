"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { activitySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createActivity(data: {
  name: string;
  code: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = activitySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
  }

  try {
    const existing = await prisma.activity.findUnique({
      where: { code: parsed.data.code },
    });

    if (existing) {
      return { success: false, error: `Activity code "${parsed.data.code}" is already in use.` };
    }

    await prisma.activity.create({
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        sortOrder: parsed.data.sortOrder ?? 0,
        isActive: parsed.data.isActive ?? true,
      },
    });

    revalidatePath("/activities");
    revalidatePath("/tracker");
    revalidatePath("/weekly");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to create activity:", error);
    return { success: false, error: "Failed to create activity." };
  }
}

export async function updateActivity(data: {
  id: string;
  name: string;
  code: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = activitySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
  }

  try {
    const existing = await prisma.activity.findUnique({
      where: { code: parsed.data.code },
    });

    if (existing && existing.id !== data.id) {
      return { success: false, error: `Activity code "${parsed.data.code}" is already in use.` };
    }

    await prisma.activity.update({
      where: { id: data.id },
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        sortOrder: parsed.data.sortOrder ?? 0,
        isActive: parsed.data.isActive ?? true,
      },
    });

    revalidatePath("/activities");
    revalidatePath("/tracker");
    revalidatePath("/weekly");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to update activity:", error);
    return { success: false, error: "Failed to update activity." };
  }
}

export async function toggleActivityStatus(id: string, isActive: boolean) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.activity.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/activities");
    revalidatePath("/tracker");
    revalidatePath("/weekly");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle activity:", error);
    return { success: false, error: "Failed to update activity." };
  }
}

export async function reorderActivities(items: { id: string; sortOrder: number }[]) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.$transaction(
      items.map((item) =>
        prisma.activity.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    revalidatePath("/activities");
    revalidatePath("/tracker");

    return { success: true };
  } catch (error) {
    console.error("Failed to reorder activities:", error);
    return { success: false, error: "Failed to reorder activities." };
  }
}

export async function deleteActivity(id: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.activity.delete({
      where: { id },
    });

    revalidatePath("/activities");
    revalidatePath("/tracker");
    revalidatePath("/weekly");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete activity:", error);
    return { success: false, error: "Failed to delete activity." };
  }
}
