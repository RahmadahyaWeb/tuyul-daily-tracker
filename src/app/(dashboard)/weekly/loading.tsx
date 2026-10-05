import { PageSkeleton } from "@/components/ui/skeletons";

export default function WeeklyLoading() {
  return <PageSkeleton filterCount={1} rowCount={6} />;
}
