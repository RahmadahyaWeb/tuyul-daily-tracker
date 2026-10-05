import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1.5">
          <div className="h-6 w-36 bg-gray-200 rounded-md" />
          <div className="h-4 w-52 bg-gray-100 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-gray-200 rounded-md" />
          <div className="h-8 w-28 bg-gray-200 rounded-md" />
        </div>
      </div>

      {/* Stats Cards / Filter Bar Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-3.5 bg-white border border-gray-200 rounded-lg space-y-2"
          >
            <div className="h-3 w-16 bg-gray-100 rounded" />
            <div className="h-6 w-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Main Table / Content Skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden p-4 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-100 rounded" />
        </div>
        {[1, 2, 3, 4, 5, 6].map((row) => (
          <div key={row} className="flex items-center gap-4 py-2">
            <div className="h-4 w-28 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-4 w-36 bg-gray-100 rounded" />
            <div className="flex-1" />
            <div className="h-5 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
