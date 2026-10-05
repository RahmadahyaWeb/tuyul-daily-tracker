"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { groupSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createGroup(data: { name: string }) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = groupSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
  }

  try {
    const existing = await prisma.group.findUnique({
      where: { name: parsed.data.name },
    });

    if (existing) {
      return { success: false, error: `Group "${parsed.data.name}" already exists.` };
    }

    await prisma.group.create({
      data: { name: parsed.data.name },
    });

    revalidatePath("/groups");
    revalidatePath("/accounts");
    revalidatePath("/tracker");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to create group:", error);
    return { success: false, error: "Failed to create group." };
  }
}

export async function updateGroup(data: { id: string; name: string }) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = groupSchema.safeParse({ name: data.name });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
  }

  try {
    const existing = await prisma.group.findUnique({
      where: { name: parsed.data.name },
    });

    if (existing && existing.id !== data.id) {
      return { success: false, error: `Group "${parsed.data.name}" already exists.` };
    }

    await prisma.group.update({
      where: { id: data.id },
      data: { name: parsed.data.name },
    });

    revalidatePath("/groups");
    revalidatePath("/accounts");
    revalidatePath("/tracker");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to update group:", error);
    return { success: false, error: "Failed to update group." };
  }
}

export async function deleteGroup(id: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.group.delete({
      where: { id },
    });

    revalidatePath("/groups");
    revalidatePath("/accounts");
    revalidatePath("/tracker");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete group:", error);
    return { success: false, error: "Failed to delete group." };
  }
}
