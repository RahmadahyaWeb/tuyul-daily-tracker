import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function WeeklyLoading() {
  return (
    <div className="space-y-4">
      {/* Header & Week Controller Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-3.5 w-80" />
        </div>
        <Skeleton className="h-9 w-60 rounded-lg" />
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <div className="hidden sm:flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Main Weekly Table Skeleton */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200/70 bg-slate-50/80 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-10">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <Skeleton key={d} className="h-6 w-10 rounded-md" />
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 w-[200px]">
                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                <div className="space-y-1 min-w-0">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-2.5 w-28" />
                </div>
              </div>

              <div className="flex items-center gap-10 justify-center flex-1">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <Skeleton key={d} className="w-6 h-6 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
