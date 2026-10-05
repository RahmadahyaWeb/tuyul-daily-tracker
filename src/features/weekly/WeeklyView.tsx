"use client";

import React, { useState, useEffect, useTransition } from "react";
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
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { DatePicker } from "@/components/ui/date-picker";

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
      acc.job.toLowerCase().includes(q) ||
      (acc.groupName && acc.groupName.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const weekRangeLabel = `${formatDateShort(initialWeekDays[0].dateStr)} – ${formatDateShort(
    initialWeekDays[6].dateStr
  )}`;

  return (
    <div className="space-y-4 w-full">
      {/* Header & Week Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Weekly</h1>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-600 hover:text-slate-900"
              onClick={() => handleWeekNav(-7)}
              disabled={isPending}
              aria-label="Previous week"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs px-2.5 font-medium text-slate-700"
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
              aria-label="Next week"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <DatePicker
            value={baseDateStr}
            onChange={(newDate) => {
              startTransition(() => {
                router.push(`/weekly?date=${newDate}`);
              });
            }}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <span className="text-xs font-medium text-slate-500 shrink-0">
          {filteredAccounts.length} Accounts
        </span>
      </div>

      {/* DESKTOP & TABLET MATRIX TABLE (hidden on mobile) */}
      <div className="hidden md:block bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px] font-semibold text-xs text-slate-900">
                  Account
                </TableHead>
                {initialWeekDays.map((day) => {
                  const isToday = day.dateStr === todayStr;
                  return (
                    <TableHead
                      key={day.dateStr}
                      className={cn(
                        "text-center font-semibold text-xs text-slate-700 min-w-[70px]",
                        isToday && "bg-slate-100 font-bold text-slate-900"
                      )}
                    >
                      <div>{day.dayName}</div>
                      <div className="text-[10px] font-normal text-slate-400">
                        {formatDateShort(day.dateStr)}
                      </div>
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
                    className="text-center py-12 text-xs text-slate-400"
                  >
                    No accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAccounts.map((acc) => {
                  const dailyMap = new Map(
                    acc.dailyStatus.map((d) => [d.dateStr, d])
                  );

                  return (
                    <TableRow key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                      <TableCell className="py-3 font-medium">
                        <div className="min-w-0">
                          <Link
                            href={`/accounts/${acc.id}`}
                            className="text-xs font-bold text-slate-900 hover:underline truncate block"
                          >
                            {acc.nickname}
                          </Link>
                          <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                            {acc.job}
                          </p>
                        </div>
                      </TableCell>

                      {initialWeekDays.map((day) => {
                        const status = dailyMap.get(day.dateStr) || {
                          completedCount: 0,
                          totalAssigned: 0,
                          status: "NO_TASKS" as const,
                        };

                        const isToday = day.dateStr === todayStr;

                        return (
                          <TableCell
                            key={day.dateStr}
                            className={cn("text-center py-3", isToday && "bg-slate-50/50")}
                          >
                            {status.totalAssigned === 0 ? (
                              <span className="text-slate-200 font-mono text-xs">-</span>
                            ) : status.status === "COMPLETED" ? (
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50 text-emerald-600">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                            ) : status.status === "PARTIAL" ? (
                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                                {status.completedCount}/{status.totalAssigned}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs">0/{status.totalAssigned}</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredAccounts.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          itemLabel="accounts"
        />
      </div>

      {/* MOBILE ACCOUNT-ORIENTED WEEK LIST (shown only on mobile < md) */}
      <div className="md:hidden space-y-3">
        {filteredAccounts.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200/80 rounded-xl text-center text-xs text-slate-400">
            No accounts found.
          </div>
        ) : (
          paginatedAccounts.map((acc) => {
            const dailyMap = new Map(
              acc.dailyStatus.map((d) => [d.dateStr, d])
            );

            return (
              <div
                key={acc.id}
                className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/accounts/${acc.id}`}
                      className="text-xs font-bold text-slate-900 hover:underline"
                    >
                      {acc.nickname}
                    </Link>
                    <p className="text-[11px] text-slate-400 mt-0.5">{acc.job}</p>
                  </div>
                </div>

                {/* 7-day grid */}
                <div className="grid grid-cols-7 gap-1 pt-2 border-t border-slate-100 text-center">
                  {initialWeekDays.map((day) => {
                    const status = dailyMap.get(day.dateStr) || {
                      completedCount: 0,
                      totalAssigned: 0,
                      status: "NO_TASKS" as const,
                    };

                    return (
                      <div key={day.dateStr} className="space-y-1">
                        <span className="text-[10px] font-medium text-slate-400 block">
                          {day.dayName.slice(0, 3)}
                        </span>
                        <div className="flex items-center justify-center h-7">
                          {status.totalAssigned === 0 ? (
                            <span className="text-slate-200 text-xs">-</span>
                          ) : status.status === "COMPLETED" ? (
                            <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            </span>
                          ) : status.status === "PARTIAL" ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded">
                              {status.completedCount}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-[10px]">0</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {filteredAccounts.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-slate-200/80 shadow-2xs">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredAccounts.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              itemLabel="accounts"
            />
          </div>
        )}
      </div>
    </div>
  );
}
