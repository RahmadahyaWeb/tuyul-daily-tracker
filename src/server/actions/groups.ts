"use server";

import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { groupSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function createGroup(data: { name: string }) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = groupSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
  }

  try {
    const existing = await sql`SELECT id FROM groups WHERE name = ${parsed.data.name} LIMIT 1;`;
    if (existing.length > 0) {
      return { success: false, error: `Group "${parsed.data.name}" already exists.` };
    }

    const id = crypto.randomUUID();

    await sql`
      INSERT INTO groups (id, name)
      VALUES (${id}, ${parsed.data.name});
    `;

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
    const existing = await sql`SELECT id FROM groups WHERE name = ${parsed.data.name} AND id != ${data.id} LIMIT 1;`;
    if (existing.length > 0) {
      return { success: false, error: `Group "${parsed.data.name}" already exists.` };
    }

    await sql`
      UPDATE groups
      SET name = ${parsed.data.name},
          updated_at = NOW()
      WHERE id = ${data.id};
    `;

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
    await sql`DELETE FROM groups WHERE id = ${id};`;

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
