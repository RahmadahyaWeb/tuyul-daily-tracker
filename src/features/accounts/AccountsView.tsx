"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  createAccount,
  updateAccount,
  deleteAccount,
  toggleAccountStatus,
  getAccountCredentials,
} from "@/server/actions/accounts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDateShort } from "@/lib/date-utils";
import {
  Plus,
  Search,
  KeyRound,
  Edit2,
  Trash2,
  Play,
  Pause,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";

interface AccountItem {
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
    activityId: string;
    activity: { id: string; name: string; code: string };
  }[];
}

interface ActivityOption {
  id: string;
  name: string;
  code: string;
}

interface GroupOption {
  id: string;
  name: string;
}

interface AccountsViewProps {
  initialAccounts: AccountItem[];
  activities: ActivityOption[];
  groups: GroupOption[];
}

export function AccountsView({
  initialAccounts,
  activities,
  groups,
}: AccountsViewProps) {
  const [, startTransition] = useTransition();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountItem | null>(null);

  // Credentials view modal
  const [credModal, setCredModal] = useState<{
    isOpen: boolean;
    nickname: string;
    username: string;
    password: string;
    server: string;
    isLoading: boolean;
  }>({
    isOpen: false,
    nickname: "",
    username: "",
    password: "",
    server: "",
    isLoading: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Delete modal
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    accountId?: string;
    nickname?: string;
  }>({ isOpen: false });

  // Form inputs state
  const [formData, setFormData] = useState({
    nickname: "",
    username: "",
    password: "",
    server: "Prontera-1",
    owner: "",
    job: "",
    level: 1,
    startDate: new Date().toISOString().split("T")[0],
    status: "Active" as "Active" | "Paused" | "Finished",
    notes: "",
    groupId: "",
    selectedActivityIds: activities.map((a) => a.id), // default check all
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingAccount(null);
    setFormData({
      nickname: "",
      username: "",
      password: "",
      server: "Prontera-1",
      owner: "",
      job: "",
      level: 1,
      startDate: new Date().toISOString().split("T")[0],
      status: "Active",
      notes: "",
      groupId: "",
      selectedActivityIds: activities.map((a) => a.id),
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (acc: AccountItem) => {
    setEditingAccount(acc);
    setFormData({
      nickname: acc.nickname,
      username: acc.username,
      password: "", // leave empty to keep unchanged
      server: acc.server,
      owner: acc.owner,
      job: acc.job,
      level: acc.level,
      startDate: new Date(acc.startDate).toISOString().split("T")[0],
      status: acc.status,
      notes: acc.notes || "",
      groupId: acc.groupId || "",
      selectedActivityIds: acc.accountActivities.map((aa) => aa.activityId),
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    if (!formData.nickname.trim()) {
      setFormErrors((prev) => ({ ...prev, nickname: "Nickname wajib diisi" }));
      return;
    }
    if (!formData.username.trim()) {
      setFormErrors((prev) => ({ ...prev, username: "Username wajib diisi" }));
      return;
    }
    if (!editingAccount && !formData.password.trim()) {
      setFormErrors((prev) => ({ ...prev, password: "Password wajib diisi" }));
      return;
    }
    if (formData.selectedActivityIds.length === 0) {
      setFormErrors((prev) => ({
        ...prev,
        activities: "Pilih minimal 1 aktivitas",
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAccount) {
        const res = await updateAccount({
          id: editingAccount.id,
          nickname: formData.nickname,
          username: formData.username,
          password: formData.password || undefined,
          server: formData.server,
          owner: formData.owner,
          job: formData.job,
          level: Number(formData.level),
          startDate: formData.startDate,
          status: formData.status,
          notes: formData.notes,
          groupId: formData.groupId || null,
          activityIds: formData.selectedActivityIds,
        });
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createAccount({
          nickname: formData.nickname,
          username: formData.username,
          password: formData.password,
          server: formData.server,
          owner: formData.owner,
          job: formData.job,
          level: Number(formData.level),
          startDate: formData.startDate,
          status: formData.status,
          notes: formData.notes,
          groupId: formData.groupId || null,
          activityIds: formData.selectedActivityIds,
        });
        if (!res.success) throw new Error(res.error);
      }
      setFormModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan akun";
      setFormErrors({ form: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Credentials Modal
  const handleOpenCredentials = async (acc: AccountItem) => {
    setShowPassword(false);
    setCredModal({
      isOpen: true,
      nickname: acc.nickname,
      username: acc.username,
      password: "",
      server: acc.server,
      isLoading: true,
    });

    try {
      const res = await getAccountCredentials(acc.id);
      if (res.success && res.data) {
        setCredModal((prev) => ({
          ...prev,
          password: res.data.password,
          isLoading: false,
        }));
      } else {
        throw new Error(res.error);
      }
    } catch {
      setCredModal((prev) => ({
        ...prev,
        password: "Error loading password",
        isLoading: false,
      }));
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Quick Toggle Status
  const handleToggleStatus = (acc: AccountItem) => {
    const nextStatus = acc.status === "Active" ? "Paused" : "Active";
    startTransition(async () => {
      await toggleAccountStatus(acc.id, nextStatus);
    });
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deleteDialog.accountId) return;
    try {
      await deleteAccount(deleteDialog.accountId);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteDialog({ isOpen: false });
    }
  };

  // Filtered Accounts
  const filteredAccounts = initialAccounts.filter((acc) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        acc.nickname.toLowerCase().includes(q) ||
        acc.username.toLowerCase().includes(q) ||
        acc.owner.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== "all" && acc.status !== statusFilter) return false;
    if (groupFilter !== "all" && acc.groupId !== groupFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            Accounts
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Kelola data dan konfigurasi seluruh akun tuyul Ragnarok
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari nickname, username, owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Finished">Finished</option>
          </select>
        </div>

        {/* Group Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400">Group:</span>
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Group</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-zinc-500 text-xs ml-auto font-mono">
          Total: {filteredAccounts.length} Akun
        </span>
      </div>

      {/* Accounts Compact Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 text-xs font-semibold">
                <th className="py-3 px-4">Nickname</th>
                <th className="py-3 px-3">Username</th>
                <th className="py-3 px-3">Server</th>
                <th className="py-3 px-3">Owner</th>
                <th className="py-3 px-3">Job / Class</th>
                <th className="py-3 px-3 text-center">Level</th>
                <th className="py-3 px-3">Group</th>
                <th className="py-3 px-3">Start Date</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-zinc-500">
                    <p className="text-sm font-medium text-zinc-400">
                      No accounts yet.
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">
                      Klik tombol &quot;Add Account&quot; untuk menambahkan akun tuyul.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    {/* Nickname */}
                    <td className="py-2.5 px-4 font-semibold text-zinc-100">
                      <Link
                        href={`/accounts/${acc.id}`}
                        className="hover:text-blue-400 flex items-center gap-1 group"
                      >
                        <span>{acc.nickname}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-zinc-500" />
                      </Link>
                    </td>

                    {/* Username */}
                    <td className="py-2.5 px-3 font-mono text-zinc-300">
                      {acc.username}
                    </td>

                    {/* Server */}
                    <td className="py-2.5 px-3 text-zinc-300">{acc.server}</td>

                    {/* Owner */}
                    <td className="py-2.5 px-3 text-zinc-300">{acc.owner}</td>

                    {/* Job */}
                    <td className="py-2.5 px-3 text-zinc-300">{acc.job}</td>

                    {/* Level */}
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-zinc-200">
                      {acc.level}
                    </td>

                    {/* Group */}
                    <td className="py-2.5 px-3 text-zinc-400">
                      {acc.group?.name ? (
                        <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">
                          {acc.group.name}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Start Date */}
                    <td className="py-2.5 px-3 text-zinc-400 font-mono text-[11px]">
                      {formatDateShort(
                        new Date(acc.startDate).toISOString().split("T")[0]
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center">
                      <Badge
                        variant={
                          acc.status === "Active"
                            ? "success"
                            : acc.status === "Paused"
                            ? "warning"
                            : "neutral"
                        }
                        size="sm"
                      >
                        {acc.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Show Credentials */}
                        <button
                          type="button"
                          onClick={() => handleOpenCredentials(acc)}
                          title="Lihat & Copy Password"
                          className="p-1.5 rounded text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Pause / Play */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(acc)}
                          title={
                            acc.status === "Active"
                              ? "Pause Account"
                              : "Activate Account"
                          }
                          className="p-1.5 rounded text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                        >
                          {acc.status === "Active" ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(acc)}
                          title="Edit Account"
                          className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteDialog({
                              isOpen: true,
                              accountId: acc.id,
                              nickname: acc.nickname,
                            })
                          }
                          title="Delete Account"
                          className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Account Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingAccount ? "Edit Akun Tuyul" : "Tambah Akun Tuyul Baru"}
        description="Lengkapi data akun dan pilih aktivitas harian yang berlaku"
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formErrors.form && (
            <div className="p-2.5 rounded bg-red-950/80 border border-red-800 text-red-300 text-xs">
              {formErrors.form}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nickname *"
              value={formData.nickname}
              onChange={(e) =>
                setFormData({ ...formData, nickname: e.target.value })
              }
              error={formErrors.nickname}
              placeholder="e.g. Rynzo"
            />
            <Input
              label="Username Login *"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              error={formErrors.username}
              placeholder="e.g. rynzo_ro"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={
                editingAccount
                  ? "Password Baru (Kosongkan jika tidak diubah)"
                  : "Password Login *"
              }
              type="text"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              error={formErrors.password}
              placeholder={editingAccount ? "••••••••" : "Password akun"}
            />
            <Input
              label="Server *"
              value={formData.server}
              onChange={(e) =>
                setFormData({ ...formData, server: e.target.value })
              }
              placeholder="e.g. Prontera-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Owner *"
              value={formData.owner}
              onChange={(e) =>
                setFormData({ ...formData, owner: e.target.value })
              }
              placeholder="e.g. Rahmad / Client A"
            />
            <Input
              label="Job / Class *"
              value={formData.job}
              onChange={(e) =>
                setFormData({ ...formData, job: e.target.value })
              }
              placeholder="e.g. Assassin Cross"
            />
            <Input
              label="Level *"
              type="number"
              min={1}
              max={999}
              value={formData.level}
              onChange={(e) =>
                setFormData({ ...formData, level: Number(e.target.value) })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Start Date *"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "Active" | "Paused" | "Finished",
                  })
                }
                className="w-full rounded-md bg-zinc-900 border border-zinc-700/80 px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Finished">Finished</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Group
              </label>
              <select
                value={formData.groupId}
                onChange={(e) =>
                  setFormData({ ...formData, groupId: e.target.value })
                }
                className="w-full rounded-md bg-zinc-900 border border-zinc-700/80 px-3 py-1.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="">(Tanpa Group)</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Catatan / Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={2}
              placeholder="Contoh: FM belum unlock, tunggu level 95, fokus card..."
              className="w-full rounded-md bg-zinc-900 border border-zinc-700/80 px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Custom Activities Selector for this Account */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-300">
                Aktivitas Harian yang Berlaku untuk Akun ini *
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      selectedActivityIds: activities.map((a) => a.id),
                    })
                  }
                  className="text-blue-400 hover:underline"
                >
                  Pilih Semua
                </button>
                <span className="text-zinc-600">•</span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, selectedActivityIds: [] })
                  }
                  className="text-zinc-400 hover:underline"
                >
                  Batal Semua
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-zinc-950 p-3 rounded-md border border-zinc-800/80">
              {activities.map((act) => {
                const isChecked = formData.selectedActivityIds.includes(act.id);
                return (
                  <label
                    key={act.id}
                    className="flex items-center gap-2 text-xs text-zinc-300 hover:text-white cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            selectedActivityIds: [
                              ...formData.selectedActivityIds,
                              act.id,
                            ],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            selectedActivityIds:
                              formData.selectedActivityIds.filter(
                                (id) => id !== act.id
                              ),
                          });
                        }
                      }}
                      className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="truncate">{act.name}</span>
                  </label>
                );
              })}
            </div>
            {formErrors.activities && (
              <p className="text-xs text-red-400">{formErrors.activities}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              {editingAccount ? "Simpan Perubahan" : "Buat Akun"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Credentials Modal (Show / Hide / Copy) */}
      <Modal
        isOpen={credModal.isOpen}
        onClose={() => setCredModal((prev) => ({ ...prev, isOpen: false }))}
        title={`Credential: ${credModal.nickname}`}
        description="Data autentikasi akun Ragnarok (Reversible AES-256 Encrypted)"
        maxWidth="sm"
      >
        <div className="space-y-4">
          {credModal.isLoading ? (
            <div className="py-6 text-center text-xs text-zinc-400">
              Mengambil dan mendekripsi data credential...
            </div>
          ) : (
            <div className="space-y-3">
              {/* Server */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">
                  Server
                </label>
                <div className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-200">
                  {credModal.server}
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">
                  Username Login
                </label>
                <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5">
                  <span className="text-xs font-mono text-zinc-100">
                    {credModal.username}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(credModal.username, "username")}
                    className="text-zinc-400 hover:text-blue-400 text-xs flex items-center gap-1"
                  >
                    {copiedField === "username" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {copiedField === "username" ? "Tersalin" : "Copy"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">
                  Password Login
                </label>
                <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5">
                  <span className="text-xs font-mono text-zinc-100">
                    {showPassword ? credModal.password : "••••••••••••"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-zinc-400 hover:text-zinc-200"
                      title={showPassword ? "Sembunyikan" : "Tampilkan"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(credModal.password, "password")}
                      className="text-zinc-400 hover:text-blue-400 text-xs flex items-center gap-1"
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
          )}

          <div className="flex justify-end pt-2 border-t border-zinc-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCredModal((prev) => ({ ...prev, isOpen: false }))
              }
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="Hapus Akun Tuyul?"
        message={`Apakah Anda yakin ingin menghapus akun ${deleteDialog.nickname}? Seluruh riwayat aktivitas checklist akun ini juga akan dihapus.`}
        confirmText="Ya, Hapus Akun"
        variant="danger"
      />
    </div>
  );
}
