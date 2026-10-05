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
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Weekly
          </h1>
          <p className="text-xs text-gray-500">
            Monitor daily completion consistency across the week
          </p>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-gray-200 rounded-md p-0.5 shadow-2xs">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-1.5"
              onClick={() => handleWeekNav(-7)}
              disabled={isPending}
              title="Previous Week"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs font-medium text-gray-700"
              onClick={handleThisWeek}
              disabled={isPending}
            >
              This Week
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-1.5"
              onClick={() => handleWeekNav(7)}
              disabled={isPending}
              title="Next Week"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <span className="text-xs font-medium text-gray-600 font-mono bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-2xs">
            {formatDateShort(initialWeekDays[0].dateStr)} – {formatDateShort(initialWeekDays[6].dateStr)}
          </span>
        </div>
      </div>

      {/* Flat Toolbar: Search & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
        {/* Search */}
        <div className="relative min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 h-8 shadow-2xs"
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
              ✓
            </span>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-mono font-medium">
              •
            </span>
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-gray-100 text-gray-400 flex items-center justify-center text-[10px]">
              —
            </span>
            <span>Not Started</span>
          </div>
        </div>
      </div>

      {/* Main Weekly Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-xs font-semibold">
                <th className="py-2.5 px-3.5 sticky left-0 z-20 bg-gray-50 min-w-[190px] border-r border-gray-200">
                  Account ({filteredAccounts.length})
                </th>

                {initialWeekDays.map((day) => {
                  const isToday = day.dateStr === todayStr;
                  return (
                    <th
                      key={day.dateStr}
                      className={cn(
                        "py-2.5 px-2 text-center min-w-[70px] border-r border-gray-100",
                        isToday && "bg-blue-50/60"
                      )}
                    >
                      <Link
                        href={`/tracker?date=${day.dateStr}`}
                        className="group inline-flex flex-col items-center hover:text-blue-600 transition-colors"
                        title={`Jump to Daily Tracker on ${day.dateStr}`}
                      >
                        <span className="font-semibold text-gray-800 group-hover:text-blue-600">
                          {day.dayShort}
                        </span>
                        <span
                          className={cn(
                            "text-[11px] font-mono",
                            isToday ? "text-blue-600 font-bold" : "text-gray-400 group-hover:text-blue-500"
                          )}
                        >
                          {day.dateNumber}
                        </span>
                      </Link>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-gray-400"
                  >
                    No accounts found.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    {/* Sticky Account Column */}
                    <td className="py-2 px-3.5 sticky left-0 z-10 border-r border-gray-200 bg-white">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/accounts/${acc.id}`}
                            className="font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-1 group truncate"
                          >
                            <span>{acc.nickname}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-gray-400" />
                          </Link>
                          {acc.status !== "Active" && (
                            <Badge
                              variant={acc.status === "Paused" ? "warning" : "neutral"}
                              size="sm"
                            >
                              {acc.status}
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate mt-0.5">
                          {acc.job} · {acc.server} {acc.groupName && `· ${acc.groupName}`}
                        </div>
                      </div>
                    </td>

                    {/* Day Cells */}
                    {acc.dailyStatus.map((day) => {
                      const isToday = day.dateStr === todayStr;

                      return (
                        <td
                          key={day.dateStr}
                          className={cn(
                            "py-2 px-2 text-center border-r border-gray-100",
                            isToday && "bg-blue-50/20"
                          )}
                        >
                          <Link
                            href={`/tracker?date=${day.dateStr}`}
                            className="inline-flex items-center justify-center p-1 rounded hover:bg-gray-100 transition-colors"
                            title={`${acc.nickname} (${day.dateStr}): ${day.completedCount}/${day.totalAssigned} tasks`}
                          >
                            {day.status === "COMPLETED" && (
                              <span className="w-5 h-5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                                <Check className="w-3 h-3 stroke-[2.5]" />
                              </span>
                            )}

                            {day.status === "PARTIAL" && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono font-medium">
                                {day.completedCount}/{day.totalAssigned}
                              </span>
                            )}

                            {day.status === "NOT_STARTED" && (
                              <span className="text-gray-300 font-mono text-xs select-none">
                                —
                              </span>
                            )}

                            {day.status === "NO_TASKS" && (
                              <span className="text-gray-200 font-mono text-xs select-none">
                                ·
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
