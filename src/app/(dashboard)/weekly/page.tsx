import { WeeklyView } from "@/features/weekly/WeeklyView";
import { getWeeklyData } from "@/server/db/queries";
import { getTodayMakassar, isValidDateString } from "@/lib/date-utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly — Dituyulin",
  description: "Weekly activity completion consistency matrix for all accounts",
};

export const dynamic = "force-dynamic";

interface WeeklyPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function WeeklyPage({ searchParams }: WeeklyPageProps) {
  const params = await searchParams;
  const baseDate =
    params.date && isValidDateString(params.date)
      ? params.date
      : getTodayMakassar();

  const { weekDays, accounts } = await getWeeklyData(baseDate);

  return (
    <WeeklyView
      initialWeekDays={weekDays}
      initialAccounts={accounts}
      baseDateStr={baseDate}
    />
  );
}
