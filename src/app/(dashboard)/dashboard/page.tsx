import { DashboardView } from "@/features/dashboard/DashboardView";
import { getDashboardStats } from "@/server/db/queries";
import { getTodayMakassar } from "@/lib/date-utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Dituyulin",
  description: "Overview of daily character activity and quest progress",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const todayStr = getTodayMakassar();
  const stats = await getDashboardStats(todayStr);

  return <DashboardView stats={stats} />;
}
