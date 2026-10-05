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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";

interface AccountDetailProps {
  data: {
    account: {
      id: string;
      nickname: string;
      username: string;
      server: string;
      owner?: string;
      job: string;
      level: number;
      startDate: Date;
      status: "Active" | "Paused" | "Finished";
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
      setTimeout(() => setNotesSaved(false), 2000);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStatusToggle = async () => {
    const nextStatus = status === "Active" ? "Paused" : "Active";
    setStatus(nextStatus);
    await toggleAccountStatus(account.id, nextStatus);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Breadcrumb & Back button */}
      <div>
        <Link
          href="/accounts"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Accounts</span>
        </Link>

        {/* Character Profile Card */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Avatar name={account.nickname} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
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

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1.5">
                <span className="font-medium text-slate-700">{account.job}</span>
                <span>·</span>
                <span>Server: <strong className="text-slate-700">{account.server}</strong></span>
                {account.group && (
                  <>
                    <span>·</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[10px]">
                      {account.group.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStatusToggle}
              className="text-xs h-8"
            >
              {status === "Active" ? "Pause Account" : "Activate Account"}
            </Button>
            <Link href="/tracker">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8">
                Daily Tracker
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2-Column KPI & Credentials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today & Weekly Progress Stats */}
        <Card className="saas-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              Checklist Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Today&apos;s Progress</span>
                <span className="font-bold text-slate-900">
                  {todayCompletedCount} / {totalAssigned} ({todayProgressPercent}%)
                </span>
              </div>
              <Progress value={todayProgressPercent} className="h-2" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">This Week Consistency</span>
                <span className="font-bold text-slate-900">
                  {weekLogs.length} / {weekTotalExpected} ({weekProgressPercent}%)
                </span>
              </div>
              <Progress value={weekProgressPercent} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card className="saas-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/60">
              <span className="text-slate-500">Username:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-slate-900">
                  {account.username}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(account.username, "username")}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Copy Username"
                >
                  {copiedField === "username" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Server</span>
                <span className="font-medium text-slate-800">{account.server}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Group</span>
                <span className="font-medium text-slate-800">{account.group?.name || "Ungrouped"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/60">
              <span className="text-slate-500">Start Date:</span>
              <span className="font-medium text-slate-800">
                {new Date(account.startDate).toLocaleDateString("id-ID", { dateStyle: "medium" })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes / Remarks Editor */}
      <Card className="saas-card">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            Character Notes & Instructions
          </CardTitle>
          <Button
            size="sm"
            onClick={handleSaveNotes}
            isLoading={isSavingNotes}
            className="h-7 text-xs bg-slate-900 hover:bg-slate-800 text-white gap-1"
          >
            {notesSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            <span>{notesSaved ? "Saved" : "Save Notes"}</span>
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type any character settings, farm target, level targets, or equipment gear setups here..."
            rows={3}
            className="text-xs bg-slate-50/50"
          />
        </CardContent>
      </Card>

      {/* 30-Day Activity History Heatmap Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            30-Day Activity History Matrix
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[750px]">
              <TableHeader className="bg-slate-50/80 border-b border-slate-200/70">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[180px] text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 pl-4 sticky left-0 z-20 bg-slate-50/90 border-r border-slate-200/60">
                    Activity
                  </TableHead>

                  {last30Days.map((dateStr) => {
                    const isToday = dateStr === todayStr;
                    return (
                      <TableHead
                        key={dateStr}
                        className={cn(
                          "text-center text-[10px] font-bold text-slate-500 py-2 px-1 min-w-[32px]",
                          isToday && "bg-indigo-50/50 text-indigo-700"
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

              <TableBody className="divide-y divide-slate-100">
                {activeActivities.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={last30Days.length + 1}
                      className="h-28 text-center text-xs text-slate-400 py-6"
                    >
                      No activities assigned to this character.
                    </TableCell>
                  </TableRow>
                ) : (
                  activeActivities
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((act) => (
                    <TableRow key={act.id} className="hover:bg-slate-50/60 transition-colors">
                      <TableCell className="py-2.5 pl-4 sticky left-0 z-10 bg-white border-r border-slate-200/60 text-xs font-semibold text-slate-900">
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
                              isToday && "bg-indigo-50/20"
                            )}
                          >
                            <span
                              className={cn(
                                "w-4 h-4 rounded-sm inline-flex items-center justify-center transition-colors",
                                isDone
                                  ? "bg-emerald-500 text-white shadow-2xs"
                                  : "bg-slate-100 text-slate-300"
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
            <Pagination
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
      </div>
    </div>
  );
}
