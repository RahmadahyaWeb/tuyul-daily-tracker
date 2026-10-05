import { TrackerView } from "@/features/tracker/TrackerView";
import { getTrackerData } from "@/server/db/queries";
import { getTodayMakassar, isValidDateString } from "@/lib/date-utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tracker — Dituyulin",
  description: "Fast daily checklist and activity management matrix for accounts",
};

export const dynamic = "force-dynamic";

interface TrackerPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function TrackerPage({ searchParams }: TrackerPageProps) {
  const params = await searchParams;
  const targetDate =
    params.date && isValidDateString(params.date)
      ? params.date
      : getTodayMakassar();

  const data = await getTrackerData(targetDate);

  return <TrackerView initialData={data} />;
}
