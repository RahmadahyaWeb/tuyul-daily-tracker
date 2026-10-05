import { ActivitiesView } from "@/features/activities/ActivitiesView";
import { getMasterActivities } from "@/server/db/queries";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activities — Tuyul Tracker",
  description: "Master daily repeatable checklist activities management",
};

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const activities = await getMasterActivities();

  return <ActivitiesView initialActivities={activities} />;
}
