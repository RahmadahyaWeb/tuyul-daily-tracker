"use server";

import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getWeekDays } from "@/lib/date-utils";

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
    const acc =
      session.role === "ADMIN"
        ? await sql`SELECT id FROM accounts WHERE id = ${accountId} LIMIT 1;`
        : await sql`SELECT id FROM accounts WHERE id = ${accountId} AND user_id = ${session.id} LIMIT 1;`;

    if (acc.length === 0) {
      return { success: false, error: "Account not found or access denied" };
    }

    const actRes = await sql`SELECT activity_type FROM activities WHERE id = ${activityId} LIMIT 1;`;
    const isWeekly = actRes[0]?.activity_type === "WEEKLY";

    if (isWeekly) {
      const weekDays = getWeekDays(activityDate);
      const mondayStr = weekDays[0].dateStr;
      const sundayStr = weekDays[6].dateStr;

      if (completed) {
        const id = `${accountId}_${activityId}_${activityDate}`;
        const now = new Date().toISOString();
        await sql`
          INSERT INTO activity_logs (id, account_id, activity_id, activity_date, is_completed, completed_at, updated_at)
          VALUES (${id}, ${accountId}, ${activityId}, ${activityDate}, TRUE, ${now}, NOW())
          ON CONFLICT (account_id, activity_id, activity_date)
          DO UPDATE SET is_completed = TRUE, completed_at = ${now}, updated_at = NOW();
        `;
      } else {
        await sql`
          UPDATE activity_logs
          SET is_completed = FALSE, updated_at = NOW()
          WHERE account_id = ${accountId}
            AND activity_id = ${activityId}
            AND activity_date >= ${mondayStr}
            AND activity_date <= ${sundayStr};
        `;
      }
    } else {
      const id = `${accountId}_${activityId}_${activityDate}`;
      const now = completed ? new Date().toISOString() : null;

      await sql`
        INSERT INTO activity_logs (id, account_id, activity_id, activity_date, is_completed, completed_at, updated_at)
        VALUES (${id}, ${accountId}, ${activityId}, ${activityDate}, ${completed}, ${now}, NOW())
        ON CONFLICT (account_id, activity_id, activity_date)
        DO UPDATE SET
          is_completed = ${completed},
          completed_at = ${now},
          updated_at = NOW();
      `;
    }

    revalidatePath("/tracker");
    revalidatePath("/dashboard");
    revalidatePath("/weekly");
    revalidatePath(`/accounts/${accountId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Failed to toggle activity log:", error);
    return { success: false, error: error?.message || "Failed to update activity." };
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
    const acc = await sql`SELECT id FROM accounts WHERE id = ${accountId} AND user_id = ${session.id} LIMIT 1;`;
    if (acc.length === 0) {
      return { success: false, error: "Account not found or access denied" };
    }

    const accountActivities = await sql`
      SELECT aa.activity_id
      FROM account_activities aa
      JOIN activities act ON aa.activity_id = act.id
      WHERE aa.account_id = ${accountId} AND aa.is_active = TRUE AND act.is_active = TRUE;
    `;

    if (accountActivities.length === 0) {
      return { success: true };
    }

    const now = new Date().toISOString();

    for (const aa of accountActivities) {
      const id = `${accountId}_${aa.activity_id}_${activityDate}`;
      await sql`
        INSERT INTO activity_logs (id, account_id, activity_id, activity_date, is_completed, completed_at, updated_at)
        VALUES (${id}, ${accountId}, ${aa.activity_id}, ${activityDate}, TRUE, ${now}, NOW())
        ON CONFLICT (account_id, activity_id, activity_date)
        DO UPDATE SET is_completed = TRUE, completed_at = ${now}, updated_at = NOW();
      `;
    }

    revalidatePath("/tracker");
    revalidatePath("/dashboard");
    revalidatePath("/weekly");
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
    const acc =
      session.role === "ADMIN"
        ? await sql`SELECT id FROM accounts WHERE id = ${accountId} LIMIT 1;`
        : await sql`SELECT id FROM accounts WHERE id = ${accountId} AND user_id = ${session.id} LIMIT 1;`;

    if (acc.length === 0) {
      return { success: false, error: "Account not found or access denied" };
    }

    await sql`
      DELETE FROM activity_logs
      WHERE account_id = ${accountId} AND activity_date = ${activityDate};
    `;

    revalidatePath("/tracker");
    revalidatePath("/dashboard");
    revalidatePath("/weekly");
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
    const list =
      session.role === "ADMIN"
        ? await sql`
            SELECT aa.account_id, aa.activity_id
            FROM account_activities aa
            JOIN accounts acc ON aa.account_id = acc.id
            JOIN activities act ON aa.activity_id = act.id
            WHERE aa.is_active = TRUE AND acc.status = 'Active' AND act.is_active = TRUE;
          `
        : await sql`
            SELECT aa.account_id, aa.activity_id
            FROM account_activities aa
            JOIN accounts acc ON aa.account_id = acc.id
            JOIN activities act ON aa.activity_id = act.id
            WHERE aa.is_active = TRUE AND acc.status = 'Active' AND act.is_active = TRUE
            AND acc.user_id = ${session.id};
          `;

    if (list.length === 0) {
      return { success: true };
    }

    const now = new Date().toISOString();

    for (const item of list) {
      const id = `${item.account_id}_${item.activity_id}_${activityDate}`;
      await sql`
        INSERT INTO activity_logs (id, account_id, activity_id, activity_date, is_completed, completed_at, updated_at)
        VALUES (${id}, ${item.account_id}, ${item.activity_id}, ${activityDate}, TRUE, ${now}, NOW())
        ON CONFLICT (account_id, activity_id, activity_date)
        DO UPDATE SET is_completed = TRUE, completed_at = ${now}, updated_at = NOW();
      `;
    }

    revalidatePath("/tracker");
    revalidatePath("/dashboard");
    revalidatePath("/weekly");

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
    if (session.role === "ADMIN") {
      await sql`
        DELETE FROM activity_logs
        WHERE activity_date = ${activityDate};
      `;
    } else {
      await sql`
        DELETE FROM activity_logs
        WHERE account_id IN (SELECT id FROM accounts WHERE user_id = ${session.id})
        AND activity_date = ${activityDate};
      `;
    }

    revalidatePath("/tracker");
    revalidatePath("/dashboard");
    revalidatePath("/weekly");

    return { success: true };
  } catch (error) {
    console.error("Failed to reset all daily:", error);
    return { success: false, error: "Failed to reset all activities." };
  }
}
