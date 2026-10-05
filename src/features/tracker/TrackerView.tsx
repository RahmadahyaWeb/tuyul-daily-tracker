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
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Check,
  RotateCcw,
  CheckCheck,
  Search,
  SlidersHorizontal,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackerViewProps {
  initialData: TrackerData;
}

type SortOption =
  | "default"
  | "name-asc"
  | "name-desc"
  | "least-progress"
  | "most-progress"
  | "group";

type CompletionFilter = "all" | "completed" | "in-progress" | "not-started";

export function TrackerView({ initialData }: TrackerViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local date state
  const currentDate = initialData.dateStr;
  const todayDate = getTodayMakassar();
  const isViewingToday = currentDate === todayDate;

  // Local interactive accounts state for instant optimistic UI
  const [accounts, setAccounts] = useState<TrackerAccountRow[]>(
    initialData.accounts
  );

  // Sync state when initialData changes (e.g. on date change)
  React.useEffect(() => {
    setAccounts(initialData.accounts);
  }, [initialData]);

  // Filters & Sorting state
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("Active");
  const [completionFilter, setCompletionFilter] =
    useState<CompletionFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("least-progress");

  // Track pending activity IDs for subtle inline loaders
  const [pendingChecks, setPendingChecks] = useState<Record<string, boolean>>({});

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

  // Date Navigation Handlers
  const handleDateChange = (newDate: string) => {
    startTransition(() => {
      router.push(`/tracker?date=${newDate}`);
    });
  };

  // Optimistic Checkbox Toggle Handler
  const handleToggle = async (
    accountId: string,
    activityId: string,
    currentCompleted: boolean
  ) => {
    const nextCompleted = !currentCompleted;
    const checkKey = `${accountId}-${activityId}`;

    // 1. Optimistic update
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

    // 2. Background server action
    setPendingChecks((prev) => ({ ...prev, [checkKey]: true }));
    try {
      const res = await toggleActivityLog(
        accountId,
        activityId,
        currentDate,
        nextCompleted
      );
      if (!res.success) {
        throw new Error(res.error || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to update activity. Changes rolled back.");
      setTimeout(() => setErrorMessage(null), 4000);
      // Rollback
      setAccounts(initialData.accounts);
    } finally {
      setPendingChecks((prev) => {
        const next = { ...prev };
        delete next[checkKey];
        return next;
      });
    }
  };

  // Quick Complete Account
  const handleCompleteAccount = async (accountId: string) => {
    // Optimistic
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
      setTimeout(() => setErrorMessage(null), 4000);
      setAccounts(initialData.accounts);
    }
  };

  // Quick Reset Account
  const handleConfirmResetAccount = async () => {
    if (!confirmDialog.accountId) return;
    setDialogLoading(true);
    const accountId = confirmDialog.accountId;

    // Optimistic
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
      setTimeout(() => setErrorMessage(null), 4000);
      setAccounts(initialData.accounts);
    } finally {
      setDialogLoading(false);
      setConfirmDialog({ isOpen: false, type: "reset-account" });
    }
  };

  // Quick Complete All
  const handleCompleteAll = async () => {
    // Optimistic
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
      setTimeout(() => setErrorMessage(null), 4000);
      setAccounts(initialData.accounts);
    }
  };

  // Quick Reset All
  const handleConfirmResetAll = async () => {
    setDialogLoading(true);
    // Optimistic
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
      setTimeout(() => setErrorMessage(null), 4000);
      setAccounts(initialData.accounts);
    } finally {
      setDialogLoading(false);
      setConfirmDialog({ isOpen: false, type: "reset-all" });
    }
  };

  // Filter and Sort Processing
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesNickname = acc.nickname.toLowerCase().includes(query);
        const matchesUsername = acc.username.toLowerCase().includes(query);
        const matchesOwner = acc.owner.toLowerCase().includes(query);
        if (!matchesNickname && !matchesUsername && !matchesOwner) return false;
      }

      // Group
      if (selectedGroup !== "all" && acc.groupId !== selectedGroup) {
        return false;
      }

      // Status
      if (selectedStatus !== "all" && acc.status !== selectedStatus) {
        return false;
      }

      // Completion Status
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

  // Recalculate summary metrics based on current interactive state
  const activeList = accounts.filter((a) => a.status === "Active");
  const totalTasks = activeList.reduce((acc, a) => acc + a.totalAssigned, 0);
  const completedTasks = activeList.reduce(
    (acc, a) => acc + a.completedCount,
    0
  );
  const overallPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const completedCountAcc = activeList.filter(
    (a) => a.totalAssigned > 0 && a.completedCount === a.totalAssigned
  ).length;

  return (
    <div className="space-y-4">
      {/* Error Alert if any */}
      {errorMessage && (
        <div className="p-3 rounded-md bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Date Navigation & Top Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-0.5 shadow-xs">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => handleDateChange(addDays(currentDate, -1))}
              disabled={isPending}
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant={isViewingToday ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-8 px-3 text-xs font-semibold",
                isViewingToday && "bg-zinc-800 text-blue-400 border border-blue-500/20"
              )}
              onClick={() => handleDateChange(todayDate)}
              disabled={isPending || isViewingToday}
            >
              Today
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => handleDateChange(addDays(currentDate, 1))}
              disabled={isPending}
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Date Picker Input */}
          <div className="relative flex items-center">
            <input
              type="date"
              value={currentDate}
              onChange={(e) => {
                if (e.target.value) handleDateChange(e.target.value);
              }}
              disabled={isPending}
              className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono h-9"
            />
          </div>

          <div className="hidden sm:flex items-center text-xs text-zinc-300 font-medium pl-1">
            <span>{formatDateDisplay(currentDate)}</span>
          </div>
        </div>

        {/* Quick Batch Actions & Progress summary */}
        <div className="flex items-center gap-2.5">
          {/* Quick Stats Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-900/80 border border-zinc-800 rounded-md text-xs">
            <span className="text-zinc-400">Progress:</span>
            <span className="font-mono font-bold text-emerald-400">
              {completedCountAcc}/{activeList.length} Akun
            </span>
            <span className="text-zinc-400 font-mono">({overallPercent}%)</span>
          </div>

          {/* Complete All */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCompleteAll}
            disabled={isPending || sortedAccounts.length === 0}
            className="text-xs gap-1.5 hover:text-emerald-400"
            title="Selesaikan seluruh checklist untuk hari ini"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Complete All</span>
          </Button>

          {/* Reset All */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setConfirmDialog({
                isOpen: true,
                type: "reset-all",
              })
            }
            disabled={isPending || sortedAccounts.length === 0}
            className="text-xs gap-1.5 hover:text-red-400"
            title="Reset seluruh checklist untuk hari ini"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400" />
            <span>Reset All</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Single Toolbar */}
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-lg p-3 flex flex-wrap items-center gap-2.5 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari nickname, username, owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Group Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400 text-[11px] hidden sm:inline">Group:</span>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Semua Group</option>
            {initialData.groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400 text-[11px] hidden sm:inline">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Finished">Finished</option>
            <option value="all">Semua Status</option>
          </select>
        </div>

        {/* Completion Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400 text-[11px] hidden sm:inline">Checklist:</span>
          <select
            value={completionFilter}
            onChange={(e) => setCompletionFilter(e.target.value as CompletionFilter)}
            className="bg-zinc-950 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Semua Progres</option>
            <option value="not-started">Not Started (0%)</option>
            <option value="in-progress">In Progress (1-99%)</option>
            <option value="completed">Completed (100%)</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-1.5 ml-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 hidden sm:inline" />
          <span className="text-zinc-400 text-[11px] hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-zinc-950 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
          >
            <option value="least-progress">Least Progress (Prioritas)</option>
            <option value="most-progress">Most Progress</option>
            <option value="name-asc">Nickname A-Z</option>
            <option value="name-desc">Nickname Z-A</option>
            <option value="group">Group</option>
            <option value="default">Default</option>
          </select>
        </div>
      </div>

      {/* Main Daily Matrix Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/90 text-zinc-400 text-xs font-semibold sticky top-0 z-20">
                {/* Sticky Account Column */}
                <th className="py-3 px-4 sticky left-0 z-30 bg-zinc-950 min-w-[200px] border-r border-zinc-800/80">
                  Account ({sortedAccounts.length})
                </th>

                {/* Dynamic Master Activities Columns */}
                {initialData.activities.map((act) => (
                  <th
                    key={act.id}
                    className="py-3 px-3 text-center min-w-[100px] border-r border-zinc-800/50"
                  >
                    <div className="truncate font-medium text-zinc-200" title={act.name}>
                      {act.name}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase">
                      {act.code}
                    </span>
                  </th>
                ))}

                {/* Progress Column */}
                <th className="py-3 px-4 text-center min-w-[140px] border-r border-zinc-800/50">
                  Progress
                </th>

                {/* Quick Row Actions */}
                <th className="py-3 px-3 text-center min-w-[120px]">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {sortedAccounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={initialData.activities.length + 3}
                    className="py-12 text-center text-zinc-500"
                  >
                    Tidak ada akun yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                sortedAccounts.map((acc) => {
                  const is100 = acc.progressPercent === 100;
                  const isStarted = acc.completedCount > 0;

                  return (
                    <tr
                      key={acc.id}
                      className={cn(
                        "transition-colors hover:bg-zinc-800/30",
                        is100 && "bg-emerald-950/15"
                      )}
                    >
                      {/* Sticky Account Cell */}
                      <td
                        className={cn(
                          "py-2.5 px-4 sticky left-0 z-10 border-r border-zinc-800/80",
                          is100 ? "bg-zinc-950/95" : "bg-zinc-900/95"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/accounts/${acc.id}`}
                                className="font-semibold text-zinc-100 hover:text-blue-400 truncate flex items-center gap-1 group"
                              >
                                <span>{acc.nickname}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-zinc-500" />
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
                            <div className="text-[11px] text-zinc-400 truncate">
                              {acc.job} • {acc.server} {acc.groupName && `• ${acc.groupName}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Interactive Activity Checkboxes */}
                      {initialData.activities.map((act) => {
                        const isAssigned = acc.assignedActivityIds.includes(act.id);
                        const isCompleted = acc.completedActivityIds.includes(act.id);
                        const isCheckPending = pendingChecks[`${acc.id}-${act.id}`];

                        if (!isAssigned) {
                          return (
                            <td
                              key={act.id}
                              className="py-2.5 px-3 text-center border-r border-zinc-800/40 text-zinc-600 select-none"
                            >
                              <span className="text-zinc-600 font-mono text-sm">—</span>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={act.id}
                            className="py-2.5 px-3 text-center border-r border-zinc-800/40"
                          >
                            <button
                              type="button"
                              onClick={() => handleToggle(acc.id, act.id, isCompleted)}
                              disabled={isCheckPending}
                              title={`${acc.nickname}: ${act.name} (${isCompleted ? "Completed" : "Uncompleted"})`}
                              className={cn(
                                "w-7 h-7 rounded-md inline-flex items-center justify-center transition-all transform active:scale-90 cursor-pointer border",
                                isCompleted
                                  ? "bg-emerald-600/20 border-emerald-500/80 text-emerald-400 hover:bg-emerald-600/30"
                                  : "bg-zinc-800/60 border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:bg-zinc-700/50",
                                isCheckPending && "opacity-50 cursor-wait animate-pulse"
                              )}
                            >
                              {isCompleted ? (
                                <Check className="w-4 h-4 stroke-[3]" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                              )}
                            </button>
                          </td>
                        );
                      })}

                      {/* Progress Cell */}
                      <td className="py-2.5 px-4 text-center border-r border-zinc-800/40">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center justify-between w-full text-[11px] font-mono">
                            <span
                              className={cn(
                                "font-bold",
                                is100
                                  ? "text-emerald-400"
                                  : isStarted
                                  ? "text-amber-400"
                                  : "text-zinc-500"
                              )}
                            >
                              {acc.completedCount}/{acc.totalAssigned}
                            </span>
                            <span className="text-zinc-400">{acc.progressPercent}%</span>
                          </div>
                          <ProgressBar
                            value={acc.progressPercent}
                            size="sm"
                            showLabel={false}
                          />
                        </div>
                      </td>

                      {/* Row Quick Action Buttons */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCompleteAccount(acc.id)}
                            disabled={is100 || acc.totalAssigned === 0}
                            title="Complete Account (Centang Semua)"
                            className="p-1.5 rounded text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
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
                            disabled={acc.completedCount === 0}
                            title="Reset Account (Hapus Seluruh Checklist)"
                            className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog for Reset */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: "reset-account" })}
        onConfirm={
          confirmDialog.type === "reset-all"
            ? handleConfirmResetAll
            : handleConfirmResetAccount
        }
        title={
          confirmDialog.type === "reset-all"
            ? "Reset Seluruh Checklist Hari Ini?"
            : `Reset Checklist ${confirmDialog.accountName}?`
        }
        message={
          confirmDialog.type === "reset-all"
            ? `Apakah Anda yakin ingin menghapus seluruh centang aktivitas untuk SEMUA akun pada tanggal ${formatDateDisplay(
                currentDate
              )}?`
            : `Apakah Anda yakin ingin menghapus checklist untuk akun ${confirmDialog.accountName} pada tanggal ${formatDateDisplay(
                currentDate
              )}?`
        }
        confirmText="Ya, Reset Checklist"
        cancelText="Batal"
        variant="danger"
        isLoading={dialogLoading}
      />
    </div>
  );
}
