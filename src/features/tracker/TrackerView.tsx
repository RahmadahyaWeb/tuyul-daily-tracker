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
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
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
  RotateCcw,
  Check,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Filters & Sorting state
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("Active");
  const [completionFilter, setCompletionFilter] =
    useState<CompletionFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "reset-account" | "reset-all";
    accountId?: string;
    accountName?: string;
  }>({
    isOpen: false,
    type: "reset-account",
  });

  const [dialogLoading, setDialogLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    currentCompleted: boolean
  ) => {
    const nextCompleted = !currentCompleted;

    // 1. Instant local state update
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (acc.id !== accountId) return acc;

        const nextCompletedIds = nextCompleted
          ? [...acc.completedActivityIds, activityId]
          : acc.completedActivityIds.filter((id) => id !== activityId);

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

    // 2. Non-blocking background server update
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
    } catch {
      setErrorMessage("Failed to update status. Reverting...");
      setTimeout(() => setErrorMessage(null), 3000);
      setAccounts(initialData.accounts);
    }
  };

  // Complete single account
  const handleCompleteAccount = async (accountId: string) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== accountId) return acc;
        return {
          ...acc,
          completedActivityIds: [...acc.assignedActivityIds],
          completedCount: acc.assignedActivityIds.length,
          progressPercent: 100,
        };
      })
    );

    try {
      const res = await completeAccountDaily(accountId, currentDate);
      if (!res.success) throw new Error(res.error);
    } catch {
      setErrorMessage("Failed to complete account.");
      setTimeout(() => setErrorMessage(null), 3000);
      setAccounts(initialData.accounts);
    }
  };

  // Reset single account
  const handleConfirmResetAccount = async () => {
    const accountId = confirmDialog.accountId;
    if (!accountId) return;

    setDialogLoading(true);
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== accountId) return acc;
        return {
          ...acc,
          completedActivityIds: [],
          completedCount: 0,
          progressPercent: 0,
        };
      })
    );

    try {
      const res = await resetAccountDaily(accountId, currentDate);
      if (!res.success) throw new Error(res.error);
    } catch {
      setErrorMessage("Failed to reset account.");
      setTimeout(() => setErrorMessage(null), 3000);
      setAccounts(initialData.accounts);
    } finally {
      setDialogLoading(false);
      setConfirmDialog({ isOpen: false, type: "reset-account" });
    }
  };

  // Quick Complete All
  const handleCompleteAll = async () => {
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
      const res = await completeAllDaily(currentDate);
      if (!res.success) throw new Error(res.error);
    } catch {
      setErrorMessage("Failed to complete all.");
      setTimeout(() => setErrorMessage(null), 3000);
      setAccounts(initialData.accounts);
    }
  };

  // Quick Reset All
  const handleConfirmResetAll = async () => {
    setDialogLoading(true);
    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        completedActivityIds: [],
        completedCount: 0,
        progressPercent: 0,
      }))
    );

    try {
      const res = await resetAllDaily(currentDate);
      if (!res.success) throw new Error(res.error);
    } catch {
      setErrorMessage("Failed to reset all.");
      setTimeout(() => setErrorMessage(null), 3000);
      setAccounts(initialData.accounts);
    } finally {
      setDialogLoading(false);
      setConfirmDialog({ isOpen: false, type: "reset-all" });
    }
  };

  // Filter and Sort Processing
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesNickname = acc.nickname.toLowerCase().includes(query);
        const matchesUsername = acc.username.toLowerCase().includes(query);
        const matchesOwner = acc.owner.toLowerCase().includes(query);
        if (!matchesNickname && !matchesUsername && !matchesOwner) return false;
      }

      if (selectedGroup !== "all" && acc.groupId !== selectedGroup) {
        return false;
      }

      if (selectedStatus !== "all" && acc.status !== selectedStatus) {
        return false;
      }

      if (completionFilter === "completed" && acc.progressPercent < 100)
        return false;
      if (
        completionFilter === "in-progress" &&
        (acc.progressPercent === 0 || acc.progressPercent === 100)
      )
        return false;
      if (completionFilter === "not-started" && acc.progressPercent > 0)
        return false;

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

  // Dynamic live stats
  const activeList = accounts.filter((a) => a.status === "Active");
  const totalActive = activeList.length;
  const completedCountAcc = activeList.filter(
    (a) => a.totalAssigned > 0 && a.completedCount === a.totalAssigned
  ).length;

  let totalTasks = 0;
  let completedTasks = 0;
  for (const acc of activeList) {
    totalTasks += acc.totalAssigned;
    completedTasks += acc.completedCount;
  }
  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between shadow-2xs">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 hover:opacity-80 font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Header & Date Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Daily Checklist Tracker
            </h1>
            {isViewingToday ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Today
              </span>
            ) : (
              <Badge variant="outline" className="text-[10px] py-0 px-2 text-slate-500 font-normal">
                {formatDateDisplay(currentDate)}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Check off daily tasks across all characters with instant non-blocking synchronization
          </p>
        </div>

        {/* Date Navigation Segment */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200/80 shadow-2xs">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-600 hover:text-slate-900"
            onClick={() => handleDateChange(addDays(currentDate, -1))}
            disabled={isPending}
            title="Previous Day"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant={isViewingToday ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-7 text-xs px-2.5 font-medium",
              isViewingToday ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600"
            )}
            onClick={() => handleDateChange(todayDate)}
            disabled={isPending || isViewingToday}
          >
            Today
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-600 hover:text-slate-900"
            onClick={() => handleDateChange(addDays(currentDate, 1))}
            disabled={isPending}
            title="Next Day"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          <input
            type="date"
            value={currentDate}
            onChange={(e) => {
              if (e.target.value) handleDateChange(e.target.value);
            }}
            disabled={isPending}
            className="h-7 rounded-md border border-slate-200 bg-transparent px-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Progress Strip Banner */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-slate-900">{totalActive}</span> Active Accounts
            </div>
          </div>

          <span className="text-slate-300">|</span>

          <div>
            <span className="font-bold text-emerald-600">{completedCountAcc}</span> / {totalActive} Finished
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          <div className="hidden sm:block">
            <span className="font-bold text-slate-900">{completedTasks}</span> / {totalTasks} Tasks
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-60">
          <Progress value={overallPercent} className="h-2 flex-1" />
          <span className="text-xs font-bold text-slate-900 min-w-[36px] text-right">
            {overallPercent}%
          </span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search account, owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-2xs"
            />
          </div>

          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
          >
            <option value="all">All Groups</option>
            {initialData.groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
          >
            <option value="Active">Active Only</option>
            <option value="Paused">Paused</option>
            <option value="Finished">Finished</option>
            <option value="all">All Statuses</option>
          </select>

          {/* Progress Filter */}
          <select
            value={completionFilter}
            onChange={(e) => setCompletionFilter(e.target.value as CompletionFilter)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
          >
            <option value="all">All Progress</option>
            <option value="not-started">Not Started (0%)</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed (100%)</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs font-medium"
          >
            <option value="name-asc">Sort: Nickname A-Z</option>
            <option value="name-desc">Sort: Nickname Z-A</option>
            <option value="least-progress">Sort: Least Progress</option>
            <option value="most-progress">Sort: Most Progress</option>
            <option value="group">Sort: Group</option>
          </select>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCompleteAll}
            className="h-8 text-xs font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 border-emerald-200/80 shadow-2xs gap-1"
            title="Complete all active accounts for today"
          >
            <Check className="w-3.5 h-3.5" />
            Complete All
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmDialog({ isOpen: true, type: "reset-all" })}
            className="h-8 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200 shadow-2xs gap-1"
            title="Reset all accounts for today"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All
          </Button>
        </div>
      </div>

      {/* Main Checklist Matrix Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200/70">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[240px] min-w-[200px] text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 pl-4">
                  Account Details
                </TableHead>

                {initialData.activities.map((act) => (
                  <TableHead
                    key={act.id}
                    className="text-center text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 px-2 min-w-[85px]"
                  >
                    <span title={act.name} className="cursor-help">
                      {act.code}
                    </span>
                  </TableHead>
                ))}

                <TableHead className="w-[140px] text-center text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 px-3">
                  Progress
                </TableHead>

                <TableHead className="w-[90px] text-right text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 pr-4">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {sortedAccounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={initialData.activities.length + 3}
                    className="h-40 text-center text-xs text-slate-400 py-8"
                  >
                    No accounts found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                sortedAccounts.map((acc) => {
                  const assignedSet = new Set(acc.assignedActivityIds);
                  const completedSet = new Set(acc.completedActivityIds);
                  const isFinished = acc.totalAssigned > 0 && acc.completedCount === acc.totalAssigned;

                  return (
                    <TableRow
                      key={acc.id}
                      className={cn(
                        "transition-colors hover:bg-slate-50/60",
                        isFinished && "bg-emerald-50/15"
                      )}
                    >
                      {/* Account Info Cell */}
                      <TableCell className="py-3 pl-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={acc.nickname} size="md" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/accounts/${acc.id}`}
                                className="font-semibold text-xs text-slate-900 hover:text-indigo-600 hover:underline truncate"
                              >
                                {acc.nickname}
                              </Link>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Lv.{acc.level}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate mt-0.5">
                              <span>{acc.job}</span>
                              <span>·</span>
                              <span>{acc.server}</span>
                              {acc.groupName && (
                                <>
                                  <span>·</span>
                                  <span className="text-slate-500 font-medium">{acc.groupName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Interactive Activity Checkbox Cells */}
                      {initialData.activities.map((act) => {
                        const isAssigned = assignedSet.has(act.id);
                        const isCompleted = completedSet.has(act.id);

                        return (
                          <TableCell
                            key={act.id}
                            className="text-center p-2 align-middle"
                          >
                            {isAssigned ? (
                              <button
                                type="button"
                                onClick={() => handleToggle(acc.id, act.id, isCompleted)}
                                className={cn(
                                  "w-5 h-5 rounded-md border inline-flex items-center justify-center transition-all cursor-pointer select-none",
                                  "checkbox-interactive",
                                  isCompleted
                                    ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                    : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
                                )}
                                title={`${act.name}: ${isCompleted ? "Completed" : "Incomplete"}`}
                              >
                                {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                              </button>
                            ) : (
                              <span className="text-slate-200 select-none text-xs">—</span>
                            )}
                          </TableCell>
                        );
                      })}

                      {/* Progress Cell */}
                      <TableCell className="py-3 px-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-slate-500">
                              {acc.completedCount}/{acc.totalAssigned}
                            </span>
                            <span
                              className={cn(
                                "font-bold text-[11px]",
                                isFinished
                                  ? "text-emerald-600"
                                  : acc.completedCount > 0
                                  ? "text-indigo-600"
                                  : "text-slate-400"
                              )}
                            >
                              {acc.progressPercent}%
                            </span>
                          </div>
                          <Progress
                            value={acc.progressPercent}
                            className={cn(
                              "h-1.5",
                              isFinished && "[&>div]:bg-emerald-500"
                            )}
                          />
                        </div>
                      </TableCell>

                      {/* Actions Cell */}
                      <TableCell className="py-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleCompleteAccount(acc.id)}
                            title="Complete this account"
                            className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDialog({
                                isOpen: true,
                                type: "reset-account",
                                accountId: acc.id,
                                accountName: acc.nickname,
                              })
                            }
                            title="Reset this account"
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            href={`/accounts/${acc.id}`}
                            title="View Account Details"
                            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={
          confirmDialog.type === "reset-account"
            ? `Reset "${confirmDialog.accountName}"?`
            : "Reset All Accounts?"
        }
        description={
          confirmDialog.type === "reset-account"
            ? "This will uncheck all completed activities for this account today."
            : "This will uncheck all completed activities for all accounts today."
        }
        confirmLabel="Reset"
        confirmVariant="destructive"
        isLoading={dialogLoading}
        onConfirm={
          confirmDialog.type === "reset-account"
            ? handleConfirmResetAccount
            : handleConfirmResetAll
        }
        onCancel={() =>
          setConfirmDialog({ isOpen: false, type: "reset-account" })
        }
      />
    </div>
  );
}
