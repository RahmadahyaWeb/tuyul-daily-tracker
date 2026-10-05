import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { OnboardingView } from "@/features/onboarding/OnboardingView";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding — Setup Workspace",
  description: "Get started with your Tuyul Tracker workspace",
};

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Fetch default master activities for this user
  const activitiesRaw = await sql`
    SELECT id, name, code FROM activities WHERE user_id = ${session.id} ORDER BY sort_order ASC;
  `;

  const activities = activitiesRaw.map((a) => ({
    id: String(a.id),
    name: String(a.name),
    code: String(a.code),
  }));

  return <OnboardingView username={session.username} activities={activities} />;
}
