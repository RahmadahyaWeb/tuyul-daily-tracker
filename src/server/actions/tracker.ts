"use server";

import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";

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
    await sql`
      DELETE FROM activity_logs
      WHERE account_id = ${accountId} AND activity_date = ${activityDate};
    `;

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
    const list = await sql`
      SELECT aa.account_id, aa.activity_id
      FROM account_activities aa
      JOIN accounts acc ON aa.account_id = acc.id
      JOIN activities act ON aa.activity_id = act.id
      WHERE aa.is_active = TRUE AND acc.status = 'Active' AND act.is_active = TRUE;
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
    await sql`
      DELETE FROM activity_logs
      WHERE activity_date = ${activityDate};
    `;

    return { success: true };
  } catch (error) {
    console.error("Failed to reset all daily:", error);
    return { success: false, error: "Failed to reset all activities." };
  }
}
