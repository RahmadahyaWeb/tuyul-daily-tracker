"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  updateAccountNotes,
  toggleAccountStatus,
} from "@/server/actions/accounts";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  formatDateDisplay,
  formatDateShort,
  getTodayMakassar,
  getWeekDays,
} from "@/lib/date-utils";
import {
  ArrowLeft,
  Copy,
  Check,
  Save,
  Activity,
  Calendar,
  FileText,
  UserCheck,
  Eye,
  EyeOff,
  Coins,
} from "lucide-react";
import { cn, formatZeny } from "@/lib/utils";
import { toast } from "sonner";
import { AppPage } from "@/components/shared/AppPage";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { DataTablePagination } from "@/components/shared/DataTablePagination";

interface AccountDetailProps {
  data: {
    account: {
      id: string;
      nickname: string;
      username: string;
      password?: string;
      server: string;
      owner?: string;
      job: string;
      level: number;
      startDate: Date;
      status: "Active" | "Paused" | "Finished";
      zeny: number;
      notes: string | null;
      groupId: string | null;
      group?: { id: string; name: string } | null;
      accountActivities: {
        id: string;
        activityId: string;
        isActive: boolean;
        activity: {
          id: string;
          name: string;
          code: string;
          sortOrder: number;
        };
      }[];
    };
    last30Days: string[];
    logs: {
      activityId: string;
      activityDate: string;
      isCompleted: boolean;
      completedAt: Date | null;
    }[];
  };
}

