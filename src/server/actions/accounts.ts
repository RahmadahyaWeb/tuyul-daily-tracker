"use server";

import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { encryptPassword, decryptPassword } from "@/lib/encryption";
import { accountSchema, accountUpdateSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function createAccount(data: {
  nickname: string;
  username: string;
  server: string;
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
    // Enforce SaaS plan account limits
    const { requireWorkspace } = await import("@/lib/workspace");
    const { workspace } = await requireWorkspace(session.id);
    if (workspace.accountCount >= workspace.plan.maxAccounts) {
      return {
        success: false,
        error: `Account limit reached. You've reached the ${workspace.plan.maxAccounts}-account limit on the ${workspace.plan.name} plan.`,
        planLimitReached: true,
        maxAccounts: workspace.plan.maxAccounts,
      };
    }

    const id = crypto.randomUUID();
    const startDate = new Date(parsed.data.startDate).toISOString();
    const status = parsed.data.status || "Active";
    const notes = parsed.data.notes || null;
    const groupId = parsed.data.groupId || null;

    await sql`
      INSERT INTO accounts (id, user_id, nickname, username, password, server, owner, job, level, start_date, status, notes, group_id)
      VALUES (${id}, ${session.id}, ${parsed.data.nickname}, ${parsed.data.username}, '', ${parsed.data.server}, '', ${parsed.data.job}, ${parsed.data.level}, ${startDate}, ${status}, ${notes}, ${groupId});
    `;

    if (parsed.data.activityIds && parsed.data.activityIds.length > 0) {
      for (const actId of parsed.data.activityIds) {
        const aaId = crypto.randomUUID();
        await sql`
          INSERT INTO account_activities (id, account_id, activity_id, is_active)
          VALUES (${aaId}, ${id}, ${actId}, TRUE)
          ON CONFLICT (account_id, activity_id) DO NOTHING;
        `;
      }
    }

    revalidatePath("/accounts");
    revalidatePath("/tracker");
    revalidatePath("/weekly");
    revalidatePath("/dashboard");
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
  server?: string;
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
    const current = await sql`SELECT * FROM accounts WHERE id = ${parsed.data.id} AND user_id = ${session.id} LIMIT 1;`;
    if (current.length === 0) {
      return { success: false, error: "Account not found or access denied" };
    }
    const acc = current[0];

    const nickname = parsed.data.nickname ?? acc.nickname;
    const username = parsed.data.username ?? acc.username;
    const server = parsed.data.server ?? acc.server;
    const job = parsed.data.job ?? acc.job;
    const level = parsed.data.level ?? acc.level;
    const startDate = parsed.data.startDate
      ? new Date(parsed.data.startDate).toISOString()
      : acc.start_date;
    const status = parsed.data.status ?? acc.status;
    const notes = parsed.data.notes !== undefined ? parsed.data.notes : acc.notes;
    const groupId = parsed.data.groupId !== undefined ? (parsed.data.groupId || null) : acc.group_id;

    await sql`
      UPDATE accounts
      SET nickname = ${nickname},
          username = ${username},
          server = ${server},
          job = ${job},
          level = ${level},
          start_date = ${startDate},
          status = ${status},
          notes = ${notes},
          group_id = ${groupId},
          updated_at = NOW()
      WHERE id = ${parsed.data.id} AND user_id = ${session.id};
    `;

    if (parsed.data.activityIds) {
      await sql`DELETE FROM account_activities WHERE account_id = ${parsed.data.id};`;

      for (const actId of parsed.data.activityIds) {
        const aaId = crypto.randomUUID();
        await sql`
          INSERT INTO account_activities (id, account_id, activity_id, is_active)
          VALUES (${aaId}, ${parsed.data.id}, ${actId}, TRUE)
          ON CONFLICT (account_id, activity_id) DO NOTHING;
        `;
      }
    }

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
    await sql`UPDATE accounts SET notes = ${notes}, updated_at = NOW() WHERE id = ${id} AND user_id = ${session.id};`;
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
    await sql`UPDATE accounts SET status = ${status}, updated_at = NOW() WHERE id = ${id} AND user_id = ${session.id};`;

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
    await sql`DELETE FROM accounts WHERE id = ${id} AND user_id = ${session.id};`;

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

export async function getAccountCredentials(id: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const rows = await sql`
      SELECT id, nickname, username, password, server
      FROM accounts
      WHERE id = ${id} AND user_id = ${session.id}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return { success: false, error: "Account not found" };
    }

    const account = rows[0];
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
