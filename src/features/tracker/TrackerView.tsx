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
import { updateAccountZeny } from "@/server/actions/accounts";
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
  RotateCcw,
  Check,
  Search,
  CheckCheck,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Coins,
  Users,
  CheckCircle2,
  FolderKanban,
} from "lucide-react";
import { cn, formatZeny, formatZenyCompact } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AppPage } from "@/components/shared/AppPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageToolbar } from "@/components/shared/PageToolbar";
import { DateNavigator } from "@/components/shared/DateNavigator";
import { DataTablePagination } from "@/components/shared/DataTablePagination";

interface TrackerViewProps {
  initialData: TrackerData;
}

type SortOption =
  | "username-asc"
  | "username-desc"
  | "name-asc"
  | "name-desc"
  | "zeny-desc"
  | "zeny-asc"
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
  const [sortBy, setSortBy] = useState<SortOption>("username-asc");

  // Reset confirmation dialog
  const [confirmResetAllOpen, setConfirmResetAllOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Quick Zeny Update Modal State
  const [zenyModalAccount, setZenyModalAccount] = useState<TrackerAccountRow | null>(null);
  const [zenyInputValue, setZenyInputValue] = useState<number>(0);
  const [isSavingZeny, setIsSavingZeny] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Copy & credentials state
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const handleCopy = async (text: string, label: string, key: string) => {
    if (!text) {
      toast.info(`${label} is empty`);
      return;
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopiedField(key);
      toast.success(`${label} copied to clipboard!`);
      setTimeout(() => setCopiedField((curr) => (curr === key ? null : curr)), 2000);
    } catch {
      toast.error(`Failed to copy ${label}`);
    }
  };

  const togglePasswordVisibility = (accountId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  const handleOpenZenyModal = (account: TrackerAccountRow) => {
    setZenyModalAccount(account);
    setZenyInputValue(account.zeny || 0);
  };

  const handleSaveZeny = async () => {
    if (!zenyModalAccount) return;
    const accountId = zenyModalAccount.id;
    const targetNickname = zenyModalAccount.nickname;
    const newZeny = Math.max(0, Math.floor(Number(zenyInputValue) || 0));
    const prevZeny = zenyModalAccount.zeny || 0;

    // Optimistic update locally
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, zeny: newZeny } : a))
    );
    setIsSavingZeny(true);

    try {
      const res = await updateAccountZeny(accountId, newZeny);
      if (!res.success) {
        throw new Error(res.error || "Failed to update zeny");
      }
      toast.success(`Zeny updated for "${targetNickname}" (${formatZeny(newZeny)})`);
      setZenyModalAccount(null);
    } catch (err: any) {
      // Rollback on failure
      setAccounts((prev) =>
        prev.map((a) => (a.id === accountId ? { ...a, zeny: prevZeny } : a))
      );
      toast.error(err.message || "Failed to save zeny");
    } finally {
      setIsSavingZeny(false);
    }
  };

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
    const naturalCompare = (strA: string, strB: string) =>
      (strA || "").localeCompare(strB || "", undefined, { numeric: true, sensitivity: "base" });

    switch (sortBy) {
      case "username-asc":
        return list.sort((a, b) => naturalCompare(a.username, b.username) || naturalCompare(a.nickname, b.nickname));
      case "username-desc":
        return list.sort((a, b) => naturalCompare(b.username, a.username) || naturalCompare(b.nickname, a.nickname));
      case "name-asc":
        return list.sort((a, b) => naturalCompare(a.nickname, b.nickname) || naturalCompare(a.username, b.username));
      case "name-desc":
        return list.sort((a, b) => naturalCompare(b.nickname, a.nickname) || naturalCompare(b.username, a.username));
      case "zeny-desc":
        return list.sort((a, b) => (b.zeny || 0) - (a.zeny || 0) || naturalCompare(a.username, b.username));
      case "zeny-asc":
        return list.sort((a, b) => (a.zeny || 0) - (b.zeny || 0) || naturalCompare(a.username, b.username));
      case "least-progress":
        return list.sort((a, b) => {
          if (a.progressPercent !== b.progressPercent) {
            return a.progressPercent - b.progressPercent;
          }
          return naturalCompare(a.username, b.username);
        });
      case "most-progress":
        return list.sort((a, b) => {
          if (a.progressPercent !== b.progressPercent) {
            return b.progressPercent - a.progressPercent;
          }
          return naturalCompare(a.username, b.username);
        });
      case "group":
        return list.sort((a, b) => {
          const groupComp = naturalCompare(a.groupName || "", b.groupName || "");
          if (groupComp !== 0) return groupComp;
          return naturalCompare(a.username, b.username);
        });
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

  // Group Summary Calculation (for the summary card above filters)
  const groupStats = useMemo(() => {
    let groupAccounts = accounts;
    let groupName = "All Groups";

    if (selectedGroup === "ungrouped") {
      groupAccounts = accounts.filter((a) => !a.groupId);
      groupName = "Ungrouped";
    } else if (selectedGroup !== "all") {
      groupAccounts = accounts.filter((a) => a.groupId === selectedGroup);
      const match = initialData.groups.find((g) => g.id === selectedGroup);
      groupName = match ? match.name : "Group";
    }

    const totalInGroup = groupAccounts.length;
    const activeInGroup = groupAccounts.filter((a) => a.status === "Active");
    const pausedInGroup = groupAccounts.filter((a) => a.status === "Paused").length;
    const finishedInGroup = groupAccounts.filter((a) => a.status === "Finished").length;

    // Total Zeny in this group
    const totalZeny = groupAccounts.reduce((sum, a) => sum + (Number(a.zeny) || 0), 0);
    const avgZeny = totalInGroup > 0 ? Math.round(totalZeny / totalInGroup) : 0;

    // Task completions in this group today
    const totalAssignedTasks = activeInGroup.reduce((sum, a) => sum + a.totalAssigned, 0);
    const completedTasks = activeInGroup.reduce((sum, a) => sum + a.completedCount, 0);
    const overallProgress =
      totalAssignedTasks > 0 ? Math.round((completedTasks / totalAssignedTasks) * 100) : 0;

    const completedAccounts = activeInGroup.filter(
      (a) => a.totalAssigned > 0 && a.completedCount === a.totalAssigned
    ).length;
    const inProgressAccounts = activeInGroup.filter(
      (a) => a.totalAssigned > 0 && a.completedCount > 0 && a.completedCount < a.totalAssigned
    ).length;
    const notStartedAccounts = activeInGroup.filter(
      (a) => a.totalAssigned > 0 && a.completedCount === 0
    ).length;

    return {
      groupName,
      totalInGroup,
      activeCount: activeInGroup.length,
      pausedCount: pausedInGroup,
      finishedCount: finishedInGroup,
      totalZeny,
      avgZeny,
      totalAssignedTasks,
      completedTasks,
      overallProgress,
      completedAccounts,
      inProgressAccounts,
      notStartedAccounts,
    };
  }, [accounts, selectedGroup, initialData.groups]);

  return (
    <AppPage>
      {/* Unified Page Header with Date Navigator */}
      <PageHeader
        title="Tracker"
        action={
          <DateNavigator
            currentDate={currentDate}
            onDateChange={handleDateChange}
            onJumpCurrent={() => handleDateChange(todayDate)}
            jumpLabel="TODAY"
            isCurrentActive={isViewingToday}
            onPrev={() => handleDateChange(addDays(currentDate, -1))}
            onNext={() => handleDateChange(addDays(currentDate, 1))}
            disabled={isPending}
          />
        }
      />

      {/* Group Summary Card Above Filters */}
      <div className="bg-[#FCFAF7] border border-[#cfbeaa] rounded-xs p-4 sm:p-5 shadow-[2px_2px_0px_#cfbeaa] space-y-4">
        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#ebd7b2] pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#FAF2E1] border border-[#cfbeaa] text-[#664b28]">
              Group Summary
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#231b12] flex items-center gap-1.5 truncate">
              <FolderKanban className="w-4 h-4 text-[#3B6EA8] shrink-0" />
              <span className="truncate">{groupStats.groupName}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-[#8a7b68] font-medium hidden sm:inline">Select Group:</span>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="h-7 px-2.5 text-xs bg-white border border-[#cfc3b0] rounded-xs text-[#2c261e] font-semibold focus:outline-none focus:border-[#3B6EA8] cursor-pointer shadow-[1px_1px_0px_#e5ddd0]"
            >
              <option value="all">All Groups ({accounts.length})</option>
              {initialData.groups.map((g) => {
                const count = accounts.filter((a) => a.groupId === g.id).length;
                return (
                  <option key={g.id} value={g.id}>
                    {g.name} ({count})
                  </option>
                );
              })}
              <option value="ungrouped">
                Ungrouped ({accounts.filter((a) => !a.groupId).length})
              </option>
            </select>
          </div>
        </div>

        {/* 4 Metric Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Total Zeny Card */}
          <div className="bg-gradient-to-br from-[#FFFDF7] to-[#FFF8E7] border border-[#e8d7ba] rounded-xs p-3.5 shadow-[1px_1px_0px_#ebd7b2] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8C580B] flex items-center gap-1.5 uppercase tracking-wide">
                <Coins className="w-4 h-4 text-[#8C580B]" />
                Total Zeny
              </span>
              <span className="text-[10px] font-mono font-bold text-[#8C580B] bg-[#FAF2E1] border border-[#ebd7b2] px-1.5 py-0.5 rounded-2xs">
                ZENY
              </span>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#8C580B] font-mono tracking-tight block">
                {formatZeny(groupStats.totalZeny)}
              </span>
              <div className="flex items-center justify-between text-[11px] text-[#8a7b68] mt-1 pt-1.5 border-t border-[#f2e6d2]">
                <span>Average per account:</span>
                <span className="font-mono font-semibold text-[#664b28]">
                  ~{formatZenyCompact(groupStats.avgZeny)}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Total Accounts */}
          <div className="bg-white border border-[#ded5c5] rounded-xs p-3.5 shadow-[1px_1px_0px_#e5ddd0] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5c4e3b] flex items-center gap-1.5 uppercase tracking-wide">
                <Users className="w-4 h-4 text-[#3B6EA8]" />
                Total Accounts
              </span>
              <span className="text-[10px] font-mono font-medium text-[#8a7b68]">
                {groupStats.totalInGroup} accounts
              </span>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-bold text-[#231b12] tracking-tight block">
                {groupStats.totalInGroup}{" "}
                <span className="text-sm font-normal text-[#8a7b68]">accounts</span>
              </span>
              <div className="flex items-center justify-between text-[11px] text-[#8a7b68] mt-1 pt-1.5 border-t border-[#eee7dc]">
                <span>Account status:</span>
                <span className="font-medium text-[#2c261e]">
                  {groupStats.activeCount} Active{groupStats.pausedCount > 0 ? ` · ${groupStats.pausedCount} Paused` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Completed Accounts */}
          <div className="bg-white border border-[#ded5c5] rounded-xs p-3.5 shadow-[1px_1px_0px_#e5ddd0] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1E5D2F] flex items-center gap-1.5 uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-[#1E5D2F]" />
                Accounts Completed
              </span>
              <span className="text-xs font-bold font-mono text-[#1E5D2F]">
                {groupStats.completedAccounts} / {groupStats.activeCount}
              </span>
            </div>
            <div className="mt-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#1E5D2F] font-mono tracking-tight">
                  {groupStats.completedAccounts}
                </span>
                <span className="text-xs text-[#8a7b68]">
                  of {groupStats.activeCount} active accounts
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#8a7b68] mt-1 pt-1.5 border-t border-[#eee7dc]">
                <span>Tasks completed:</span>
                <span className="font-mono font-semibold text-[#2c261e]">
                  {groupStats.completedTasks} / {groupStats.totalAssignedTasks} tasks
                </span>
              </div>
            </div>
          </div>

          {/* 4. Completion Bar & Breakdown */}
          <div className="bg-white border border-[#ded5c5] rounded-xs p-3.5 shadow-[1px_1px_0px_#e5ddd0] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5c4e3b] uppercase tracking-wide">
                Group Progress
              </span>
              <span className="text-xs font-bold font-mono text-[#3B6EA8]">
                {groupStats.overallProgress}%
              </span>
            </div>

            <Progress
              value={groupStats.overallProgress}
              className="h-2 bg-[#f0eae1]"
              indicatorColor={groupStats.overallProgress === 100 ? "bg-[#347A46]" : "bg-[#3B6EA8]"}
            />

            <div className="grid grid-cols-3 gap-1 pt-1 border-t border-[#eee7dc] text-center text-[10px]">
              <div className="bg-[#F2FAF4] p-1 rounded-2xs border border-[#c2e4cc]">
                <span className="block text-[#1E5D2F] font-bold font-mono">{groupStats.completedAccounts}</span>
                <span className="text-[9px] text-[#1E5D2F]">Completed</span>
              </div>
              <div className="bg-[#FFF8EB] p-1 rounded-2xs border border-[#ebd7b2]">
                <span className="block text-[#8C580B] font-bold font-mono">{groupStats.inProgressAccounts}</span>
                <span className="text-[9px] text-[#8C580B]">In Progress</span>
              </div>
              <div className="bg-[#F6F3EE] p-1 rounded-2xs border border-[#e0d6c8]">
                <span className="block text-[#5c4e3b] font-bold font-mono">{groupStats.notStartedAccounts}</span>
                <span className="text-[9px] text-[#7a6b57]">Not Started</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Page Toolbar */}
      <PageToolbar>
        {/* Left: Search & Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full lg:w-auto">
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

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Group Filter */}
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full sm:w-auto h-8 px-2.5 text-xs bg-white border border-[#cfc3b0] rounded-xs text-[#3d3326] focus:outline-none cursor-pointer shadow-[1px_1px_0px_#e5ddd0]"
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
              className="w-full sm:w-auto h-8 px-2.5 text-xs bg-white border border-[#cfc3b0] rounded-xs text-[#3d3326] focus:outline-none cursor-pointer shadow-[1px_1px_0px_#e5ddd0]"
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
              className="w-full sm:w-auto h-8 px-2.5 text-xs bg-white border border-[#cfc3b0] rounded-xs text-[#3d3326] focus:outline-none cursor-pointer shadow-[1px_1px_0px_#e5ddd0]"
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
              className="w-full sm:w-auto h-8 px-2.5 text-xs bg-white border border-[#cfc3b0] rounded-xs text-[#3d3326] focus:outline-none cursor-pointer shadow-[1px_1px_0px_#e5ddd0]"
            >
              <option value="username-asc">Username (A-Z)</option>
              <option value="username-desc">Username (Z-A)</option>
              <option value="name-asc">Nickname (A-Z)</option>
              <option value="name-desc">Nickname (Z-A)</option>
              <option value="zeny-desc">Highest Zeny</option>
              <option value="zeny-asc">Lowest Zeny</option>
              <option value="least-progress">Least Progress</option>
              <option value="most-progress">Most Progress</option>
              <option value="group">Group</option>
            </select>
          </div>
        </div>

        {/* Right: Counter & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between lg:justify-end gap-2.5 pt-2 lg:pt-0 w-full lg:w-auto border-t lg:border-t-0 border-[#ebd7b2]">
          <span className="text-xs text-[#5c4e3b] font-medium shrink-0">
            {totalActive} accounts · {completedAccountsCount} completed
          </span>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCompleteAll}
              disabled={actionLoading}
              className="h-8 text-xs font-medium flex-1 sm:flex-initial"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1 text-[#1E5D2F]" /> Complete All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmResetAllOpen(true)}
              disabled={actionLoading}
              className="h-8 text-xs font-medium text-[#8a7b68] hover:text-[#A82A1E] hover:bg-[#FDECEB] flex-1 sm:flex-initial"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset All
            </Button>
          </div>
        </div>
      </PageToolbar>

      {/* DESKTOP & TABLET MATRIX TABLE (hidden on mobile) */}
      <div className="hidden md:block bg-white border border-[#cfbeaa] rounded-xs overflow-hidden shadow-[2px_2px_0px_#ded5c5]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F4EFE6] border-b border-[#ded4c4]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[170px] font-bold text-xs text-[#2c261e] tracking-wider uppercase font-sans">
                  ACCOUNT
                </TableHead>
                <TableHead className="w-[130px] font-bold text-xs text-[#2c261e] tracking-wider uppercase font-sans">
                  USERNAME
                </TableHead>
                <TableHead className="w-[130px] font-bold text-xs text-[#2c261e] tracking-wider uppercase font-sans">
                  PASSWORD
                </TableHead>
                {initialData.activities.map((act) => {
                  const isWeekly = act.activityType === "WEEKLY";
                  return (
                    <TableHead
                      key={act.id}
                      className="text-center font-bold text-xs text-[#2c261e] min-w-[76px] py-2 tracking-wide font-sans"
                      title={
                        isWeekly
                          ? `${act.name} (Weekly Task — Reset every Monday)`
                          : `${act.name} (Daily Task)`
                      }
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-bold text-xs text-[#1a1510] tracking-tight font-sans">
                          {act.code || act.name}
                        </span>
                        {isWeekly && (
                          <span className="text-[9px] font-bold tracking-wider uppercase text-[#664b28] bg-[#FAF2E1] border border-[#cfbeaa] px-1 py-0.5 rounded-none leading-none mt-0.5 shadow-[0.5px_0.5px_0px_#baa892] font-sans">
                            WEEKLY
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
                <TableHead className="text-right w-[110px] font-bold text-xs text-[#2c261e] tracking-wider uppercase font-sans">
                  PROGRESS
                </TableHead>
                <TableHead className="w-[50px] text-right pr-4 font-bold text-xs text-[#2c261e] tracking-wider uppercase font-sans">
                  ACTION
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[#eee7dc]">
              {sortedAccounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={initialData.activities.length + 5}
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
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-[#8a7b68] truncate leading-tight">
                              {acc.job} {acc.groupName ? `· ${acc.groupName}` : ""}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenZenyModal(acc)}
                              className="inline-flex items-center gap-0.5 font-mono text-[10px] font-bold text-[#8C580B] bg-[#FFF8EB] hover:bg-[#FCECC9] border border-[#ebd7b2] px-1 py-0.2 rounded-2xs cursor-pointer transition-colors"
                              title={`Zeny: ${formatZeny(acc.zeny || 0)} (Click to edit)`}
                            >
                              <Coins className="w-2.5 h-2.5 text-[#8C580B]" />
                              {formatZenyCompact(acc.zeny || 0)}
                            </button>
                          </div>
                        </div>
                      </TableCell>

                      {/* Username Column */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-mono text-xs font-semibold text-[#2c261e] truncate max-w-[85px] select-all"
                            title={acc.username}
                          >
                            {acc.username}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(acc.username, "Username", `user-${acc.id}`)}
                            className="p-1 rounded-xs hover:bg-[#ebd7b2]/50 text-[#8a7b68] hover:text-[#231b12] cursor-pointer transition-colors shrink-0"
                            title="Copy Username"
                          >
                            {copiedField === `user-${acc.id}` ? (
                              <Check className="w-3.5 h-3.5 text-[#1E5D2F]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </TableCell>

                      {/* Password Column */}
                      <TableCell className="py-3">
                        {acc.password ? (
                          <div className="flex items-center gap-1">
                            <span
                              className="font-mono text-xs text-[#5a4c3a] tracking-wider truncate max-w-[65px] select-none"
                              title={visiblePasswords[acc.id] ? acc.password : undefined}
                            >
                              {visiblePasswords[acc.id] ? acc.password : "••••••"}
                            </span>
                            <div className="flex items-center shrink-0">
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(acc.id)}
                                className="p-1 rounded-xs hover:bg-[#ebd7b2]/50 text-[#8a7b68] hover:text-[#231b12] cursor-pointer transition-colors"
                                title={visiblePasswords[acc.id] ? "Hide Password" : "Show Password"}
                              >
                                {visiblePasswords[acc.id] ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopy(acc.password || "", "Password", `pass-${acc.id}`)}
                                className="p-1 rounded-xs hover:bg-[#ebd7b2]/50 text-[#8a7b68] hover:text-[#231b12] cursor-pointer transition-colors"
                                title="Copy Password"
                              >
                                {copiedField === `pass-${acc.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-[#1E5D2F]" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-[#a89b88] italic select-none pl-1">—</span>
                        )}
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
                              onClick={() => handleCopy(acc.username, "Username", `user-${acc.id}`)}
                              className="cursor-pointer text-[#2c261e] hover:bg-[#F3ECE0]"
                            >
                              <Copy className="w-3.5 h-3.5 mr-2 text-[#736350]" />
                              <span>Copy Username</span>
                            </DropdownMenuItem>
                            {acc.password && (
                              <DropdownMenuItem
                                onClick={() => handleCopy(acc.password || "", "Password", `pass-${acc.id}`)}
                                className="cursor-pointer text-[#2c261e] hover:bg-[#F3ECE0]"
                              >
                                <KeyRound className="w-3.5 h-3.5 mr-2 text-[#736350]" />
                                <span>Copy Password</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleOpenZenyModal(acc)}
                              className="cursor-pointer text-[#8C580B] hover:bg-[#FFF8EB]"
                            >
                              <Coins className="w-3.5 h-3.5 mr-2 text-[#8C580B]" />
                              <span>Update Zeny</span>
                            </DropdownMenuItem>
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

        <DataTablePagination
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
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/accounts/${acc.id}`}
                      className="text-xs font-bold text-[#231b12] hover:text-[#3B6EA8] truncate block"
                    >
                      {acc.nickname}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-[#8a7b68] truncate">
                        {acc.job} {acc.groupName ? `· ${acc.groupName}` : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenZenyModal(acc)}
                        className="inline-flex items-center gap-0.5 font-mono text-[10px] font-bold text-[#8C580B] bg-[#FFF8EB] hover:bg-[#FCECC9] border border-[#ebd7b2] px-1.5 py-0.5 rounded-2xs cursor-pointer transition-colors"
                        title={`Zeny: ${formatZeny(acc.zeny || 0)} (Click to edit)`}
                      >
                        <Coins className="w-3 h-3 text-[#8C580B]" />
                        {formatZenyCompact(acc.zeny || 0)}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
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

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[#8a7b68] hover:text-[#231b12]">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 text-xs rounded-xs border-2 border-[#cfbeaa] bg-[#FCFAF7] shadow-[3px_3px_0px_#baa892]">
                        <DropdownMenuItem
                          onClick={() => handleCopy(acc.username, "Username", `m-menu-user-${acc.id}`)}
                          className="cursor-pointer text-[#2c261e] hover:bg-[#F3ECE0]"
                        >
                          <Copy className="w-3.5 h-3.5 mr-2 text-[#736350]" />
                          <span>Copy Username</span>
                        </DropdownMenuItem>
                        {acc.password && (
                          <DropdownMenuItem
                            onClick={() => handleCopy(acc.password || "", "Password", `m-menu-pass-${acc.id}`)}
                            className="cursor-pointer text-[#2c261e] hover:bg-[#F3ECE0]"
                          >
                            <KeyRound className="w-3.5 h-3.5 mr-2 text-[#736350]" />
                            <span>Copy Password</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleOpenZenyModal(acc)}
                          className="cursor-pointer text-[#8C580B] hover:bg-[#FFF8EB]"
                        >
                          <Coins className="w-3.5 h-3.5 mr-2 text-[#8C580B]" />
                          <span>Update Zeny</span>
                        </DropdownMenuItem>
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
                  </div>
                </div>

                {/* Mobile Credentials Row */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                  <div className="inline-flex items-center gap-1 bg-[#FAF6F0] px-2 py-0.5 rounded-xs border border-[#cfbeaa]">
                    <span className="text-[10px] text-[#5c4a35] font-bold uppercase font-sans">USER:</span>
                    <span className="font-mono text-xs font-semibold text-[#2c261e]">{acc.username}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(acc.username, "Username", `m-user-${acc.id}`)}
                      className="p-0.5 text-[#8a7b68] hover:text-[#231b12]"
                      title="Copy Username"
                    >
                      {copiedField === `m-user-${acc.id}` ? (
                        <Check className="w-3 h-3 text-[#1E5D2F]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  {acc.password ? (
                    <div className="inline-flex items-center gap-1 bg-[#FAF6F0] px-2 py-0.5 rounded-xs border border-[#cfbeaa]">
                      <span className="text-[10px] text-[#5c4a35] font-bold uppercase font-sans">PASS:</span>
                      <span className="font-mono text-xs text-[#5a4c3a]">
                        {visiblePasswords[acc.id] ? acc.password : "••••••"}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(acc.id)}
                        className="p-0.5 text-[#8a7b68] hover:text-[#231b12]"
                        title="Toggle Visibility"
                      >
                        {visiblePasswords[acc.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(acc.password || "", "Password", `m-pass-${acc.id}`)}
                        className="p-0.5 text-[#8a7b68] hover:text-[#231b12]"
                        title="Copy Password"
                      >
                        {copiedField === `m-pass-${acc.id}` ? (
                          <Check className="w-3 h-3 text-[#1E5D2F]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#a89b88] italic px-1">No password</span>
                  )}
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
                            <span className="text-[9px] font-bold uppercase text-[#664b28] bg-[#FAF2E1] border border-[#cfbeaa] px-1 py-0.2 rounded-none font-sans">
                              Weekly
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#3d3326] uppercase">
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
          <div className="bg-white border border-[#cfbeaa] rounded-xs overflow-hidden shadow-[2px_2px_0px_#ded5c5]">
            <DataTablePagination
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

      {/* Quick Update Zeny Modal */}
      <Modal
        isOpen={Boolean(zenyModalAccount)}
        onClose={() => setZenyModalAccount(null)}
        title={`Update Zeny — ${zenyModalAccount?.nickname || ""}`}
        description="Update zeny balance for this account."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs pt-1">
          <div className="p-3 rounded-xs bg-[#FFF8EB] border border-[#ebd7b2] space-y-1">
            <div className="flex items-center justify-between text-[#8C580B]">
              <span className="font-semibold flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> Account:
              </span>
              <span className="font-bold text-[#231b12] text-sm">
                {zenyModalAccount?.nickname} ({zenyModalAccount?.job})
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8a7b68]">
              <span>Current Zeny:</span>
              <span className="font-mono font-bold text-[#8C580B]">
                {formatZeny(zenyModalAccount?.zeny || 0)}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#2c261e] flex items-center justify-between">
              <span>New Zeny Amount</span>
              <span className="font-mono text-xs text-[#8C580B] font-bold">
                {formatZeny(zenyInputValue || 0)}
              </span>
            </label>
            <Input
              type="number"
              min={0}
              value={zenyInputValue === 0 ? "" : zenyInputValue}
              onChange={(e) =>
                setZenyInputValue(Math.max(0, parseInt(e.target.value) || 0))
              }
              placeholder="0"
              autoFocus
            />
            <p className="text-[10px] text-[#8a7b68]">
              Enter the updated zeny balance for this account.
            </p>
          </div>

          {/* Quick preset increment buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-[#8a7b68] font-medium block">Quick Add:</span>
            <div className="flex flex-wrap gap-1.5">
              {[100_000, 500_000, 1_000_000, 5_000_000, 10_000_000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setZenyInputValue((prev) => prev + amt)}
                  className="px-2 py-0.5 text-[10px] font-mono bg-white border border-[#cfbeaa] hover:border-[#8C580B] hover:bg-[#FFF8EB] text-[#664b28] rounded-2xs cursor-pointer transition-colors shadow-2xs font-semibold"
                >
                  +{formatZenyCompact(amt)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setZenyInputValue(0)}
                className="px-2 py-0.5 text-[10px] font-mono bg-white border border-[#cfbeaa] hover:border-rose-400 text-rose-600 rounded-2xs cursor-pointer transition-colors shadow-2xs"
              >
                Reset 0
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#ebd7b2]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setZenyModalAccount(null)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveZeny}
              disabled={isSavingZeny}
              className="h-8 text-xs font-semibold"
            >
              {isSavingZeny ? "Saving..." : "Save Zeny"}
            </Button>
          </div>
        </div>
      </Modal>
    </AppPage>
  );
}
