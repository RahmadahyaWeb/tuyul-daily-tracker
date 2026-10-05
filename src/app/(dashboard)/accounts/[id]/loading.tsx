import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountDetailLoading() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back button & Profile Hero Card Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-12 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-60" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
      </div>

      {/* 2-Column Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-4 shadow-2xs">
          <Skeleton className="h-4 w-36" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-2xs">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Notes Skeleton */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-2xs">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>

      {/* 30-Day Heatmap Skeleton */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-2xs">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-36 w-full rounded-lg" />
      </div>
    </div>
  );
}
