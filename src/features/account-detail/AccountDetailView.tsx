"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  updateAccountNotes,
  getAccountCredentials,
  toggleAccountStatus,
} from "@/server/actions/accounts";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  formatDateDisplay,
  formatDateShort,
  getTodayMakassar,
  getWeekDays,
} from "@/lib/date-utils";
import {
  ArrowLeft,
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
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
    <div className="space-y-6 text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/accounts">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
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
            <p className="text-xs text-gray-500 mt-0.5">
              {account.job} · Level {account.level} · {account.server}
              {account.group && ` · ${account.group.name}`}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) =>
              handleStatusChange(e.target.value as "Active" | "Paused" | "Finished")
            }
            className="bg-white border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 h-8 shadow-2xs cursor-pointer"
          >
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Finished">Finished</option>
          </select>

          <Link href="/tracker">
            <Button variant="primary" size="sm" className="h-8 text-xs font-medium">
              Open in Tracker
            </Button>
          </Link>
        </div>
      </div>

      {/* 2-Column Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
        {/* Left Column: Account Details & Credentials */}
        <div className="space-y-4">
          {/* Info & Credentials */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs space-y-3">
            <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">
              Account Credentials
            </h2>

            <div className="space-y-2 font-mono">
              <div>
                <span className="text-gray-500 text-[11px]">Username</span>
                <div className="flex items-center justify-between mt-0.5 p-2 bg-gray-50 border border-gray-200 rounded-md">
                  <span className="text-gray-900 font-medium truncate">
                    {account.username}
                  </span>
                  <button
                    onClick={() => handleCopy(account.username, "user")}
                    className="text-gray-400 hover:text-gray-700 ml-2"
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
                <span className="text-gray-500 text-[11px]">Password (Encrypted)</span>
                <div className="flex items-center justify-between mt-0.5 p-2 bg-gray-50 border border-gray-200 rounded-md">
                  <span className="text-gray-900 font-medium">
                    {credentials.show && credentials.password
                      ? credentials.password
                      : "••••••••••••"}
                  </span>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={handleFetchCredentials}
                      disabled={credentials.loading}
                      className="text-gray-400 hover:text-gray-700"
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
                        className="text-gray-400 hover:text-gray-700"
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

              <div className="pt-2 text-[11px] text-gray-500 font-sans space-y-1">
                <div>Owner: <span className="text-gray-800 font-medium">{account.owner}</span></div>
                <div>Server: <span className="text-gray-800 font-medium">{account.server}</span></div>
                <div>Created: <span className="text-gray-800 font-medium">{formatDateShort(account.startDate.toISOString().split("T")[0])}</span></div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="font-semibold text-gray-900">Notes</h2>
              {notesSaved && (
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add personal notes, build targets, pin code..."
              className="w-full bg-white border border-gray-200 rounded-md p-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveNotes}
                isLoading={isSavingNotes}
                className="gap-1 text-xs"
              >
                <Save className="w-3 h-3" />
                <span>Save Notes</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Activities & 30-Day Matrix */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-gray-500">
                <span>Today Progress</span>
                <span className="font-mono font-semibold text-gray-900">
                  {todayCompletedCount}/{totalAssigned} ({todayProgressPercent}%)
                </span>
              </div>
              <ProgressBar value={todayProgressPercent} size="sm" />
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-gray-500">
                <span>This Week</span>
                <span className="font-mono font-semibold text-gray-900">
                  {weekLogs.length}/{weekTotalExpected} ({weekProgressPercent}%)
                </span>
              </div>
              <ProgressBar value={weekProgressPercent} size="sm" />
            </div>
          </div>

          {/* Assigned Activities List */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs space-y-3">
            <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">
              Assigned Activities ({totalAssigned})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activeActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center gap-2 p-2 rounded bg-gray-50 border border-gray-200"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="font-medium text-gray-800 truncate">
                    {act.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 30-Day Activity History Table */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs space-y-3">
            <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">
              30-Day Activity History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-xs font-semibold">
                    <th className="py-2 px-3">Date</th>
                    {activeActivities.map((act) => (
                      <th key={act.id} className="py-2 px-2 text-center">
                        {act.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-mono">
                  {last30Days.map((d) => (
                    <tr key={d} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-1.5 px-3 text-gray-700">
                        {formatDateDisplay(d)}
                      </td>
                      {activeActivities.map((act) => {
                        const done = logsByDateAndActivity.has(`${d}_${act.id}`);
                        return (
                          <td key={act.id} className="py-1.5 px-2 text-center">
                            {done ? (
                              <span className="inline-flex w-4 h-4 rounded bg-emerald-50 text-emerald-700 items-center justify-center font-bold text-[10px]">
                                ✓
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
