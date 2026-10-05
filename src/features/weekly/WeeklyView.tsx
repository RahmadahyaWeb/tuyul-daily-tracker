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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Weekly
        </h1>

        {/* Week Navigator */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleWeekNav(-7)}
            disabled={isPending}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium"
            onClick={handleThisWeek}
            disabled={isPending}
          >
            This Week
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleWeekNav(7)}
            disabled={isPending}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <span className="text-xs text-muted-foreground ml-1">
            {formatDateShort(initialWeekDays[0].dateStr)} – {formatDateShort(initialWeekDays[6].dateStr)}
          </span>
        </div>
      </div>

      {/* Toolbar: Search */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Main Weekly Table */}
      <div className="rounded-md border border-border overflow-hidden bg-background">
        <Table className="min-w-[650px]">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[200px] sticky left-0 z-20 bg-background border-r border-border font-medium text-xs">
                Account
              </TableHead>

              {initialWeekDays.map((day) => {
                const isToday = day.dateStr === todayStr;
                return (
                  <TableHead
                    key={day.dateStr}
                    className={cn(
                      "text-center min-w-[60px] font-medium text-xs px-2",
                      isToday && "bg-muted font-semibold text-foreground"
                    )}
                  >
                    <Link
                      href={`/tracker?date=${day.dateStr}`}
                      className="inline-flex flex-col items-center hover:underline"
                    >
                      <span>{day.dayShort}</span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {day.dateNumber}
                      </span>
                    </Link>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-xs text-muted-foreground"
                >
                  No accounts found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((acc) => (
                <TableRow
                  key={acc.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {/* Account Column */}
                  <TableCell className="sticky left-0 z-10 bg-background border-r border-border py-2 px-3">
                    <div className="min-w-0">
                      <Link
                        href={`/accounts/${acc.id}`}
                        className="font-medium text-sm text-foreground hover:underline truncate block"
                      >
                        {acc.nickname}
                      </Link>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {acc.job} · {acc.server}
                      </div>
                    </div>
                  </TableCell>

                  {/* Days */}
                  {acc.dailyStatus.map((day) => {
                    const isToday = day.dateStr === todayStr;

                    return (
                      <TableCell
                        key={day.dateStr}
                        className={cn(
                          "py-2 px-1 text-center",
                          isToday && "bg-muted/30"
                        )}
                      >
                        <Link
                          href={`/tracker?date=${day.dateStr}`}
                          className="inline-flex items-center justify-center p-1 rounded hover:bg-accent transition-colors"
                          title={`${acc.nickname}: ${day.completedCount}/${day.totalAssigned}`}
                        >
                          {day.status === "COMPLETED" && (
                            <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                          )}

                          {day.status === "PARTIAL" && (
                            <span className="text-xs font-mono text-amber-600 font-medium">
                              {day.completedCount}/{day.totalAssigned}
                            </span>
                          )}

                          {day.status === "NOT_STARTED" && (
                            <span className="text-muted-foreground/30 font-mono text-xs select-none">
                              —
                            </span>
                          )}

                          {day.status === "NO_TASKS" && (
                            <span className="text-muted-foreground/20 font-mono text-xs select-none">
                              ·
                            </span>
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
  );
}
