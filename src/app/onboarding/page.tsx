import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { OnboardingView } from "@/features/onboarding/OnboardingView";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import crypto from "crypto";

export const metadata: Metadata = {
  title: "Onboarding — Dituyulin",
  description: "Setup your workspace and first character to get started",
};

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // 1. If user already has accounts, no need to onboard again
  const accountCountRes = await sql`
    SELECT count(*)::int as count FROM accounts WHERE user_id = ${session.id};
  `;
  const accountCount = Number(accountCountRes[0]?.count || 0);
  if (accountCount > 0) {
    redirect("/tracker");
  }

  // 2. Fetch default master activities for this user
  let activitiesRaw = await sql`
    SELECT id, name, code FROM activities WHERE user_id = ${session.id} ORDER BY sort_order ASC;
  `;

  // Auto-seed activities if user has none
  if (activitiesRaw.length === 0) {
    const defaultActivities = [
      { id: crypto.randomUUID(), name: "Monster Hunt 600", code: "MH600", activityType: "DAILY", sortOrder: 0 },
      { id: crypto.randomUUID(), name: "Monster Hunt 3000", code: "MH3000", activityType: "DAILY", sortOrder: 1 },
      { id: crypto.randomUUID(), name: "Mission Board", code: "MISSION", activityType: "DAILY", sortOrder: 2 },
      { id: crypto.randomUUID(), name: "Guild Daily", code: "GUILD", activityType: "DAILY", sortOrder: 3 },
      { id: crypto.randomUUID(), name: "TC", code: "TC", activityType: "DAILY", sortOrder: 4 },
      { id: crypto.randomUUID(), name: "Arena", code: "ARENA", activityType: "DAILY", sortOrder: 5 },
      { id: crypto.randomUUID(), name: "Final Mirage", code: "FM", activityType: "WEEKLY", sortOrder: 6 },
    ];

    for (const act of defaultActivities) {
      await sql`
        INSERT INTO activities (id, user_id, name, code, activity_type, sort_order, is_active, created_at, updated_at)
        VALUES (${act.id}, ${session.id}, ${act.name}, ${act.code}, ${act.activityType}, ${act.sortOrder}, TRUE, NOW(), NOW())
        ON CONFLICT DO NOTHING;
      `;
    }

    activitiesRaw = await sql`
      SELECT id, name, code FROM activities WHERE user_id = ${session.id} ORDER BY sort_order ASC;
    `;
  }

  const activities = activitiesRaw.map((a) => ({
    id: String(a.id),
    name: String(a.name),
    code: String(a.code),
  }));

  return <OnboardingView username={session.username} activities={activities} />;
}
