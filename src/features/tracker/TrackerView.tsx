"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrackerData, TrackerAccountRow } from "@/server/db/queries";
import {
  toggleActivityLog,
  completeAccountDaily,
  resetAccountDaily,
  completeAllDaily,
  resetAllDaily,
} from "@/server/actions/tracker";
import {
  addDays,
  formatDateDisplay,
  getTodayMakassar,
} from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  Search,
  CheckCheck,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";
import { DatePicker } from "@/components/ui/date-picker";

interface TrackerViewProps {
  initialData: TrackerData;
}

type SortOption =
  | "name-asc"
  | "name-desc"
  | "least-progress"
  | "most-progress"
  | "group";

type CompletionFilter = "all" | "completed" | "in-progress" | "not-started";

export function TrackerView({ initialData }: TrackerViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const currentDate = initialData.dateStr;
  const todayDate = getTodayMakassar();
  const isViewingToday = currentDate === todayDate;

  // Local interactive accounts state for instant optimistic UI
  const [accounts, setAccounts] = useState<TrackerAccountRow[]>(
    initialData.accounts
  );

  React.useEffect(() => {
    setAccounts(initialData.accounts);
  }, [initialData]);

  // Filter & Search State
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("Active");
  const [completionFilter, setCompletionFilter] =
    useState<CompletionFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");

  // Reset confirmation dialog
  const [confirmResetAllOpen, setConfirmResetAllOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Date Navigation
  const handleDateChange = (newDate: string) => {
    startTransition(() => {
      router.push(`/tracker?date=${newDate}`);
    });
  };

  // Instant Optimistic Checkbox Toggle Handler
  const handleToggle = async (
    accountId: string,
    activityId: string,
    nextCompleted: boolean
  ) => {
    // 1. Instant local optimistic update
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (acc.id !== accountId) return acc;

        const currentSet = new Set(acc.completedActivityIds);
        if (nextCompleted) {
          currentSet.add(activityId);
        } else {
          currentSet.delete(activityId);
        }

        const nextCompletedIds = acc.assignedActivityIds.filter((id) =>
          currentSet.has(id)
        );
        const totalAssigned = acc.assignedActivityIds.length;
        const completedCount = nextCompletedIds.length;
        const progressPercent =
          totalAssigned > 0
            ? Math.round((completedCount / totalAssigned) * 100)
            : 0;

        return {
          ...acc,
          completedActivityIds: nextCompletedIds,
          completedCount,
          progressPercent,
        };
      })
    );

    // 2. Non-blocking server mutation with rollback on failure
    try {
      const res = await toggleActivityLog(
        accountId,
        activityId,
        currentDate,
        nextCompleted
      );
      if (!res.success) {
        throw new Error(res.error || "Failed to update activity");
      }
    } catch (err: any) {
      // Rollback on server error
      setAccounts((prevAccounts) =>
        prevAccounts.map((acc) => {
          if (acc.id !== accountId) return acc;

          const currentSet = new Set(acc.completedActivityIds);
          if (!nextCompleted) {
            currentSet.add(activityId);
          } else {
            currentSet.delete(activityId);
          }

          const rolledBackIds = acc.assignedActivityIds.filter((id) =>
            currentSet.has(id)
          );
          const totalAssigned = acc.assignedActivityIds.length;
          const completedCount = rolledBackIds.length;
          const progressPercent =
            totalAssigned > 0
              ? Math.round((completedCount / totalAssigned) * 100)
              : 0;

          return {
            ...acc,
            completedActivityIds: rolledBackIds,
            completedCount,
            progressPercent,
          };
        })
      );
      toast.error(err.message || "Failed to update checkbox. Rolled back.");
    }
  };

  // Complete All tasks for one account
  const handleCompleteAccount = async (account: TrackerAccountRow) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== account.id) return acc;
        return {
          ...acc,
          completedActivityIds: [...acc.assignedActivityIds],
          completedCount: acc.assignedActivityIds.length,
          progressPercent: 100,
        };
      })
    );

    try {
      await completeAccountDaily(account.id, currentDate);
    } catch {
      toast.error("Failed to complete account tasks");
    }
  };

  // Reset all tasks for one account
  const handleResetAccount = async (account: TrackerAccountRow) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== account.id) return acc;
        return {
          ...acc,
          completedActivityIds: [],
          completedCount: 0,
          progressPercent: 0,
        };
      })
    );

    try {
      await resetAccountDaily(account.id, currentDate);
    } catch {
      toast.error("Failed to reset account tasks");
    }
  };

  // Complete All active accounts for the day
  const handleCompleteAll = async () => {
    setActionLoading(true);
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.status !== "Active") return acc;
        return {
          ...acc,
          completedActivityIds: [...acc.assignedActivityIds],
          completedCount: acc.assignedActivityIds.length,
          progressPercent: 100,
        };
      })
    );

    try {
      await completeAllDaily(currentDate);
      toast.success("All active accounts marked completed.");
    } catch {
      toast.error("Failed to complete all tasks");
    } finally {
      setActionLoading(false);
    }
  };

  // Reset All active accounts for the day
  const handleResetAll = async () => {
    setActionLoading(true);
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.status !== "Active") return acc;
        return {
          ...acc,
          completedActivityIds: [],
          completedCount: 0,
          progressPercent: 0,
        };
      })
    );

    try {
      await resetAllDaily(currentDate);
      setConfirmResetAllOpen(false);
      toast.success("All daily progress reset.");
    } catch {
      toast.error("Failed to reset all progress");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered & Sorted accounts list
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      // 1. Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNick = acc.nickname.toLowerCase().includes(q);
        const matchUser = acc.username.toLowerCase().includes(q);
        const matchJob = acc.job.toLowerCase().includes(q);
        const matchServer = acc.server.toLowerCase().includes(q);
        if (!matchNick && !matchUser && !matchJob && !matchServer) return false;
      }

      // 2. Group filter
      if (selectedGroup !== "all") {
        if (selectedGroup === "ungrouped" && acc.groupId !== null) return false;
        if (selectedGroup !== "ungrouped" && acc.groupId !== selectedGroup)
          return false;
      }

      // 3. Status filter
      if (selectedStatus !== "all" && acc.status !== selectedStatus) {
        return false;
      }

      // 4. Completion filter
      if (completionFilter === "completed") {
        if (acc.totalAssigned === 0 || acc.completedCount < acc.totalAssigned)
          return false;
      } else if (completionFilter === "in-progress") {
        if (
          acc.completedCount === 0 ||
          acc.completedCount >= acc.totalAssigned
        )
          return false;
      } else if (completionFilter === "not-started") {
        if (acc.totalAssigned > 0 && acc.completedCount > 0) return false;
      }

      return true;
    });
  }, [accounts, search, selectedGroup, selectedStatus, completionFilter]);

  const sortedAccounts = useMemo(() => {
    const list = [...filteredAccounts];
    switch (sortBy) {
      case "name-asc":
        return list.sort((a, b) => a.nickname.localeCompare(b.nickname));
      case "name-desc":
        return list.sort((a, b) => b.nickname.localeCompare(a.nickname));
      case "least-progress":
        return list.sort((a, b) => {
          if (a.progressPercent !== b.progressPercent) {
            return a.progressPercent - b.progressPercent;
          }
          return a.nickname.localeCompare(b.nickname);
        });
      case "most-progress":
        return list.sort((a, b) => {
          if (a.progressPercent !== b.progressPercent) {
            return b.progressPercent - a.progressPercent;
          }
          return a.nickname.localeCompare(b.nickname);
        });
      case "group":
        return list.sort((a, b) =>
          (a.groupName || "").localeCompare(b.groupName || "")
        );
      default:
        return list;
    }
  }, [filteredAccounts, sortBy]);

  // Reset page when filters or sort change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedGroup, selectedStatus, completionFilter, sortBy]);

  const paginatedAccounts = useMemo(() => {
    return sortedAccounts.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [sortedAccounts, currentPage, pageSize]);

  // Live Metrics
  const activeList = accounts.filter((a) => a.status === "Active");
  const totalActive = activeList.length;
  const completedAccountsCount = activeList.filter(
    (a) => a.totalAssigned > 0 && a.completedCount === a.totalAssigned
  ).length;

  return (
    <div className="space-y-4 w-full">
      {/* Header & Date Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#dfd5c5]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#3B6EA8] rounded-none shadow-[0.5px_0.5px_0px_#1e3b60]" />
          <h1 className="text-xl font-bold tracking-tight text-[#231b12]">Tracker</h1>
        </div>

        {/* Date Controller: ‹ Today ›  Oct 5, 2026 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-[#cfc3b0] rounded-xs p-0.5 shadow-[1px_1px_0px_#e5ddd0]">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[#736350] hover:text-[#231b12]"
              onClick={() => handleDateChange(addDays(currentDate, -1))}
              disabled={isPending}
              aria-label="Previous day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant={isViewingToday ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs px-2.5 font-bold font-pixel text-[#3d3326]"
              onClick={() => handleDateChange(todayDate)}
              disabled={isPending || isViewingToday}
            >
              TODAY
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[#736350] hover:text-[#231b12]"
              onClick={() => handleDateChange(addDays(currentDate, 1))}
              disabled={isPending}
              aria-label="Next day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <DatePicker
            value={currentDate}
            onChange={handleDateChange}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Filter & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-[#FCFAF7] border-2 border-[#cfbeaa] rounded-xs shadow-[2px_2px_0px_#dfd5c5]">
        {/* Left: Search & Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-full sm:w-44">
            <Search className="w-3.5 h-3.5 text-[#8a7b68] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-[#cfc3b0] rounded-xs text-[#2c261e] focus:outline-none focus:border-[#3B6EA8] shadow-[1px_1px_0px_#e5ddd0]"
            />
          </div>

          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="h-8 px-2.5 text-xs bg-white border border-[#cfc3b0] rounded-xs text-[#3d3326] focus:outline-none cursor-pointer shadow-[1px_1px_0px_#e5ddd0]"
          >
            <option value="all">All Groups</option>
            {initialData.groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
            <option value="ungrouped">Ungrouped</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 px-2.5 text-xs bg-white border border-[#cfc3b0] rounded-xs text-[#3d3326] focus:outline-none cursor-pointer shadow-[1px_1px_0px_#e5ddd0]"
          >
            <option value="Active">Active</option>
            <option value="all">All Status</option>
            <option value="Paused">Paused</option>
            <option value="Finished">Finished</option>
          </select>

          {/* Progress Filter */}
          <select
            value={completionFilter}
            onChange={(e) => setCompletionFilter(e.target.value as CompletionFilter)}
            className="h-8 px-2.5 text-xs bg-white border border-[#cfc3b0] rounded-xs text-[#3d3326] focus:outline-none cursor-pointer shadow-[1px_1px_0px_#e5ddd0]"
          >
            <option value="all">All Progress</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="not-started">Not Started</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-8 px-2.5 text-xs bg-white border border-[#cfc3b0] rounded-xs text-[#3d3326] focus:outline-none cursor-pointer shadow-[1px_1px_0px_#e5ddd0]"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="least-progress">Least Progress</option>
            <option value="most-progress">Most Progress</option>
            <option value="group">Group</option>
          </select>
        </div>

        {/* Right: Counter & Actions */}
        <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#ebd7b2]">
          <span className="text-xs font-semibold text-[#736350] shrink-0 font-pixel">
            {totalActive} ACCOUNTS · {completedAccountsCount} DONE
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCompleteAll}
              disabled={actionLoading}
              className="h-8 text-xs font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1 text-[#1E5D2F]" /> Complete All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmResetAllOpen(true)}
              disabled={actionLoading}
              className="h-8 text-xs font-medium text-[#8a7b68] hover:text-[#A82A1E] hover:bg-[#FDECEB]"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset All
            </Button>
          </div>
        </div>
      </div>

      {/* DESKTOP & TABLET MATRIX TABLE (hidden on mobile) */}
      <div className="hidden md:block bg-white border-2 border-[#cfbeaa] rounded-xs overflow-hidden shadow-[3px_3px_0px_#baa892]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F4EFE6] border-b border-[#ded4c4]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px] font-bold text-xs text-[#5a4c3a] font-pixel tracking-wider">
                  ACCOUNT
                </TableHead>
                {initialData.activities.map((act) => {
                  const isWeekly = act.activityType === "WEEKLY";
                  return (
                    <TableHead
                      key={act.id}
                      className="text-center font-bold text-xs text-[#5a4c3a] min-w-[76px] py-2 font-pixel tracking-wide"
                      title={
                        isWeekly
                          ? `${act.name} (Weekly Task — Reset every Monday)`
                          : `${act.name} (Daily Task)`
                      }
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span>{act.code || act.name}</span>
                        {isWeekly && (
                          <span className="text-[9px] font-bold tracking-wider uppercase text-[#664b28] bg-[#FAF2E1] border border-[#cfbeaa] px-1 py-0.5 rounded-none leading-none mt-0.5 shadow-[0.5px_0.5px_0px_#baa892]">
                            WEEKLY
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
                <TableHead className="text-right w-[110px] font-bold text-xs text-[#5a4c3a] font-pixel tracking-wider">
                  PROGRESS
                </TableHead>
                <TableHead className="w-[50px] text-right pr-4 font-bold text-xs text-[#5a4c3a] font-pixel tracking-wider">
                  ACTION
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[#eee7dc]">
              {sortedAccounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={initialData.activities.length + 3}
                    className="text-center py-12 text-xs text-[#8a7b68]"
                  >
                    No accounts found matching current filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAccounts.map((acc) => {
                  const isFinished =
                    acc.totalAssigned > 0 &&
                    acc.completedCount === acc.totalAssigned;

                  return (
                    <TableRow
                      key={acc.id}
                      className={cn(
                        "hover:bg-[#FAF6F0] transition-colors",
                        isFinished && "bg-[#F2FAF4]/70"
                      )}
                    >
                      {/* Account Column */}
                      <TableCell className="py-3 font-medium">
                        <div className="min-w-0">
                          <Link
                            href={`/accounts/${acc.id}`}
                            className="text-xs font-bold text-[#231b12] hover:text-[#3B6EA8] truncate block"
                          >
                            {acc.nickname}
                          </Link>
                          <p className="text-[10px] text-[#8a7b68] truncate leading-tight mt-0.5">
                            {acc.job} {acc.groupName ? `· ${acc.groupName}` : ""}
                          </p>
                        </div>
                      </TableCell>

                      {/* Activity Checkboxes */}
                      {initialData.activities.map((act) => {
                        const isAssigned = acc.assignedActivityIds.includes(act.id);
                        const isCompleted = acc.completedActivityIds.includes(act.id);

                        if (!isAssigned) {
                          return (
                            <TableCell key={act.id} className="text-center py-3">
                              <span className="text-slate-200 font-mono text-xs">-</span>
                            </TableCell>
                          );
                        }

                        return (
                          <TableCell key={act.id} className="text-center py-3">
                            <div className="flex items-center justify-center">
                              <Checkbox
                                checked={isCompleted}
                                onCheckedChange={(checked) =>
                                  handleToggle(acc.id, act.id, Boolean(checked))
                                }
                                aria-label={`Toggle ${act.name} for ${acc.nickname}`}
                              />
                            </div>
                          </TableCell>
                        );
                      })}

                      {/* Progress Column */}
                      <TableCell className="text-right py-3">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-bold text-[#231b12] font-mono">
                            {acc.completedCount} / {acc.totalAssigned}
                          </span>
                          <div className="w-16">
                            <Progress
                              value={acc.progressPercent}
                              className="h-1.5 bg-[#f0eae1]"
                              indicatorColor={acc.progressPercent === 100 ? "bg-[#347A46]" : "bg-[#3B6EA8]"}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Row Action Dropdown */}
                      <TableCell className="text-right py-3 pr-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-[#8a7b68] hover:text-[#231b12]">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 text-xs rounded-xs border-2 border-[#cfbeaa] bg-[#FCFAF7] shadow-[3px_3px_0px_#baa892]">
                            <DropdownMenuItem
                              onClick={() => handleCompleteAccount(acc)}
                              className="cursor-pointer text-[#1E5D2F] hover:bg-[#F2FAF4]"
                            >
                              <Check className="w-3.5 h-3.5 mr-2 text-[#1E5D2F]" />
                              <span>Complete All</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResetAccount(acc)}
                              className="cursor-pointer text-[#8C580B] hover:bg-[#FFF8EB]"
                            >
                              <RotateCcw className="w-3.5 h-3.5 mr-2 text-[#8C580B]" />
                              <span>Reset Today</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/accounts/${acc.id}`} className="cursor-pointer text-[#2c261e] hover:bg-[#F3ECE0]">
                                <ExternalLink className="w-3.5 h-3.5 mr-2 text-[#736350]" />
                                <span>View Account</span>
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={sortedAccounts.length}
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

      {/* MOBILE ACCOUNT-ORIENTED CARD LIST (shown only on mobile < md) */}
      <div className="md:hidden space-y-3">
        {sortedAccounts.length === 0 ? (
          <div className="p-8 bg-white border border-[#ded5c5] rounded-xs text-center text-xs text-[#8a7b68]">
            No accounts found matching filters.
          </div>
        ) : (
          paginatedAccounts.map((acc) => {
            const isFinished =
              acc.totalAssigned > 0 &&
              acc.completedCount === acc.totalAssigned;

            return (
              <div
                key={acc.id}
                className={cn(
                  "bg-white border-2 border-[#cfbeaa] rounded-xs p-4 shadow-[2px_2px_0px_#dfd5c5] space-y-3",
                  isFinished && "bg-[#F2FAF4]/80 border-[#a3ddb4]"
                )}
              >
                {/* Account Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/accounts/${acc.id}`}
                      className="text-xs font-bold text-[#231b12] hover:text-[#3B6EA8]"
                    >
                      {acc.nickname}
                    </Link>
                    <p className="text-[11px] text-[#8a7b68] mt-0.5">
                      {acc.job} {acc.groupName ? `· ${acc.groupName}` : ""}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-[#231b12] font-mono">
                      {acc.completedCount} / {acc.totalAssigned}
                    </span>
                    <div className="w-16 mt-1">
                      <Progress
                        value={acc.progressPercent}
                        className="h-1.5 bg-[#f0eae1]"
                        indicatorColor={acc.progressPercent === 100 ? "bg-[#347A46]" : "bg-[#3B6EA8]"}
                      />
                    </div>
                  </div>
                </div>

                {/* Vertical Activities Checklist */}
                <div className="pt-2 border-t border-[#eee7dc] space-y-2">
                  {initialData.activities.map((act) => {
                    const isAssigned = acc.assignedActivityIds.includes(act.id);
                    if (!isAssigned) return null;

                    const isCompleted = acc.completedActivityIds.includes(act.id);

                    return (
                      <div
                        key={act.id}
                        onClick={() => handleToggle(acc.id, act.id, !isCompleted)}
                        className={`flex items-center justify-between p-2 rounded-xs text-xs cursor-pointer select-none transition-colors ${
                          isCompleted
                            ? "bg-[#F3ECE0] text-[#231b12] font-medium"
                            : "text-[#5c4e3b] hover:bg-[#FAF6F0]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={(checked) => {
                              handleToggle(acc.id, act.id, Boolean(checked));
                            }}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Toggle ${act.name}`}
                          />
                          <span>{act.name}</span>
                          {act.activityType === "WEEKLY" && (
                            <span className="text-[9px] font-bold uppercase text-[#664b28] bg-[#FAF2E1] border border-[#cfbeaa] px-1 py-0.2 rounded-none font-pixel">
                              Weekly
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-[#8a7b68] uppercase">
                          {act.code}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {sortedAccounts.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-slate-200/80 shadow-2xs">
            <Pagination
              currentPage={currentPage}
              totalItems={sortedAccounts.length}
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

      {/* Reset All Confirmation Dialog */}
      <AlertDialog open={confirmResetAllOpen} onOpenChange={setConfirmResetAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Reset all daily progress?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              This will uncheck all completed activities across all active accounts for {formatDateDisplay(currentDate)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetAll}
              className="bg-rose-600 text-white hover:bg-rose-700 text-xs"
            >
              Reset All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
