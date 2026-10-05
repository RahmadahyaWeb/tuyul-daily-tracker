"use server";

import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }
  return session;
}

export async function getAdminStats() {
  await requireAdmin();

  try {
    const [usersCountRes, accountsCountRes, pendingBillingRes, proUsersRes] = await Promise.all([
      sql`SELECT count(*)::int as count FROM users;`,
      sql`SELECT count(*)::int as count FROM accounts;`,
      sql`SELECT count(*)::int as count FROM billing_requests WHERE status = 'PENDING';`,
      sql`SELECT count(*)::int as count FROM users WHERE plan = 'PRO' OR role = 'ADMIN';`,
    ]);

    return {
      totalUsers: Number(usersCountRes[0]?.count || 0),
      totalAccounts: Number(accountsCountRes[0]?.count || 0),
      pendingBilling: Number(pendingBillingRes[0]?.count || 0),
      proSubscribers: Number(proUsersRes[0]?.count || 0),
    };
  } catch (error) {
    console.error("Failed to get admin stats:", error);
    return {
      totalUsers: 0,
      totalAccounts: 0,
      pendingBilling: 0,
      proSubscribers: 0,
    };
  }
}

export async function getAdminUsers() {
  await requireAdmin();

  try {
    const rows = await sql`
      SELECT 
        u.id, 
        u.username, 
        u.role, 
        u.plan, 
        u.created_at,
        count(a.id)::int as account_count
      FROM users u
      LEFT JOIN accounts a ON u.id = a.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC;
    `;

    return rows.map((r) => ({
      id: r.id as string,
      username: r.username as string,
      role: r.role as "ADMIN" | "USER",
      plan: (r.plan || "FREE") as "FREE" | "PRO",
      createdAt: r.created_at as string,
      accountCount: Number(r.account_count || 0),
    }));
  } catch (error) {
    console.error("Failed to get admin users:", error);
    return [];
  }
}

export async function updateUserPlanAction(userId: string, plan: "FREE" | "PRO") {
  await requireAdmin();

  try {
    await sql`UPDATE users SET plan = ${plan}, updated_at = NOW() WHERE id = ${userId};`;
    revalidatePath("/admin/users");
    revalidatePath("/admin/billing");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user plan:", error);
    return { success: false, error: "Failed to update user plan." };
  }
}

export async function updateUserRoleAction(userId: string, role: "USER" | "ADMIN") {
  await requireAdmin();

  try {
    await sql`UPDATE users SET role = ${role}, updated_at = NOW() WHERE id = ${userId};`;
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return { success: false, error: "Failed to update user role." };
  }
}

export async function getAdminBillingRequests() {
  await requireAdmin();

  try {
    const rows = await sql`
      SELECT 
        br.id,
        br.user_id,
        br.plan,
        br.status,
        br.notes,
        br.created_at,
        br.updated_at,
        u.username,
        u.plan as current_user_plan
      FROM billing_requests br
      JOIN users u ON br.user_id = u.id
      ORDER BY br.created_at DESC;
    `;

    return rows.map((r) => ({
      id: r.id as string,
      userId: r.user_id as string,
      username: r.username as string,
      plan: r.plan as string,
      currentUserPlan: (r.current_user_plan || "FREE") as string,
      status: r.status as "PENDING" | "APPROVED" | "REJECTED",
      notes: r.notes as string | null,
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
    }));
  } catch (error) {
    console.error("Failed to get admin billing requests:", error);
    return [];
  }
}

export async function approveBillingRequestAction(requestId: string) {
  await requireAdmin();

  try {
    const rows = await sql`
      SELECT user_id, plan FROM billing_requests WHERE id = ${requestId} LIMIT 1;
    `;
    if (rows.length === 0) {
      return { success: false, error: "Billing request not found" };
    }

    const { user_id, plan } = rows[0];

    await sql`
      UPDATE billing_requests 
      SET status = 'APPROVED', updated_at = NOW() 
      WHERE id = ${requestId};
    `;

    await sql`
      UPDATE users 
      SET plan = ${plan || 'PRO'}, updated_at = NOW() 
      WHERE id = ${user_id};
    `;

    revalidatePath("/admin/billing");
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to approve billing request:", error);
    return { success: false, error: "Failed to approve billing request." };
  }
}

export async function rejectBillingRequestAction(requestId: string) {
  await requireAdmin();

  try {
    await sql`
      UPDATE billing_requests 
      SET status = 'REJECTED', updated_at = NOW() 
      WHERE id = ${requestId};
    `;

    revalidatePath("/admin/billing");
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to reject billing request:", error);
    return { success: false, error: "Failed to reject billing request." };
  }
}
