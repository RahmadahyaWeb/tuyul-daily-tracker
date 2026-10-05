import { TableSkeleton } from "@/components/ui/skeletons";

export default function ActivitiesLoading() {
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="h-7 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-9 w-28 bg-slate-200 rounded-md animate-pulse" />
      </div>
      <TableSkeleton rows={7} columns={5} />
    </div>
  );
}
