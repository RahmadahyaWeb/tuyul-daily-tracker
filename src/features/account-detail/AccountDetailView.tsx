"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  updateAccountNotes,
  getAccountCredentials,
  toggleAccountStatus,
} from "@/server/actions/accounts";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
  Eye,
  EyeOff,
  Save,
} from "lucide-react";

interface AccountDetailProps {
  data: {
    account: {
      id: string;
      nickname: string;
      username: string;
      server: string;
      owner: string;
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

  // Credentials state
  const [credentials, setCredentials] = useState<{
    password?: string;
    loading: boolean;
    show: boolean;
    fetched: boolean;
  }>({ loading: false, show: false, fetched: false });
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const handleFetchCredentials = async () => {
    if (credentials.fetched) {
      setCredentials((prev) => ({ ...prev, show: !prev.show }));
      return;
    }

    setCredentials((prev) => ({ ...prev, loading: true }));
    const res = await getAccountCredentials(account.id);
    if (res.success && res.data) {
      setCredentials({
        password: res.data.password,
        loading: false,
        show: true,
        fetched: true,
      });
    } else {
      setCredentials((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStatusChange = async (newStatus: "Active" | "Paused" | "Finished") => {
    setStatus(newStatus);
    await toggleAccountStatus(account.id, newStatus as "Active" | "Paused");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/accounts">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {account.nickname}
              </h1>
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
            <p className="text-xs text-muted-foreground mt-0.5">
              {account.job} · Lv.{account.level} · {account.server}
              {account.group && ` · ${account.group.name}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) =>
              handleStatusChange(e.target.value as "Active" | "Paused" | "Finished")
            }
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          >
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Finished">Finished</option>
          </select>

          <Link href="/tracker">
            <Button size="sm">Open Tracker</Button>
          </Link>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Credentials & Notes */}
        <div className="space-y-4">
          {/* Credentials */}
          <div className="rounded-md border border-border p-4 space-y-3 bg-background">
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Credentials
            </h2>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground">Username</span>
                <div className="flex items-center justify-between mt-1 p-2 bg-muted/30 border border-border rounded-md font-mono">
                  <span className="text-foreground font-medium truncate">
                    {account.username}
                  </span>
                  <button
                    onClick={() => handleCopy(account.username, "user")}
                    className="text-muted-foreground hover:text-foreground ml-2 cursor-pointer"
                  >
                    {copiedField === "user" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground">Password</span>
                <div className="flex items-center justify-between mt-1 p-2 bg-muted/30 border border-border rounded-md font-mono">
                  <span className="text-foreground font-medium">
                    {credentials.show && credentials.password
                      ? credentials.password
                      : "••••••••••••"}
                  </span>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={handleFetchCredentials}
                      disabled={credentials.loading}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {credentials.show ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {credentials.show && credentials.password && (
                      <button
                        onClick={() => handleCopy(credentials.password!, "pass")}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {copiedField === "pass" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="text-xs text-muted-foreground space-y-1">
                <div>Owner: <span className="text-foreground font-medium">{account.owner}</span></div>
                <div>Server: <span className="text-foreground font-medium">{account.server}</span></div>
                <div>Created: <span className="text-foreground font-medium">{formatDateShort(account.startDate.toISOString().split("T")[0])}</span></div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-md border border-border p-4 space-y-3 bg-background">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Notes
              </h2>
              {notesSaved && (
                <span className="text-xs text-emerald-600 font-medium">
                  Saved
                </span>
              )}
            </div>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes..."
            />
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveNotes}
                isLoading={isSavingNotes}
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                <span>Save</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Progress & 30-Day History */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-border p-3 space-y-2 bg-background">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Today</span>
                <span className="font-mono text-foreground font-medium">
                  {todayCompletedCount}/{totalAssigned} ({todayProgressPercent}%)
                </span>
              </div>
              <Progress value={todayProgressPercent} className="h-1.5" />
            </div>

            <div className="rounded-md border border-border p-3 space-y-2 bg-background">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>This Week</span>
                <span className="font-mono text-foreground font-medium">
                  {weekLogs.length}/{weekTotalExpected} ({weekProgressPercent}%)
                </span>
              </div>
              <Progress value={weekProgressPercent} className="h-1.5" />
            </div>
          </div>

          {/* Assigned Activities */}
          <div className="rounded-md border border-border p-4 space-y-2 bg-background">
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Assigned Activities ({totalAssigned})
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {activeActivities.map((act) => (
                <Badge key={act.id} variant="secondary" className="font-normal text-xs">
                  {act.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* 30-Day Activity History Table */}
          <div className="rounded-md border border-border overflow-hidden bg-background">
            <div className="p-3 border-b border-border bg-muted/30">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                30-Day Activity History
              </h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead className="text-xs font-medium">Date</TableHead>
                  {activeActivities.map((act) => (
                    <TableHead key={act.id} className="text-center text-xs font-medium px-2">
                      {act.code || act.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {last30Days.map((d) => (
                  <TableRow key={d} className="hover:bg-muted/20">
                    <TableCell className="text-xs font-mono text-muted-foreground py-1.5 px-3">
                      {formatDateDisplay(d)}
                    </TableCell>
                    {activeActivities.map((act) => {
                      const done = logsByDateAndActivity.has(`${d}_${act.id}`);
                      return (
                        <TableCell key={act.id} className="text-center py-1.5 px-2">
                          {done ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 mx-auto stroke-[2.5]" />
                          ) : (
                            <span className="text-muted-foreground/30 text-xs">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
