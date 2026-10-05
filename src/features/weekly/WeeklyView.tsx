"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WeeklyAccountRow } from "@/server/db/queries";
import {
  getWeekDays,
  addDays,
  formatDateShort,
  getTodayMakassar,
} from "@/lib/date-utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Minus,
  Search,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyViewProps {
  initialWeekDays: ReturnType<typeof getWeekDays>;
  initialAccounts: WeeklyAccountRow[];
  baseDateStr: string;
}

export function WeeklyView({
  initialWeekDays,
  initialAccounts,
  baseDateStr,
}: WeeklyViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const todayStr = getTodayMakassar();

  const handleWeekNav = (daysOffset: number) => {
    const nextBase = addDays(baseDateStr, daysOffset);
    startTransition(() => {
      router.push(`/weekly?date=${nextBase}`);
    });
  };

  const handleThisWeek = () => {
    startTransition(() => {
      router.push(`/weekly?date=${todayStr}`);
    });
  };

  const filteredAccounts = initialAccounts.filter((acc) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      acc.nickname.toLowerCase().includes(q) ||
      acc.owner.toLowerCase().includes(q) ||
      acc.job.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Header & Navigation Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            Weekly View
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Pantau konsistensi pengerjaan seluruh akun tuyul per minggu
          </p>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-0.5 shadow-xs">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => handleWeekNav(-7)}
              disabled={isPending}
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs font-semibold"
              onClick={handleThisWeek}
              disabled={isPending}
            >
              This Week
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => handleWeekNav(7)}
              disabled={isPending}
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-xs font-medium text-zinc-300 font-mono bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md">
            {formatDateShort(initialWeekDays[0].dateStr)} -{" "}
            {formatDateShort(initialWeekDays[6].dateStr)}
          </div>
        </div>
      </div>

      {/* Legend & Search Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative min-w-[220px] max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari akun tuyul..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500/60 text-emerald-400 flex items-center justify-center font-bold text-xs">
              ✓
            </span>
            <span>Semua Selesai</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-amber-500/20 border border-amber-500/60 text-amber-400 flex items-center justify-center font-bold text-xs">
              •
            </span>
            <span>Sebagian</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-zinc-800 border border-zinc-700 text-zinc-500 flex items-center justify-center font-bold text-xs">
              ✕
            </span>
            <span>Belum Dikerjakan</span>
          </div>
        </div>
      </div>

      {/* Weekly Matrix Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 text-xs font-semibold">
                <th className="py-3 px-4 sticky left-0 z-20 bg-zinc-950 min-w-[200px] border-r border-zinc-800">
                  Account ({filteredAccounts.length})
                </th>
                {initialWeekDays.map((day) => (
                  <th
                    key={day.dateStr}
                    className={cn(
                      "py-3 px-3 text-center min-w-[90px] border-r border-zinc-800/60",
                      day.isToday && "bg-blue-950/20 text-blue-400"
                    )}
                  >
                    <div className="font-semibold text-zinc-200">
                      {day.dayName}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400">
                      {day.dateStr.slice(5)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-zinc-500">
                    Tidak ada data akun.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    {/* Sticky Account Col */}
                    <td className="py-2.5 px-4 sticky left-0 z-10 bg-zinc-900 border-r border-zinc-800">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/accounts/${acc.id}`}
                            className="font-semibold text-zinc-100 hover:text-blue-400 truncate flex items-center gap-1 group"
                          >
                            <span>{acc.nickname}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-zinc-500" />
                          </Link>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {acc.job} • {acc.server}
                          </p>
                        </div>
                        {acc.status !== "Active" && (
                          <Badge variant="neutral" size="sm">
                            {acc.status}
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* 7 Days Matrix Cells (Clickable to jump to daily tracker) */}
                    {acc.dailyStatus.map((day) => {
                      const isToday = day.dateStr === todayStr;

                      return (
                        <td
                          key={day.dateStr}
                          className={cn(
                            "py-2 px-2 text-center border-r border-zinc-800/40",
                            isToday && "bg-blue-950/10"
                          )}
                        >
                          <Link
                            href={`/tracker?date=${day.dateStr}`}
                            title={`Buka Tracker ${acc.nickname} untuk tanggal ${day.dateStr} (${day.completedCount}/${day.totalAssigned})`}
                            className="inline-flex flex-col items-center justify-center p-1.5 rounded-md hover:bg-zinc-800/80 transition-all group"
                          >
                            {day.status === "COMPLETED" && (
                              <span className="w-7 h-7 rounded-md bg-emerald-950/80 border border-emerald-600/80 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </span>
                            )}
                            {day.status === "PARTIAL" && (
                              <span className="w-7 h-7 rounded-md bg-amber-950/80 border border-amber-600/80 text-amber-400 flex items-center justify-center font-bold text-xs font-mono shadow-xs group-hover:scale-105 transition-transform">
                                {day.completedCount}/{day.totalAssigned}
                              </span>
                            )}
                            {day.status === "NOT_STARTED" && (
                              <span className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-600 flex items-center justify-center font-medium text-xs group-hover:border-zinc-600 transition-colors">
                                ✕
                              </span>
                            )}
                            {day.status === "NO_TASKS" && (
                              <span className="w-7 h-7 rounded-md text-zinc-700 flex items-center justify-center">
                                <Minus className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