export function AccountDetailView({ data }: AccountDetailProps) {
  const { account, last30Days, logs } = data;
  const todayStr = getTodayMakassar();

  // Notes state
  const [notes, setNotes] = useState(account.notes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Pagination for activities matrix
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Status state
  const [status, setStatus] = useState(account.status);

  // Calculations
  const activeActivities = account.accountActivities.map((aa) => aa.activity);
  const totalAssigned = activeActivities.length;

  const todayLogs = logs.filter(
    (l) => l.activityDate === todayStr && l.isCompleted
  );
  const todayCompletedCount = todayLogs.length;
  const todayProgressPercent =
    totalAssigned > 0
      ? Math.round((todayCompletedCount / totalAssigned) * 100)
      : 0;

  const weekDays = getWeekDays(todayStr);
  const weekDatesSet = new Set(weekDays.map((d) => d.dateStr));
  const weekLogs = logs.filter(
    (l) => weekDatesSet.has(l.activityDate) && l.isCompleted
  );
  const weekTotalExpected = totalAssigned * 7;
  const weekProgressPercent =
    weekTotalExpected > 0
      ? Math.round((weekLogs.length / weekTotalExpected) * 100)
      : 0;

  const logsByDateAndActivity = new Map<string, boolean>();
  for (const log of logs) {
    if (log.isCompleted) {
      logsByDateAndActivity.set(`${log.activityDate}_${log.activityId}`, true);
    }
  }

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await updateAccountNotes(account.id, notes);
      setNotesSaved(true);
      toast.success("Character notes saved successfully!");
      setTimeout(() => setNotesSaved(false), 2000);
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStatusToggle = async () => {
    const nextStatus = status === "Active" ? "Paused" : "Active";
    setStatus(nextStatus);
    const res = await toggleAccountStatus(account.id, nextStatus);
    if (res && res.success) {
      toast.success(`Account status changed to ${nextStatus}`);
    } else {
      toast.error("Failed to update status");
    }
  };

  return (
    <AppPage>
      {/* Top Breadcrumb & Back button */}
      <div>
        <Link
          href="/accounts"
          className="inline-flex items-center gap-1.5 text-xs text-[#736350] hover:text-[#231b12] transition-colors font-medium mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Accounts</span>
        </Link>

        {/* Character Profile Card */}
        <div className="rounded-xs border border-[#cfbeaa] bg-[#FCFAF7] p-5 shadow-[2px_2px_0px_#ded5c5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Avatar name={account.nickname} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-[#231b12] leading-none">
                  {account.nickname}
                </h1>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">
                  Lv. {account.level}
                </Badge>
                <Badge
                  variant={
                    status === "Active"
                      ? "success"
                      : status === "Paused"
                      ? "warning"
                      : "neutral"
                  }
                  size="sm"
                >
                  {status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#736350] mt-1.5">
                <span className="font-semibold text-[#2c261e]">{account.job}</span>
                <span>·</span>
                <span>Server: <strong className="text-[#2c261e]">{account.server}</strong></span>
                {account.group && (
                  <>
                    <span>·</span>
                    <span className="px-1.5 py-0.5 rounded-none bg-[#FAF2E1] border border-[#cfbeaa] text-[#664b28] font-bold text-[10px]">
                      {account.group.name}
                    </span>
                  </>
                )}
                <span>·</span>
                <span className="inline-flex items-center gap-1 font-mono font-bold text-[#8C580B] text-xs bg-[#FFF8EB] border border-[#ebd7b2] px-2 py-0.5 rounded-2xs">
                  <Coins className="w-3 h-3 text-[#8C580B]" />
                  {formatZeny(account.zeny || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#ebd7b2]">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStatusToggle}
              className="text-xs h-8 flex-1 sm:flex-initial"
            >
              {status === "Active" ? "Pause Account" : "Activate Account"}
            </Button>
            <Link href="/tracker" className="flex-1 sm:flex-initial">
              <Button size="sm" className="text-xs h-8 w-full">
                Daily Tracker
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2-Column KPI & Credentials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today & Weekly Progress Stats */}
        <div className="rounded-xs border border-[#cfbeaa] bg-white p-4 shadow-[2px_2px_0px_#ded5c5] space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8a7b68] flex items-center gap-1.5 border-b border-[#eee7dc] pb-2">
            <Activity className="w-3.5 h-3.5 text-[#3B6EA8]" />
            Checklist Performance
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#5c4e3b]">Today&apos;s Progress</span>
                <span className="font-semibold text-[#231b12]">
                  {todayCompletedCount} / {totalAssigned} ({todayProgressPercent}%)
                </span>
              </div>
              <Progress value={todayProgressPercent} className="h-2" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#5c4e3b]">This Week Consistency</span>
                <span className="font-semibold text-[#231b12]">
                  {weekLogs.length} / {weekTotalExpected} ({weekProgressPercent}%)
                </span>
              </div>
              <Progress value={weekProgressPercent} className="h-2" />
            </div>
          </div>
        </div>

        {/* Account Information Card */}
        <div className="rounded-xs border border-[#cfbeaa] bg-white p-4 shadow-[2px_2px_0px_#ded5c5] space-y-2 text-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8a7b68] flex items-center gap-1.5 border-b border-[#eee7dc] pb-2">
            <UserCheck className="w-3.5 h-3.5 text-[#3B6EA8]" />
            Account Details
          </div>

          <div className="flex items-center justify-between p-2 rounded-xs bg-[#FFF8EB] border border-[#ebd7b2]">
            <span className="text-[#8C580B] font-semibold flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-[#8C580B]" />
              Zeny:
            </span>
            <span className="font-mono font-bold text-[#8C580B] text-sm">
              {formatZeny(account.zeny || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xs bg-[#FAF6F0] border border-[#cfbeaa]">
            <span className="text-[#736350]">Username:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-[#231b12]">
                {account.username}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(account.username, "Username")}
                className="p-1 text-[#8a7b68] hover:text-[#231b12] cursor-pointer"
                title="Copy Username"
              >
                {copiedField === "Username" ? (
                  <Check className="w-3.5 h-3.5 text-[#1E5D2F]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xs bg-[#FAF6F0] border border-[#cfbeaa]">
            <span className="text-[#736350]">Password:</span>
            <div className="flex items-center gap-2">
              {account.password ? (
                <>
                  <span className="font-mono font-semibold text-[#231b12]">
                    {showPassword ? account.password : "••••••••"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-[#8a7b68] hover:text-[#231b12] cursor-pointer"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(account.password || "", "Password")}
                    className="p-1 text-[#8a7b68] hover:text-[#231b12] cursor-pointer"
                    title="Copy Password"
                  >
                    {copiedField === "Password" ? (
                      <Check className="w-3.5 h-3.5 text-[#1E5D2F]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </>
              ) : (
                <span className="text-[#8a7b68] italic">No password set</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-xs bg-[#FAF6F0] border border-[#cfbeaa]">
              <span className="text-[10px] text-[#8a7b68] uppercase font-semibold block">Server</span>
              <span className="font-medium text-[#231b12]">{account.server}</span>
            </div>
            <div className="p-2 rounded-xs bg-[#FAF6F0] border border-[#cfbeaa]">
              <span className="text-[10px] text-[#8a7b68] uppercase font-semibold block">Group</span>
              <span className="font-medium text-[#231b12]">{account.group?.name || "Ungrouped"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xs bg-[#FAF6F0] border border-[#cfbeaa]">
            <span className="text-[#736350]">Start Date:</span>
            <span className="font-medium text-[#231b12]">
              {new Date(account.startDate).toLocaleDateString("en-US", { dateStyle: "medium" })}
            </span>
          </div>
        </div>
      </div>

      {/* Notes / Remarks Editor */}
      <div className="rounded-xs border border-[#cfbeaa] bg-white p-4 shadow-[2px_2px_0px_#ded5c5] space-y-3">
        <div className="flex items-center justify-between border-b border-[#eee7dc] pb-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8a7b68] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#3B6EA8]" />
            Character Notes & Instructions
          </div>
          <Button
            size="sm"
            onClick={handleSaveNotes}
            isLoading={isSavingNotes}
            className="h-8 text-xs gap-1"
          >
            {notesSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            <span>{notesSaved ? "Saved" : "Save Notes"}</span>
          </Button>
        </div>
        <div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type any character settings, farm target, level targets, or equipment gear setups here..."
            rows={3}
            className="text-xs bg-[#FAF6F0]/60 border-[#cfbeaa]"
          />
        </div>
      </div>

      {/* 30-Day Activity History Heatmap Matrix */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <SectionHeader title="30-Day Activity History" />
          <span className="text-[11px] text-[#8a7b68] sm:hidden font-medium">
            ← Scroll horizontally to view all 30 days →
          </span>
        </div>

        <div className="rounded-xs border border-[#cfbeaa] bg-white shadow-[2px_2px_0px_#ded5c5] overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[750px]">
              <TableHeader className="bg-[#F4EFE6] border-b border-[#ded4c4]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[180px] text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 pl-4 sticky left-0 z-20 bg-[#F4EFE6] border-r border-[#ded4c4] font-sans">
                    Activity
                  </TableHead>

                  {last30Days.map((dateStr) => {
                    const isToday = dateStr === todayStr;
                    return (
                      <TableHead
                        key={dateStr}
                        className={cn(
                          "text-center text-[10px] font-bold text-[#5c4e3b] py-2 px-1 min-w-[32px] font-sans",
                          isToday && "bg-[#FAF2E1] text-[#664b28]"
                        )}
                      >
                        <span title={formatDateDisplay(dateStr)}>
                          {formatDateShort(dateStr)}
                        </span>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-[#eee7dc]">
                {activeActivities.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={last30Days.length + 1}
                      className="h-28 text-center text-xs text-[#8a7b68] py-6"
                    >
                      No activities assigned to this character.
                    </TableCell>
                  </TableRow>
                ) : (
                  activeActivities
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((act) => (
                    <TableRow key={act.id} className="hover:bg-[#FAF6F0] transition-colors">
                      <TableCell className="py-2.5 pl-4 sticky left-0 z-10 bg-white border-r border-[#eee7dc] text-xs font-semibold text-[#231b12]">
                        {act.name}
                      </TableCell>

                      {last30Days.map((dateStr) => {
                        const isDone = logsByDateAndActivity.get(`${dateStr}_${act.id}`);
                        const isToday = dateStr === todayStr;

                        return (
                          <TableCell
                            key={dateStr}
                            className={cn(
                              "text-center p-1 align-middle",
                              isToday && "bg-[#FAF2E1]/30"
                            )}
                          >
                            <span
                              className={cn(
                                "w-4 h-4 rounded-none inline-flex items-center justify-center transition-colors",
                                isDone
                                  ? "bg-[#1E5D2F] text-white"
                                  : "bg-[#eee7dc] text-transparent"
                              )}
                              title={`${act.name} on ${dateStr}: ${isDone ? "Done" : "Not Done"}`}
                            >
                              {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </span>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {activeActivities.length > 0 && (
            <DataTablePagination
              currentPage={currentPage}
              totalItems={activeActivities.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[5, 10, 20]}
              itemLabel="activities"
            />
          )}
        </div>
      </section>
    </AppPage>
  );
}
