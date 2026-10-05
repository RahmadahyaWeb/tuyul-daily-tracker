"use client";

import React from "react";
import Link from "next/link";
import { DashboardStats } from "@/server/db/queries";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface DashboardViewProps {
  stats: DashboardStats;
}

export function DashboardView({ stats }: DashboardViewProps) {
  const {
    totalAccounts,
    completedToday,
    inProgressToday,
    notStartedToday,
    overallProgress,
    needAttention,
  } = stats;

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Today</h1>
        </div>
        <Button asChild size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8">
          <Link href="/tracker">
            Open Tracker <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </Button>
      </div>

      {/* Overview Stat Block */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-2xs space-y-5">
        {/* KPI Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Accounts
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 block">
              {totalAccounts}
            </span>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-6">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">
              Completed
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1 block">
              {completedToday}
            </span>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-6">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block">
              In Progress
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1 block">
              {inProgressToday}
            </span>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Not Started
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-700 mt-1 block">
              {notStartedToday}
            </span>
          </div>
        </div>

        {/* Progress Bar with Overall % */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Daily Completion</span>
            <span className="text-slate-900 font-bold">{overallProgress}% Completed</span>
          </div>
          <Progress value={overallProgress} className="h-2 bg-slate-100" />
        </div>
      </div>

      {/* Need Attention List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Need Attention
          </h2>
          {needAttention.length > 0 && (
            <span className="text-xs text-slate-400">{needAttention.length} accounts</span>
          )}
        </div>

        {needAttention.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200/80 rounded-xl text-center">
            <p className="text-xs text-slate-500 font-medium">
              All accounts have completed their assigned tasks for today.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-2xs">
            {needAttention.map((acc) => (
              <div
                key={acc.id}
                className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <Link
                    href={`/accounts/${acc.id}`}
                    className="text-xs font-bold text-slate-900 hover:underline truncate block"
                  >
                    {acc.nickname}
                  </Link>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {acc.job} · {acc.server}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-900">
                      {acc.completedCount} / {acc.totalCount}
                    </span>
                    <div className="w-20 hidden sm:block mt-1">
                      <Progress value={acc.progress} className="h-1" />
                    </div>
                  </div>

                  <Button asChild variant="outline" size="sm" className="h-7 text-xs px-2.5">
                    <Link href="/tracker">Track</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
