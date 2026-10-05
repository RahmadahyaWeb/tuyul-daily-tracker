import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrackerLoading() {
  return (
    <div className="space-y-4">
      {/* Header & Date Controller Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-3.5 w-80" />
        </div>
        <Skeleton className="h-9 w-64 rounded-lg" />
      </div>

      {/* Progress Strip Banner Skeleton */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24 hidden sm:block" />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-60">
          <Skeleton className="h-2 flex-1 rounded-full" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* Main Checklist Matrix Table Skeleton */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/70 bg-slate-50/80 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-8">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>

        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-[220px]">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-1.5 min-w-0">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>

              <div className="flex items-center gap-8 justify-center flex-1">
                <Skeleton className="w-5 h-5 rounded-md" />
                <Skeleton className="w-5 h-5 rounded-md" />
                <Skeleton className="w-5 h-5 rounded-md" />
                <Skeleton className="w-5 h-5 rounded-md" />
                <Skeleton className="w-5 h-5 rounded-md" />
              </div>

              <div className="w-[140px] space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>

              <div className="w-[90px] flex justify-end gap-1">
                <Skeleton className="w-7 h-7 rounded-md" />
                <Skeleton className="w-7 h-7 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
