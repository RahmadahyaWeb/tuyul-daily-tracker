"use client";

import React from "react";
import Link from "next/link";
import { DashboardStats } from "@/server/db/queries";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle2,
  Clock,
  CircleDashed,
  Users,
  ArrowRight,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface DashboardViewProps {
  stats: DashboardStats;
}

export function DashboardView({ stats }: DashboardViewProps) {
  const {
    totalAccounts,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ringkasan progres aktivitas harian tuyul hari ini
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/tracker">
            <Button variant="primary" size="sm" className="gap-1.5">
              <span>Buka Daily Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stats Bar & Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Accounts */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium">Total Accounts</span>
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-zinc-100">
              {totalAccounts}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              ({activeAccounts} active)
            </span>
          </div>
        </div>

        {/* Completed Today */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400/90 mb-1">
            <span className="text-xs font-medium">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-400">
              {completedToday}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              / {activeAccounts} akun
            </span>
          </div>
        </div>

        {/* In Progress Today */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400/90 mb-1">
            <span className="text-xs font-medium">In Progress</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-amber-400">
              {inProgressToday}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">akun</span>
          </div>
        </div>

        {/* Not Started Today */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium">Not Started</span>
            <CircleDashed className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-zinc-300">
              {notStartedToday}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">akun</span>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-1 bg-zinc-900/90 border border-zinc-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium">Today Progress</span>
            <span className="text-xs font-mono font-bold text-zinc-200">
              {overallProgress}%
            </span>
          </div>
          <div className="pt-1">
            <ProgressBar value={overallProgress} size="md" />
          </div>
        </div>
      </div>

      {/* Main Content Section: Need Attention */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-zinc-200">
              Need Attention ({needAttention.length})
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            Daftar akun aktif yang belum 100% selesai hari ini
          </span>
        </div>

        {needAttention.length === 0 ? (
          <div className="py-8 text-center space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-medium text-zinc-200">
              Semua akun aktif sudah selesai 100%!
            </p>
            <p className="text-xs text-zinc-400">
              Kerja bagus! Seluruh checklist hari ini telah diselesaikan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {needAttention.map((acc) => {
              const isStarted = acc.completedCount > 0;

              return (
                <div
                  key={acc.id}
                  className="p-3 rounded-md bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col justify-between gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/accounts/${acc.id}`}
                          className="font-semibold text-sm text-zinc-100 hover:text-blue-400 truncate flex items-center gap-1 group"
                        >
                          <span>{acc.nickname}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-zinc-400 transition-opacity" />
                        </Link>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {acc.job} • {acc.server} • {acc.owner}
                      </p>
                    </div>

                    <Badge
                      variant={isStarted ? "warning" : "neutral"}
                      size="sm"
                      className="font-mono"
                    >
                      {acc.completedCount} / {acc.totalCount}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <ProgressBar
                      value={acc.progress}
                      size="sm"
                      showLabel={false}
                    />
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>{acc.progress}% Selesai</span>
                      <span>{acc.totalCount - acc.completedCount} tersisa</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
