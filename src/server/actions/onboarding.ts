"use server";

import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { encryptPassword } from "@/lib/encryption";
import { redirect } from "next/navigation";
import crypto from "crypto";

export async function completeOnboardingAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const workspaceName = String(formData.get("workspaceName") || "Personal Workspace").trim();
  const nickname = String(formData.get("nickname") || "").trim();
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const server = String(formData.get("server") || "Prontera-1").trim();
  const owner = String(formData.get("owner") || "Personal").trim();
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
    const encryptedPass = encryptPassword(password || "123456");

    // 1. Create the first account
    await sql`
      INSERT INTO accounts (id, user_id, nickname, username, password, server, owner, job, level, status, created_at, updated_at)
      VALUES (${accountId}, ${session.id}, ${nickname}, ${username}, ${encryptedPass}, ${server}, ${owner}, ${job}, 1, 'Active', NOW(), NOW());
    `;

    // 2. Fetch user's activities to link
    const userActivities = await sql`
      SELECT id FROM activities WHERE user_id = ${session.id};
    `;

    const targetActivityIds =
      selectedActivityIds.length > 0
        ? selectedActivityIds
        : userActivities.map((a) => a.id);

    // 3. Assign activities to the first account
    for (const actId of targetActivityIds) {
      await sql`
        INSERT INTO account_activities (id, account_id, activity_id, is_active, created_at, updated_at)
        VALUES (${crypto.randomUUID()}, ${accountId}, ${actId}, TRUE, NOW(), NOW())
        ON CONFLICT (account_id, activity_id) DO NOTHING;
      `;
    }
  } catch (err: any) {
    console.error("Onboarding error:", err);
    return { success: false, error: "Failed to complete onboarding. Please try again." };
  }

  redirect("/tracker");
}
