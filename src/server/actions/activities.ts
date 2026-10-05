"use server";

import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { activitySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

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
    const existing = await sql`SELECT id FROM activities WHERE code = ${parsed.data.code} AND user_id = ${session.id} LIMIT 1;`;
    if (existing.length > 0) {
      return { success: false, error: `Activity code "${parsed.data.code}" is already in use.` };
    }

    const id = crypto.randomUUID();
    const sortOrder = parsed.data.sortOrder ?? 0;
    const isActive = parsed.data.isActive ?? true;

    await sql`
      INSERT INTO activities (id, user_id, name, code, sort_order, is_active)
      VALUES (${id}, ${session.id}, ${parsed.data.name}, ${parsed.data.code}, ${sortOrder}, ${isActive});
    `;

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
    const existing = await sql`SELECT id FROM activities WHERE code = ${parsed.data.code} AND id != ${data.id} AND user_id = ${session.id} LIMIT 1;`;
    if (existing.length > 0) {
      return { success: false, error: `Activity code "${parsed.data.code}" is already in use.` };
    }

    const sortOrder = parsed.data.sortOrder ?? 0;
    const isActive = parsed.data.isActive ?? true;

    await sql`
      UPDATE activities
      SET name = ${parsed.data.name},
          code = ${parsed.data.code},
          sort_order = ${sortOrder},
          is_active = ${isActive},
          updated_at = NOW()
      WHERE id = ${data.id} AND user_id = ${session.id};
    `;

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
    await sql`UPDATE activities SET is_active = ${isActive}, updated_at = NOW() WHERE id = ${id} AND user_id = ${session.id};`;

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
    for (const item of items) {
      await sql`UPDATE activities SET sort_order = ${item.sortOrder}, updated_at = NOW() WHERE id = ${item.id} AND user_id = ${session.id};`;
    }

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
    await sql`DELETE FROM activities WHERE id = ${id} AND user_id = ${session.id};`;

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
