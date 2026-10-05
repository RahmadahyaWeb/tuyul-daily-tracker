"use client";

import React from "react";
import Link from "next/link";
import { DashboardStats } from "@/server/db/queries";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";

interface DashboardViewProps {
  stats: DashboardStats;
}

export function DashboardView({ stats }: DashboardViewProps) {
  const {
    activeAccounts,
    completedToday,
    inProgressToday,
    notStartedToday,
    overallProgress,
    needAttention,
  } = stats;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-gray-500">
            Overview of today&apos;s Ragnarok tuyul accounts progress
          </p>
        </div>
        <div>
          <Link href="/tracker">
            <Button variant="primary" size="sm" className="gap-1.5 font-medium">
              <span>Open Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Clean Summary Row (No heavy card boxes) */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-gray-600">
            <span className="font-semibold text-gray-900">
              {activeAccounts} Active Accounts
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-emerald-700 font-medium">
              {completedToday} Completed
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-amber-700 font-medium">
              {inProgressToday} In Progress
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-500">
              {notStartedToday} Not Started
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">
              {overallProgress}% completed
            </span>
          </div>
        </div>

        <ProgressBar value={overallProgress} size="sm" />
      </div>

      {/* Need Attention List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Need Attention ({needAttention.length})
          </h2>
          <span className="text-xs text-gray-500">
            Active accounts not yet completed today
          </span>
        </div>

        {needAttention.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center space-y-1.5 shadow-2xs">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <p className="text-sm font-medium text-gray-900">
              All active accounts completed 100%!
            </p>
            <p className="text-xs text-gray-500">
              Great job! All assigned daily tasks for today are done.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
            <div className="divide-y divide-gray-100 text-xs">
              {needAttention.map((acc) => (
                <div
                  key={acc.id}
                  className="p-3 flex items-center justify-between hover:bg-gray-50/80 transition-colors"
                >
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/accounts/${acc.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-1 group truncate"
                      >
                        <span>{acc.nickname}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-gray-400" />
                      </Link>
                      <span className="text-[11px] text-gray-500">
                        ({acc.job} · {acc.server})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-24 hidden sm:block">
                      <ProgressBar value={acc.progress} size="sm" />
                    </div>
                    <span className="font-mono text-xs font-semibold text-gray-700 min-w-[40px] text-right">
                      {acc.completedCount} / {acc.totalCount}
                    </span>
                    <Link href="/tracker">
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                        Track
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
