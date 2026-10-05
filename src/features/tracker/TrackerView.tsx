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

  // Summary counts
  const activeList = accounts.filter((a) => a.status === "Active");
  const completedCountAcc = activeList.filter(
    (a) => a.totalAssigned > 0 && a.completedCount === a.totalAssigned
  ).length;

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {errorMessage && (
        <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-destructive hover:opacity-80 font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Header & Date Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Tracker
        </h1>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleDateChange(addDays(currentDate, -1))}
            disabled={isPending}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant={isViewingToday ? "secondary" : "outline"}
            size="sm"
            className="h-8 text-xs font-medium"
            onClick={() => handleDateChange(todayDate)}
            disabled={isPending || isViewingToday}
          >
            Today
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleDateChange(addDays(currentDate, 1))}
            disabled={isPending}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <input
            type="date"
            value={currentDate}
            onChange={(e) => {
              if (e.target.value) handleDateChange(e.target.value);
            }}
            disabled={isPending}
            className="h-8 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          />
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
        >
          <option value="all">All Groups</option>
          {initialData.groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
        >
          <option value="Active">Active</option>
          <option value="Paused">Paused</option>
          <option value="Finished">Finished</option>
          <option value="all">All Status</option>
        </select>

        <select
          value={completionFilter}
          onChange={(e) => setCompletionFilter(e.target.value as CompletionFilter)}
          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
        >
          <option value="all">All Progress</option>
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
        >
          <option value="least-progress">Least Progress</option>
          <option value="most-progress">Most Progress</option>
          <option value="name-asc">Nickname A-Z</option>
          <option value="name-desc">Nickname Z-A</option>
          <option value="group">Group</option>
        </select>
      </div>

      {/* Sub-header: Count Summary & Actions */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <div>
          <span>
            {activeList.length} Accounts · {completedCountAcc} Completed
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={handleCompleteAll}
            disabled={isPending || sortedAccounts.length === 0}
          >
            Complete All
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={() =>
              setConfirmDialog({
                isOpen: true,
                type: "reset-all",
              })
            }
            disabled={isPending || sortedAccounts.length === 0}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            Reset All
          </Button>
        </div>
      </div>

      {/* Main Tracker Table */}
      <div className="rounded-md border border-border overflow-hidden bg-background">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[200px] sticky left-0 z-20 bg-background border-r border-border font-medium text-xs">
                Account
              </TableHead>
              {initialData.activities.map((act) => (
                <TableHead
                  key={act.id}
                  className="text-center min-w-[70px] font-medium text-xs px-2"
                >
                  {act.code || act.name}
                </TableHead>
              ))}
              <TableHead className="text-center min-w-[110px] font-medium text-xs">
                Progress
              </TableHead>
              <TableHead className="w-16 text-center font-medium text-xs">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedAccounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={initialData.activities.length + 3}
                  className="h-24 text-center text-xs text-muted-foreground"
                >
                  No accounts found.
                </TableCell>
              </TableRow>
            ) : (
              sortedAccounts.map((acc) => {
                const is100 = acc.progressPercent === 100;

                return (
                  <TableRow key={acc.id} className="hover:bg-muted/30 transition-colors">
                    {/* Sticky Account Column */}
                    <TableCell className="sticky left-0 z-10 bg-background border-r border-border py-2 px-3">
                      <div className="min-w-0">
                        <Link
                          href={`/accounts/${acc.id}`}
                          className="font-medium text-sm text-foreground hover:underline truncate block"
                        >
                          {acc.nickname}
                        </Link>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {acc.job} · {acc.server} {acc.groupName && `· ${acc.groupName}`}
                        </div>
                      </div>
                    </TableCell>

                    {/* Activity Checkboxes */}
                    {initialData.activities.map((act) => {
                      const isAssigned = acc.assignedActivityIds.includes(act.id);
                      const isCompleted = acc.completedActivityIds.includes(act.id);

                      if (!isAssigned) {
                        return (
                          <TableCell
                            key={act.id}
                            className="text-center text-muted-foreground/40 select-none py-2 px-2 text-xs"
                          >
                            —
                          </TableCell>
                        );
                      }

                      return (
                        <TableCell
                          key={act.id}
                          className="text-center py-2 px-2"
                        >
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() =>
                                handleToggle(acc.id, act.id, isCompleted)
                              }
                              aria-label={`${acc.nickname} - ${act.name}`}
                            />
                          </div>
                        </TableCell>
                      );
                    })}

                    {/* Progress Column */}
                    <TableCell className="text-center py-2 px-3">
                      <div className="flex flex-col items-center gap-1 w-full max-w-[120px] mx-auto">
                        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                          <span>
                            {acc.completedCount} / {acc.totalAssigned}
                          </span>
                          <span className={cn(is100 && "font-medium text-foreground")}>
                            {acc.progressPercent}%
                          </span>
                        </div>
                        <Progress
                          value={acc.progressPercent}
                          className="h-1.5"
                          indicatorColor={is100 ? "bg-emerald-600" : "bg-primary"}
                        />
                      </div>
                    </TableCell>

                    {/* Row Actions */}
                    <TableCell className="text-center py-2 px-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => handleCompleteAccount(acc.id)}
                          disabled={is100 || acc.totalAssigned === 0}
                          title="Complete Account"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
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
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
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
        description={
          confirmDialog.type === "reset-all"
            ? `Are you sure you want to reset all activity checks for ALL accounts on ${formatDateDisplay(
                currentDate
              )}?`
            : `Are you sure you want to reset all activity checks for ${confirmDialog.accountName} on ${formatDateDisplay(
                currentDate
              )}?`
        }
        confirmLabel="Reset"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={dialogLoading}
      />
    </div>
  );
}
