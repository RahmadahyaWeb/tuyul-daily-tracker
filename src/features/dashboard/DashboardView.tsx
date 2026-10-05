"use client";

import React from "react";
import Link from "next/link";
import { DashboardStats } from "@/server/db/queries";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass } from "lucide-react";

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
    <div className="space-y-6 w-full max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#dfd5c5]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#3B6EA8] rounded-none shadow-[0.5px_0.5px_0px_#1e3b60]" />
          <h1 className="text-xl font-bold tracking-tight text-[#231b12]">
            Dashboard
          </h1>
        </div>
        <Button asChild size="sm">
          <Link href="/tracker">
            Open Tracker <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </Button>
      </div>

      {/* Overview Stat Block - Pixel RPG Panel */}
      <div className="bg-[#FCFAF7] border-2 border-[#cfbeaa] rounded-xs p-5 shadow-[3px_3px_0px_#cfbeaa] space-y-4">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-[#ebd7b2] pb-2 text-[11px] font-bold text-[#8a7b68] font-pixel tracking-wider uppercase">
          <span>DAILY QUEST EXP & STATUS</span>
          <span className="text-[#3B6EA8]">{overallProgress}% COMPLETED</span>
        </div>

        {/* KPI Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#eee7dc]">
          <div>
            <span className="text-[11px] font-bold text-[#8a7b68] uppercase tracking-wider block font-pixel">
              ROSTER
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#231b12] mt-1 block">
              {totalAccounts}
            </span>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-6">
            <span className="text-[11px] font-bold text-[#1E5D2F] uppercase tracking-wider block font-pixel">
              COMPLETED
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1E5D2F] mt-1 block">
              {completedToday}
            </span>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-6">
            <span className="text-[11px] font-bold text-[#8C580B] uppercase tracking-wider block font-pixel">
              IN PROGRESS
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#8C580B] mt-1 block">
              {inProgressToday}
            </span>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-6">
            <span className="text-[11px] font-bold text-[#8a7b68] uppercase tracking-wider block font-pixel">
              NOT STARTED
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#5c4e3b] mt-1 block">
              {notStartedToday}
            </span>
          </div>
        </div>

        {/* Progress Bar with Overall % */}
        <div className="pt-3 border-t border-[#eee7dc] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#5c4e3b]">Quest Completion Bar</span>
            <span className="text-[#231b12] font-mono">{overallProgress}%</span>
          </div>
          <Progress
            value={overallProgress}
            className="h-2.5 bg-[#f0eae1]"
            indicatorColor={overallProgress === 100 ? "bg-[#347A46]" : "bg-[#3B6EA8]"}
          />
        </div>
      </div>

      {/* Need Attention List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#736350] font-pixel">
              QUESTS IN NEED OF ATTENTION
            </span>
          </div>
          {needAttention.length > 0 && (
            <span className="text-xs text-[#8a7b68] font-mono">
              {needAttention.length} accounts pending
            </span>
          )}
        </div>

        {needAttention.length === 0 ? (
          <div className="p-8 bg-white border border-[#ded5c5] rounded-xs text-center shadow-[1px_1px_0px_#e5ddd0]">
            <p className="text-xs text-[#685744] font-medium">
              All accounts have completed their assigned tasks for today. Outstanding work!
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#ded5c5] rounded-xs overflow-hidden divide-y divide-[#eee7dc] shadow-[2px_2px_0px_#e5ddd0]">
            {needAttention.map((acc) => (
              <div
                key={acc.id}
                className="px-4 py-3 flex items-center justify-between hover:bg-[#FAF6F0] transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <Link
                    href={`/accounts/${acc.id}`}
                    className="text-xs font-bold text-[#231b12] hover:text-[#3B6EA8] truncate block"
                  >
                    {acc.nickname}
                  </Link>
                  <p className="text-[11px] text-[#8a7b68] truncate mt-0.5">
                    {acc.job} · {acc.server}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#231b12] font-mono">
                      {acc.completedCount} / {acc.totalCount}
                    </span>
                    <div className="w-20 hidden sm:block mt-1">
                      <Progress
                        value={acc.progress}
                        className="h-1.5 bg-[#f0eae1]"
                        indicatorColor={acc.progress > 50 ? "bg-[#B57C1E]" : "bg-[#3B6EA8]"}
                      />
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
