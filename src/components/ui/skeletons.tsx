import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton({
  title = true,
  filterCount = 3,
  rowCount = 6,
}: {
  title?: boolean;
  filterCount?: number;
  rowCount?: number;
}) {
  return (
    <div className="space-y-6 w-full animate-in fade-in-50 duration-300">
      {/* Header */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      )}

      {/* Filter Bar */}
      {filterCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-white border border-slate-200/80 rounded-lg shadow-2xs">
          {Array.from({ length: filterCount }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-36 sm:w-48 rounded-md" />
          ))}
        </div>
      )}

      {/* Table / List */}
      <TableSkeleton rows={rowCount} />
    </div>
  );
}

export function TableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden shadow-2xs">
      {/* Table Header */}
      <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-4 ${i === 0 ? "w-28" : "flex-1 max-w-[120px]"}`}
          />
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="h-13 flex items-center px-4 gap-4 hover:bg-slate-50/50"
          >
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                className={`h-4 ${
                  c === 0 ? "w-32" : c === columns - 1 ? "w-16 ml-auto" : "w-20"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrackerSkeleton() {
  return (
    <div className="space-y-5 w-full animate-in fade-in-50 duration-300">
      {/* Date Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white border border-slate-200/80 rounded-lg">
        <Skeleton className="h-8 w-52 rounded-md" />
        <Skeleton className="h-8 w-36 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
        <div className="ml-auto">
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
        <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-4">
          <Skeleton className="h-4 w-28" />
          <div className="flex-1 flex gap-3 justify-around">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-12" />
            ))}
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, r) => (
            <div key={r} className="h-12 flex items-center px-4 gap-4">
              <Skeleton className="h-4 w-28" />
              <div className="flex-1 flex gap-3 justify-around">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-5 rounded-md" />
                ))}
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton({ fieldCount = 4 }: { fieldCount?: number }) {
  return (
    <div className="space-y-4 bg-white p-6 border border-slate-200/80 rounded-lg shadow-2xs max-w-xl">
      {Array.from({ length: fieldCount }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <div className="pt-2 flex justify-end gap-2">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 bg-white border border-slate-200/80 rounded-lg space-y-3 shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-48" />
          <div className="pt-2 flex justify-between items-center">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
