"use client";

import React from "react";
import Link from "next/link";
import { DashboardStats } from "@/server/db/queries";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  ListTodo,
} from "lucide-react";

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
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Overview Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time daily tracker performance across all your active Ragnarok accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/tracker">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-xs gap-1.5 text-xs h-9">
              <ListTodo className="w-3.5 h-3.5" />
              Open Daily Tracker
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Overall Progress */}
        <Card className="saas-card">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-medium text-slate-500">Overall Progress</span>
            <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {overallProgress}%
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                {completedToday}/{activeAccounts} Done
              </span>
            </div>
            <Progress value={overallProgress} className="h-1.5" />
          </CardContent>
        </Card>

        {/* Metric 2: Active Accounts */}
        <Card className="saas-card">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-medium text-slate-500">Active Accounts</span>
            <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-3.5 h-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {activeAccounts}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Ready for daily tracking
            </p>
          </CardContent>
        </Card>

        {/* Metric 3: Completed Today */}
        <Card className="saas-card">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-medium text-slate-500">Completed 100%</span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold tracking-tight text-emerald-600">
              {completedToday}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {activeAccounts > 0 ? `${Math.round((completedToday / activeAccounts) * 100)}% of total accounts` : "0%"}
            </p>
          </CardContent>
        </Card>

        {/* Metric 4: Pending / In-Progress */}
        <Card className="saas-card">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-medium text-slate-500">Pending Accounts</span>
            <div className="w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold tracking-tight text-amber-600">
              {inProgressToday + notStartedToday}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {inProgressToday} in-progress · {notStartedToday} unstarted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Need Attention List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pending Checklist Action ({needAttention.length})
            </h2>
          </div>
          {needAttention.length > 0 && (
            <Link href="/tracker" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1">
              Go to Tracker <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {needAttention.length === 0 ? (
          <Card className="border border-emerald-100 bg-emerald-50/30 p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-emerald-900">All Tuyul Accounts Completed!</h3>
            <p className="text-xs text-emerald-700 max-w-md mx-auto">
              Great job! All active Ragnarok accounts have completed their assigned daily checklists for today.
            </p>
          </Card>
        ) : (
          <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs divide-y divide-slate-100">
            {needAttention.map((acc) => (
              <div
                key={acc.id}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={acc.nickname} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/accounts/${acc.id}`}
                        className="font-semibold text-xs text-slate-900 hover:text-indigo-600 hover:underline truncate"
                      >
                        {acc.nickname}
                      </Link>
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                        {acc.job}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {acc.server} · Owner: {acc.owner}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] font-medium text-slate-600">
                      {acc.completedCount} / {acc.totalCount} Tasks
                    </span>
                    <div className="w-24 hidden sm:block">
                      <Progress value={acc.progress} className="h-1.5" />
                    </div>
                  </div>

                  <Link href="/tracker">
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
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
