"use client";

import React from "react";
import Link from "next/link";
import { DashboardStats } from "@/server/db/queries";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <Link href="/tracker">
          <Button size="sm">Open Tracker</Button>
        </Link>
      </div>

      {/* Today Summary */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Today
        </h2>

        <div className="rounded-md border border-border p-4 space-y-3 bg-background">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
              <span className="font-medium text-foreground">
                {activeAccounts} Accounts
              </span>
              <span>·</span>
              <span>{completedToday} Completed</span>
              <span>·</span>
              <span>{inProgressToday} In Progress</span>
              <span>·</span>
              <span>{notStartedToday} Not Started</span>
            </div>

            <div className="text-sm font-medium text-foreground">
              {overallProgress}%
            </div>
          </div>

          <Progress value={overallProgress} className="h-2" />
        </div>
      </div>

      {/* Need Attention Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Need Attention ({needAttention.length})
          </h2>
        </div>

        {needAttention.length === 0 ? (
          <div className="rounded-md border border-border p-6 text-center text-sm text-muted-foreground bg-background">
            All active accounts completed.
          </div>
        ) : (
          <div className="rounded-md border border-border divide-y divide-border bg-background">
            {needAttention.map((acc) => (
              <div
                key={acc.id}
                className="p-3 flex items-center justify-between hover:bg-muted/40 transition-colors text-sm"
              >
                <div className="min-w-0 pr-4">
                  <Link
                    href={`/accounts/${acc.id}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {acc.nickname}
                  </Link>
                  <span className="text-xs text-muted-foreground ml-2">
                    {acc.job} · {acc.server}
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-20 hidden sm:block">
                    <Progress value={acc.progress} className="h-1.5" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground min-w-[36px] text-right">
                    {acc.completedCount} / {acc.totalCount}
                  </span>
                  <Link href="/tracker">
                    <Button variant="ghost" size="xs">
                      Track
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
