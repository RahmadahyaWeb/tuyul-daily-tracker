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
  Clock,
  Calendar,
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

  // Credentials view state
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

  // Today progress
  const todayLogs = logs.filter(
    (l) => l.activityDate === todayStr && l.isCompleted
  );
  const todayCompletedCount = todayLogs.length;
  const todayProgressPercent =
    totalAssigned > 0
      ? Math.round((todayCompletedCount / totalAssigned) * 100)
      : 0;

  // This Week progress
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

  // Map 30-day logs for fast cell lookup
  const logsByDateAndActivity = new Map<string, boolean>();
  for (const log of logs) {
    if (log.isCompleted) {
      logsByDateAndActivity.set(`${log.activityDate}_${log.activityId}`, true);
    }
  }

  // Handle Save Notes
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

  // Handle Fetch Credentials
  const handleFetchCredentials = async () => {
    if (credentials.fetched) {
      setCredentials((prev) => ({ ...prev, show: !prev.show }));
      return;
    }

    setCredentials((prev) => ({ ...prev, loading: true }));
    try {
      const res = await getAccountCredentials(account.id);
      if (res.success && res.data) {
        setCredentials({
          password: res.data.password,
          loading: false,
          show: true,
          fetched: true,
        });
      }
    } catch {
      setCredentials((prev) => ({ ...prev, loading: false }));
    }
  };

  // Copy helper
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Status Change
  const handleStatusChange = async (
    newStatus: "Active" | "Paused" | "Finished"
  ) => {
    setStatus(newStatus);
    await toggleAccountStatus(account.id, newStatus);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Link href="/accounts">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
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
            <p className="text-xs text-zinc-400 mt-0.5">
              {account.job} • Lv. {account.level} • {account.server} • Owner:{" "}
              {account.owner}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) =>
              handleStatusChange(
                e.target.value as "Active" | "Paused" | "Finished"
              )
            }
            className="bg-zinc-900 border border-zinc-700 rounded-md px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
          >
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Finished">Finished</option>
          </select>

          <Link href={`/tracker?date=${todayStr}`}>
            <Button variant="primary" size="sm">
              Tracker Hari Ini
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress & Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Today's Progress */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Progres Hari Ini
            </span>
            <span className="font-mono font-bold text-zinc-200">
              {todayCompletedCount}/{totalAssigned} Selesai
            </span>
          </div>
          <ProgressBar value={todayProgressPercent} size="md" showLabel />
          <p className="text-[11px] text-zinc-500 font-mono">
            {todayCompletedCount === totalAssigned
              ? "Semua aktivitas hari ini sudah selesai!"
              : `${totalAssigned - todayCompletedCount} aktivitas tersisa hari ini`}
          </p>
        </div>

        {/* Weekly Progress */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Progres Minggu Ini
            </span>
            <span className="font-mono font-bold text-zinc-200">
              {weekLogs.length}/{weekTotalExpected} Selesai
            </span>
          </div>
          <ProgressBar value={weekProgressPercent} size="md" showLabel />
          <p className="text-[11px] text-zinc-500 font-mono">
            Total checklist mingguan terisi
          </p>
        </div>

        {/* Account Info Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-4 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-zinc-400 pb-1 border-b border-zinc-800/80">
            <span>Group:</span>
            <span className="text-zinc-200 font-medium">
              {account.group?.name || "None"}
            </span>
          </div>
          <div className="flex items-center justify-between text-zinc-400 pb-1 border-b border-zinc-800/80">
            <span>Mulai Pengerjaan:</span>
            <span className="text-zinc-200 font-mono">
              {formatDateDisplay(
                new Date(account.startDate).toISOString().split("T")[0]
              )}
            </span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span>Aktivitas Terpasang:</span>
            <span className="text-emerald-400 font-mono font-bold">
              {totalAssigned} Checklist
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Credentials & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Credentials Box */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-zinc-200">
                Credentials & Login
              </h2>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">
              AES-256-GCM
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Username */}
            <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800/80 rounded-md px-3 py-2">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500">USERNAME</span>
                <p className="font-mono text-zinc-200">{account.username}</p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(account.username, "username")}
                className="text-zinc-400 hover:text-blue-400 flex items-center gap-1 cursor-pointer"
              >
                {copiedField === "username" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedField === "username" ? "Tersalin" : "Copy"}</span>
              </button>
            </div>

            {/* Password */}
            <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800/80 rounded-md px-3 py-2">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500">PASSWORD</span>
                <p className="font-mono text-zinc-200">
                  {credentials.show && credentials.password
                    ? credentials.password
                    : "••••••••••••"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFetchCredentials}
                  disabled={credentials.loading}
                  className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  title="Tampilkan / Sembunyikan Password"
                >
                  {credentials.show ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!credentials.password) {
                      const res = await getAccountCredentials(account.id);
                      if (res.success && res.data) {
                        handleCopy(res.data.password, "password");
                        setCredentials({
                          password: res.data.password,
                          loading: false,
                          show: true,
                          fetched: true,
                        });
                      }
                    } else {
                      handleCopy(credentials.password, "password");
                    }
                  }}
                  className="text-zinc-400 hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === "password" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {copiedField === "password" ? "Tersalin" : "Copy"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Editor */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-200">
              Catatan / Notes Akun
            </h2>
            {notesSaved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Tersimpan
              </span>
            )}
          </div>

          <div className="space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Contoh: FM belum unlock, tunggu level 95, owner request tidak usah arena, minggu ini fokus farming..."
              className="w-full rounded-md bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />

            <div className="flex justify-end">
              <Button
                size="sm"
                variant="primary"
                onClick={handleSaveNotes}
                isLoading={isSavingNotes}
                className="gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Catatan</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Activity Matrix History */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">
              Riwayat Aktivitas (30 Hari Terakhir)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Matrix checklist aktivitas yang tersimpan di database
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px] text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 font-semibold">
                <th className="py-2.5 px-3 sticky left-0 z-10 bg-zinc-950 min-w-[160px] border-r border-zinc-800">
                  Aktivitas
                </th>
                {last30Days.map((d) => (
                  <th
                    key={d}
                    className="py-2 px-1 text-center min-w-[34px] border-r border-zinc-800/50"
                  >
                    <div className="text-[10px] font-mono text-zinc-400">
                      {formatDateShort(d)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/60">
              {activeActivities.length === 0 ? (
                <tr>
                  <td
                    colSpan={last30Days.length + 1}
                    className="py-6 text-center text-zinc-500"
                  >
                    Tidak ada aktivitas yang diatur untuk akun ini.
                  </td>
                </tr>
              ) : (
                activeActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-zinc-800/30">
                    <td className="py-2 px-3 sticky left-0 z-10 bg-zinc-900 border-r border-zinc-800 font-medium text-zinc-200 truncate max-w-[160px]">
                      {act.name}
                    </td>

                    {last30Days.map((d) => {
                      const isCompleted = logsByDateAndActivity.get(
                        `${d}_${act.id}`
                      );

                      return (
                        <td
                          key={d}
                          className="py-1.5 px-1 text-center border-r border-zinc-800/40"
                        >
                          {isCompleted ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-950/80 border border-emerald-600/80 text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-800" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
