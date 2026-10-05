"use server";

import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function completeOnboardingAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const workspaceName = String(formData.get("workspaceName") || "Personal Workspace").trim();
  const nickname = String(formData.get("nickname") || "").trim();
  const username = String(formData.get("username") || "").trim();
  const server = String(formData.get("server") || "Prontera-1").trim();
  const job = String(formData.get("job") || "Novice").trim();
  const activityIdsJson = String(formData.get("activityIds") || "[]");

  let selectedActivityIds: string[] = [];
  try {
    selectedActivityIds = JSON.parse(activityIdsJson);
  } catch {
    selectedActivityIds = [];
  }

  if (!nickname || !username) {
    return { success: false, error: "Account nickname and username are required." };
  }

  try {
    const accountId = crypto.randomUUID();

    // 1. Check or fetch default group
    const groups = await sql`
      SELECT id FROM groups WHERE user_id = ${session.id} ORDER BY created_at ASC LIMIT 1;
    `;
    let defaultGroupId = groups[0]?.id || null;
    if (!defaultGroupId) {
      defaultGroupId = crypto.randomUUID();
      await sql`
        INSERT INTO groups (id, user_id, name, created_at, updated_at)
        VALUES (${defaultGroupId}, ${session.id}, 'Personal', NOW(), NOW());
      `;
    }

    // 2. Create the first account
    await sql`
      INSERT INTO accounts (id, user_id, nickname, username, password, server, owner, job, level, start_date, status, group_id, created_at, updated_at)
      VALUES (${accountId}, ${session.id}, ${nickname}, ${username}, '', ${server}, '', ${job}, 1, NOW(), 'Active', ${defaultGroupId}, NOW(), NOW());
    `;

    // 3. Ensure master activities exist
    let userActivities = await sql`
      SELECT id FROM activities WHERE user_id = ${session.id};
    `;

    if (userActivities.length === 0) {
      const defaultActivities = [
        { id: crypto.randomUUID(), name: "Monster Hunt 600", code: "MH600", sortOrder: 0 },
        { id: crypto.randomUUID(), name: "Monster Hunt 3000", code: "MH3000", sortOrder: 1 },
        { id: crypto.randomUUID(), name: "Mission Board", code: "MISSION", sortOrder: 2 },
        { id: crypto.randomUUID(), name: "Guild Daily", code: "GUILD", sortOrder: 3 },
        { id: crypto.randomUUID(), name: "TC", code: "TC", sortOrder: 4 },
        { id: crypto.randomUUID(), name: "Arena", code: "ARENA", sortOrder: 5 },
        { id: crypto.randomUUID(), name: "Final Mirage", code: "FM", sortOrder: 6 },
      ];

      for (const act of defaultActivities) {
        await sql`
          INSERT INTO activities (id, user_id, name, code, sort_order, is_active, created_at, updated_at)
          VALUES (${act.id}, ${session.id}, ${act.name}, ${act.code}, ${act.sortOrder}, TRUE, NOW(), NOW())
          ON CONFLICT DO NOTHING;
        `;
      }

      userActivities = await sql`
        SELECT id FROM activities WHERE user_id = ${session.id};
      `;
    }

    const targetActivityIds =
      selectedActivityIds.length > 0
        ? selectedActivityIds
        : userActivities.map((a) => a.id);

    // 4. Assign activities to the first account
    for (const actId of targetActivityIds) {
      await sql`
        INSERT INTO account_activities (id, account_id, activity_id, is_active, created_at, updated_at)
        VALUES (${crypto.randomUUID()}, ${accountId}, ${actId}, TRUE, NOW(), NOW())
        ON CONFLICT (account_id, activity_id) DO NOTHING;
      `;
    }

    // 5. Invalidate caches for all relevant pages
    revalidatePath("/", "layout");
    revalidatePath("/tracker");
    revalidatePath("/dashboard");
    revalidatePath("/accounts");
    revalidatePath("/weekly");

    return { success: true };
  } catch (err: any) {
    console.error("Onboarding creation error:", err);
    return { success: false, error: err.message || "Failed to create account. Please try again." };
  }
}
