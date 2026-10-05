import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-3.5 w-80" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-7 w-7 rounded-md" />
            </div>
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Need Attention List Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-2 shadow-2xs divide-y divide-slate-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Skeleton className="h-4 w-20 hidden sm:block" />
                <Skeleton className="h-7 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
