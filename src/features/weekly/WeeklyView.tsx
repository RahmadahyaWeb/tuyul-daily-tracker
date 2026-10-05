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
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  CalendarDays,
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
      {/* Header & Week Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Weekly Matrix Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            7-day checklist consistency map across all your tuyul characters
          </p>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200/80 shadow-2xs">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-600 hover:text-slate-900"
            onClick={() => handleWeekNav(-7)}
            disabled={isPending}
            title="Previous Week"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2.5 font-medium text-slate-700 hover:text-slate-900"
            onClick={handleThisWeek}
            disabled={isPending}
          >
            This Week
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-600 hover:text-slate-900"
            onClick={() => handleWeekNav(7)}
            disabled={isPending}
            title="Next Week"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          <span className="text-xs font-semibold text-slate-700 px-2">
            {formatDateShort(initialWeekDays[0].dateStr)} – {formatDateShort(initialWeekDays[6].dateStr)}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search character, job..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-2xs"
          />
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>100% Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span>Unstarted</span>
          </div>
        </div>
      </div>

      {/* Main Weekly Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader className="bg-slate-50/80 border-b border-slate-200/70">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[220px] text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 pl-4 sticky left-0 z-20 bg-slate-50/90 border-r border-slate-200/60">
                  Character Account
                </TableHead>

                {initialWeekDays.map((day) => {
                  const isToday = day.dateStr === todayStr;
                  return (
                    <TableHead
                      key={day.dateStr}
                      className={cn(
                        "text-center min-w-[70px] text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 px-2",
                        isToday && "bg-indigo-50/50 text-indigo-700"
                      )}
                    >
                      <Link
                        href={`/tracker?date=${day.dateStr}`}
                        className="inline-flex flex-col items-center hover:opacity-80 transition-opacity"
                        title="Open this date in Tracker"
                      >
                        <span className="text-[10px] text-slate-400">{day.dayShort}</span>
                        <span className={cn("text-xs font-semibold", isToday ? "text-indigo-600 font-bold" : "text-slate-800")}>
                          {day.dateNumber}
                        </span>
                      </Link>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-36 text-center text-xs text-slate-400 py-8"
                  >
                    No accounts found matching your filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((acc) => (
                  <TableRow
                    key={acc.id}
                    className="transition-colors hover:bg-slate-50/60"
                  >
                    {/* Sticky Account Column */}
                    <TableCell className="py-3 pl-4 sticky left-0 z-10 bg-white border-r border-slate-200/60">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={acc.nickname} size="sm" />
                        <div className="min-w-0">
                          <Link
                            href={`/accounts/${acc.id}`}
                            className="font-semibold text-xs text-slate-900 hover:text-indigo-600 hover:underline truncate block"
                          >
                            {acc.nickname}
                          </Link>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                            <span>{acc.job}</span>
                            {acc.groupName && (
                              <>
                                <span>·</span>
                                <span className="text-slate-500">{acc.groupName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* 7 Daily Status Cells */}
                    {acc.dailyStatus.map((day) => {
                      const isToday = day.dateStr === todayStr;

                      return (
                        <TableCell
                          key={day.dateStr}
                          className={cn(
                            "text-center p-2 align-middle",
                            isToday && "bg-indigo-50/20"
                          )}
                        >
                          <Link
                            href={`/tracker?date=${day.dateStr}`}
                            className="inline-flex items-center justify-center p-1 rounded-md hover:bg-slate-100 transition-colors"
                          >
                            {day.status === "COMPLETED" && (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 shadow-2xs">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </span>
                            )}

                            {day.status === "PARTIAL" && (
                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-2xs font-mono">
                                {day.completedCount}/{day.totalAssigned}
                              </span>
                            )}

                            {day.status === "NOT_STARTED" && (
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />
                            )}

                            {day.status === "NO_TASKS" && (
                              <span className="text-slate-300 text-xs select-none">—</span>
                            )}
                          </Link>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
