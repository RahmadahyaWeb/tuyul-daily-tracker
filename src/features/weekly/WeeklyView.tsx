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
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppPage } from "@/components/shared/AppPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageToolbar } from "@/components/shared/PageToolbar";
import { DateNavigator } from "@/components/shared/DateNavigator";
import { DataTablePagination } from "@/components/shared/DataTablePagination";

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

  return (
    <AppPage>
      {/* Unified Page Header & Week Controller */}
      <PageHeader
        title="Weekly"
        action={
          <DateNavigator
            currentDate={baseDateStr}
            onDateChange={(newDate) => {
              startTransition(() => {
                router.push(`/weekly?date=${newDate}`);
              });
            }}
            onJumpCurrent={handleThisWeek}
            jumpLabel="THIS WEEK"
            isCurrentActive={baseDateStr === todayStr}
            onPrev={() => handleWeekNav(-7)}
            onNext={() => handleWeekNav(7)}
            disabled={isPending}
          />
        }
      />

      {/* Unified Page Toolbar */}
      <PageToolbar>
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#8a7b68] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-[#cfc3b0] rounded-xs text-[#2c261e] focus:outline-none focus:border-[#3B6EA8] shadow-[1px_1px_0px_#e5ddd0]"
          />
        </div>

        <span className="text-xs text-[#5c4e3b] font-medium shrink-0">
          {filteredAccounts.length} accounts
        </span>
      </PageToolbar>

      {/* DESKTOP & TABLET MATRIX TABLE (hidden on mobile) */}
      <div className="hidden md:block bg-white border border-[#cfbeaa] rounded-xs overflow-hidden shadow-[2px_2px_0px_#ded5c5]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F4EFE6] border-b border-[#ded4c4]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px] font-bold text-xs text-[#2c261e] tracking-wider uppercase font-sans">
                  ACCOUNT
                </TableHead>
                {initialWeekDays.map((day) => {
                  const isToday = day.dateStr === todayStr;
                  return (
                    <TableHead
                      key={day.dateStr}
                      className={cn(
                        "text-center font-bold text-xs text-[#2c261e] min-w-[70px] tracking-wider uppercase font-sans",
                        isToday && "bg-[#FAF2E1] text-[#664b28]"
                      )}
                    >
                      <div>{day.dayName.toUpperCase()}</div>
                      <div className="text-[10px] font-mono text-[#8a7b68] font-normal">
                        {formatDateShort(day.dateStr)}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[#eee7dc]">
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-12 text-xs text-[#8a7b68]"
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
                    <TableRow key={acc.id} className="hover:bg-[#FAF6F0] transition-colors">
                      <TableCell className="py-3 font-medium">
                        <div className="min-w-0">
                          <Link
                            href={`/accounts/${acc.id}`}
                            className="text-xs font-bold text-[#231b12] hover:text-[#3B6EA8] truncate block"
                          >
                            {acc.nickname}
                          </Link>
                          <p className="text-[10px] text-[#8a7b68] truncate leading-tight mt-0.5">
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
                            className={cn("text-center py-3", isToday && "bg-[#FAF2E1]/40")}
                          >
                            {status.totalAssigned === 0 ? (
                              <span className="text-[#cfc3b0] font-mono text-xs">-</span>
                            ) : status.status === "COMPLETED" ? (
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded-xs bg-[#ECFDF3] border border-[#a3ddb4] text-[#1E5D2F] shadow-[1px_1px_0px_#a3ddb4]">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                            ) : status.status === "PARTIAL" ? (
                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-xs text-[11px] font-bold bg-[#FFF8EB] text-[#8C580B] border border-[#cfbeaa] font-mono shadow-[1px_1px_0px_#e5ddd0]">
                                {status.completedCount}/{status.totalAssigned}
                              </span>
                            ) : (
                              <span className="text-[#a39480] text-xs font-mono">0/{status.totalAssigned}</span>
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

        <DataTablePagination
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
          <div className="p-8 bg-white border border-[#ded5c5] rounded-xs text-center text-xs text-[#8a7b68]">
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
                className="bg-white border border-[#cfbeaa] rounded-xs p-4 shadow-[2px_2px_0px_#dfd5c5] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/accounts/${acc.id}`}
                      className="text-xs font-bold text-[#231b12] hover:text-[#3B6EA8]"
                    >
                      {acc.nickname}
                    </Link>
                    <p className="text-[11px] text-[#8a7b68] mt-0.5">{acc.job}</p>
                  </div>
                </div>

                {/* 7-day grid */}
                <div className="grid grid-cols-7 gap-1 pt-2 border-t border-[#eee7dc] text-center">
                  {initialWeekDays.map((day) => {
                    const status = dailyMap.get(day.dateStr) || {
                      completedCount: 0,
                      totalAssigned: 0,
                      status: "NO_TASKS" as const,
                    };

                    return (
                      <div key={day.dateStr} className="space-y-1">
                        <span className="text-[10px] font-semibold text-[#8a7b68] block uppercase">
                          {day.dayName.slice(0, 3)}
                        </span>
                        <div className="flex items-center justify-center h-7">
                          {status.totalAssigned === 0 ? (
                            <span className="text-[#cfc3b0] text-xs">-</span>
                          ) : status.status === "COMPLETED" ? (
                            <span className="w-5 h-5 rounded-xs bg-[#ECFDF3] border border-[#a3ddb4] text-[#1E5D2F] flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            </span>
                          ) : status.status === "PARTIAL" ? (
                            <span className="text-[10px] font-bold text-[#8C580B] bg-[#FFF8EB] border border-[#cfbeaa] px-1 py-0.5 rounded-xs font-mono">
                              {status.completedCount}
                            </span>
                          ) : (
                            <span className="text-[#a39480] text-[10px] font-mono">0</span>
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
          <div className="bg-white border border-[#cfbeaa] rounded-xs overflow-hidden shadow-[2px_2px_0px_#ded5c5]">
            <DataTablePagination
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
    </AppPage>
  );
}
