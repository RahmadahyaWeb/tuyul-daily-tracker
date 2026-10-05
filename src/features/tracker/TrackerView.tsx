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
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  Search,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackerViewProps {
  initialData: TrackerData;
}

type SortOption =
  | "least-progress"
  | "most-progress"
  | "name-asc"
  | "name-desc"
  | "group"
  | "default";

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
  const [sortBy, setSortBy] = useState<SortOption>("least-progress");

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
        throw new Error(res.error || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to update activity. Changes rolled back.");
      setTimeout(() => setErrorMessage(null), 3000);
      setAccounts(initialData.accounts); // rollback
    }
  };

  // Quick Complete Account
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

  // Quick Reset Account
  const handleConfirmResetAccount = async () => {
    if (!confirmDialog.accountId) return;
    setDialogLoading(true);
    const accountId = confirmDialog.accountId;

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

  // Recalculate summary metrics locally
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
      {/* Error Alert */}
      {errorMessage && (
        <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-800 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Page Header: Title, Date Navigation & Progress Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Title & Date Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Tracker
            </h1>
            <p className="text-xs text-gray-500">
              {formatDateDisplay(currentDate)}
            </p>
          </div>

          <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
            <div className="flex items-center bg-white border border-gray-200 rounded-md p-0.5 shadow-2xs">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-1.5"
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
                  "h-7 px-2.5 text-xs font-medium",
                  isViewingToday && "bg-blue-50 text-blue-700 border border-blue-200"
                )}
                onClick={() => handleDateChange(todayDate)}
                disabled={isPending || isViewingToday}
              >
                Today
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-1.5"
                onClick={() => handleDateChange(addDays(currentDate, 1))}
                disabled={isPending}
                title="Next Day"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <input
              type="date"
              value={currentDate}
              onChange={(e) => {
                if (e.target.value) handleDateChange(e.target.value);
              }}
              disabled={isPending}
              className="bg-white border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 h-8 shadow-2xs cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Progress Metric & Bulk Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Natural Progress Summary */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">
              <span className="font-semibold text-gray-900">
                {completedCountAcc} of {activeList.length}
              </span>{" "}
              accounts completed
            </span>
            <div className="w-20">
              <ProgressBar value={overallPercent} size="sm" />
            </div>
            <span className="font-mono font-medium text-gray-700">
              {overallPercent}%
            </span>
          </div>

          <div className="h-4 w-px bg-gray-200 hidden sm:block" />

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCompleteAll}
              disabled={isPending || sortedAccounts.length === 0}
              className="h-8 text-xs font-medium text-gray-700"
              title="Complete all accounts for today"
            >
              Complete All
            </Button>

            <Button
              variant="ghost-danger"
              size="sm"
              onClick={() =>
                setConfirmDialog({
                  isOpen: true,
                  type: "reset-all",
                })
              }
              disabled={isPending || sortedAccounts.length === 0}
              className="h-8 text-xs font-medium"
              title="Reset all checklists for today"
            >
              Reset All
            </Button>
          </div>
        </div>
      </div>

      {/* Flat Single Toolbar (Directly above table without big card wrapper) */}
      <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 h-8 shadow-2xs"
          />
        </div>

        {/* Group Filter */}
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="bg-white border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 h-8 shadow-2xs cursor-pointer"
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
          className="bg-white border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 h-8 shadow-2xs cursor-pointer"
        >
          <option value="Active">Active</option>
          <option value="Paused">Paused</option>
          <option value="Finished">Finished</option>
          <option value="all">All Status</option>
        </select>

        {/* Progress Filter */}
        <select
          value={completionFilter}
          onChange={(e) => setCompletionFilter(e.target.value as CompletionFilter)}
          className="bg-white border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 h-8 shadow-2xs cursor-pointer"
        >
          <option value="all">All Progress</option>
          <option value="not-started">Not Started (0%)</option>
          <option value="in-progress">In Progress (1-99%)</option>
          <option value="completed">Completed (100%)</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="bg-white border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 h-8 shadow-2xs cursor-pointer font-medium"
        >
          <option value="least-progress">Least Progress</option>
          <option value="most-progress">Most Progress</option>
          <option value="name-asc">Nickname A-Z</option>
          <option value="name-desc">Nickname Z-A</option>
          <option value="group">Group</option>
        </select>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-xs font-semibold sticky top-0 z-20">
                {/* Sticky Account Header */}
                <th className="py-2.5 px-3.5 sticky left-0 z-30 bg-gray-50 min-w-[190px] border-r border-gray-200">
                  Account ({sortedAccounts.length})
                </th>

                {/* Master Activities Columns */}
                {initialData.activities.map((act) => (
                  <th
                    key={act.id}
                    className="py-2.5 px-2 text-center min-w-[80px]"
                  >
                    <div className="truncate font-medium text-gray-800" title={act.name}>
                      {act.name}
                    </div>
                  </th>
                ))}

                {/* Progress Column */}
                <th className="py-2.5 px-3 text-center min-w-[120px]">
                  Progress
                </th>

                {/* Actions Column */}
                <th className="py-2.5 px-2 text-center w-16">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs">
              {sortedAccounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={initialData.activities.length + 3}
                    className="py-10 text-center text-gray-400"
                  >
                    No accounts matching the selected filters.
                  </td>
                </tr>
              ) : (
                sortedAccounts.map((acc) => {
                  const is100 = acc.progressPercent === 100;

                  return (
                    <tr
                      key={acc.id}
                      className={cn(
                        "transition-colors hover:bg-gray-50/80",
                        is100 && "bg-emerald-50/20"
                      )}
                    >
                      {/* Sticky Account Column */}
                      <td
                        className={cn(
                          "py-2 px-3.5 sticky left-0 z-10 border-r border-gray-200 bg-white transition-colors",
                          is100 && "bg-emerald-50/30"
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/accounts/${acc.id}`}
                              className="font-semibold text-gray-900 hover:text-blue-600 truncate flex items-center gap-1 group"
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

                      {/* Clean Modern Activity Checkboxes */}
                      {initialData.activities.map((act) => {
                        const isAssigned = acc.assignedActivityIds.includes(act.id);
                        const isCompleted = acc.completedActivityIds.includes(act.id);

                        if (!isAssigned) {
                          return (
                            <td
                              key={act.id}
                              className="py-2 px-2 text-center text-gray-300 select-none"
                            >
                              <span>—</span>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={act.id}
                            className="py-2 px-2 text-center"
                          >
                            <div className="flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleToggle(acc.id, act.id, isCompleted)}
                                title={`${acc.nickname}: ${act.name} (${isCompleted ? "Completed" : "Incomplete"})`}
                                className={cn(
                                  "w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer border",
                                  isCompleted
                                    ? "bg-blue-600 border-blue-600 text-white shadow-2xs hover:bg-blue-700"
                                    : "bg-white border-gray-300 text-transparent hover:border-gray-400 hover:bg-gray-50"
                                )}
                              >
                                <Check className={cn("w-3.5 h-3.5 stroke-[2.5]", isCompleted ? "opacity-100" : "opacity-0")} />
                              </button>
                            </div>
                          </td>
                        );
                      })}

                      {/* Compact Progress Cell */}
                      <td className="py-2 px-3 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center justify-between w-full text-[11px] text-gray-600 font-mono">
                            <span>
                              {acc.completedCount} / {acc.totalAssigned}
                            </span>
                            {is100 ? (
                              <span className="text-emerald-700 font-bold">✓ 100%</span>
                            ) : (
                              <span>{acc.progressPercent}%</span>
                            )}
                          </div>
                          <ProgressBar
                            value={acc.progressPercent}
                            size="sm"
                            showLabel={false}
                          />
                        </div>
                      </td>

                      {/* Action Cell */}
                      <td className="py-2 px-2 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleCompleteAccount(acc.id)}
                            disabled={is100 || acc.totalAssigned === 0}
                            title="Complete Account"
                            className="p-1 rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                            title="Reset Account"
                            className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
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

      {/* Confirmation Dialog */}
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
            ? "Reset All Checklists Today?"
            : `Reset Checklist for ${confirmDialog.accountName}?`
        }
        message={
          confirmDialog.type === "reset-all"
            ? `Are you sure you want to reset all activity checks for ALL accounts on ${formatDateDisplay(
                currentDate
              )}?`
            : `Are you sure you want to reset all activity checks for ${confirmDialog.accountName} on ${formatDateDisplay(
                currentDate
              )}?`
        }
        confirmText="Reset"
        cancelText="Cancel"
        variant="danger"
        isLoading={dialogLoading}
      />
    </div>
  );
}
