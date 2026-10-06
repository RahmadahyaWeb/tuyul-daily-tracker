"use client";

import React from "react";
import Link from "next/link";
import { DashboardStats } from "@/server/db/queries";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AppPage } from "@/components/shared/AppPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";

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
    <AppPage>
      {/* Unified Page Header */}
      <PageHeader
        title="Dashboard"
        action={
          <Button asChild>
            <Link href="/tracker">
              Open Tracker <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        }
      />

      {/* Unified Overview Panel */}
      <div className="bg-[#FCFAF7] border border-[#cfbeaa] rounded-xs p-5 shadow-[2px_2px_0px_#cfbeaa] space-y-4">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-[#ebd7b2] pb-2.5">
          <span className="text-xs font-semibold text-[#8a7b68] uppercase tracking-wide">
            Today
          </span>
          <span className="text-xs font-bold text-[#3B6EA8] font-mono">
            {overallProgress}% Completed
          </span>
        </div>

        {/* Standard Statistics Typography (Rule #20) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#eee7dc]">
          <div>
            <span className="text-xs text-[#8a7b68] font-medium block">
              Accounts
            </span>
            <span className="text-2xl sm:text-3xl font-semibold text-[#231b12] mt-1 block">
              {totalAccounts}
            </span>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-6">
            <span className="text-xs text-[#1E5D2F] font-medium block">
              Completed
            </span>
            <span className="text-2xl sm:text-3xl font-semibold text-[#1E5D2F] mt-1 block">
              {completedToday}
            </span>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-6">
            <span className="text-xs text-[#8C580B] font-medium block">
              In Progress
            </span>
            <span className="text-2xl sm:text-3xl font-semibold text-[#8C580B] mt-1 block">
              {inProgressToday}
            </span>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-6">
            <span className="text-xs text-[#8a7b68] font-medium block">
              Not Started
            </span>
            <span className="text-2xl sm:text-3xl font-semibold text-[#5c4e3b] mt-1 block">
              {notStartedToday}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-3 border-t border-[#eee7dc] space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-[#5c4e3b]">
            <span>Completion Progress</span>
            <span className="font-mono text-[#231b12] font-semibold">{overallProgress}%</span>
          </div>
          <Progress
            value={overallProgress}
            className="h-2 bg-[#f0eae1]"
            indicatorColor={overallProgress === 100 ? "bg-[#347A46]" : "bg-[#3B6EA8]"}
          />
        </div>
      </div>

      {/* Need Attention List */}
      <section className="space-y-3 pt-2">
        <SectionHeader
          title="Need Attention"
          action={
            needAttention.length > 0 ? (
              <span className="text-xs text-[#8a7b68] font-mono">
                {needAttention.length} accounts pending
              </span>
            ) : undefined
          }
        />

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
                    className="text-sm font-semibold text-[#231b12] hover:text-[#3B6EA8] truncate block"
                  >
                    {acc.nickname}
                  </Link>
                  <p className="text-xs text-[#8a7b68] truncate mt-0.5">
                    {acc.job} · {acc.server}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-[#231b12] font-mono">
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

                  <Button asChild variant="outline" size="sm" className="h-8 text-xs px-2.5">
                    <Link href="/tracker">Track</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppPage>
  );
}
