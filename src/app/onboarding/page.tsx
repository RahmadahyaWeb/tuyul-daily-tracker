import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { OnboardingView } from "@/features/onboarding/OnboardingView";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import crypto from "crypto";

export const metadata: Metadata = {
  title: "Onboarding — Setup Workspace & First Character",
  description: "Create your first Tuyul account to get started",
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
