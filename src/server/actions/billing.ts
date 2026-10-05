"use server";

import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function requestPlanUpgrade(notes: string = "") {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    // Check if user already has a pending request
    const existing = await sql`
      SELECT id FROM billing_requests 
      WHERE user_id = ${session.id} AND status = 'PENDING' 
      LIMIT 1;
    `;

    if (existing.length > 0) {
      return {
        success: false,
        error: "You already have a pending upgrade request awaiting admin approval.",
      };
    }

    const id = crypto.randomUUID();
    await sql`
      INSERT INTO billing_requests (id, user_id, plan, status, notes, created_at, updated_at)
      VALUES (${id}, ${session.id}, 'PRO', 'PENDING', ${notes || null}, NOW(), NOW());
    `;

    revalidatePath("/settings/billing");
    revalidatePath("/pricing");
    return { success: true };
  } catch (error) {
    console.error("Failed to request plan upgrade:", error);
    return { success: false, error: "Failed to submit upgrade request." };
  }
}

export async function getUserBillingRequest() {
  const session = await getSession();
  if (!session) return null;

  try {
    const rows = await sql`
      SELECT id, plan, status, notes, created_at
      FROM billing_requests
      WHERE user_id = ${session.id}
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    if (rows.length === 0) return null;

    return {
      id: rows[0].id,
      plan: rows[0].plan,
      status: rows[0].status as "PENDING" | "APPROVED" | "REJECTED",
      notes: rows[0].notes,
      createdAt: rows[0].created_at,
    };
  } catch (error) {
    console.error("Failed to fetch user billing request:", error);
    return null;
  }
}
