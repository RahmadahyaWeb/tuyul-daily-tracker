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
import { cn } from "@/lib/utils";
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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");

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

  // Form state
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
    selectedActivityIds: activities.map((a) => a.id),
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleOpenEdit = (acc: AccountItem) => {
    setEditingAccount(acc);
    setFormData({
      nickname: acc.nickname,
      username: acc.username,
      password: "", // blank unless updating
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errors: Record<string, string> = {};
    if (!formData.nickname.trim()) errors.nickname = "Nickname is required";
    if (!formData.username.trim()) errors.username = "Username is required";
    if (!editingAccount && !formData.password) errors.password = "Password is required";
    if (!formData.server.trim()) errors.server = "Server is required";
    if (!formData.owner.trim()) errors.owner = "Owner is required";
    if (!formData.job.trim()) errors.job = "Job is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAccount) {
        const payload: Parameters<typeof updateAccount>[0] = {
          id: editingAccount.id,
          nickname: formData.nickname,
          username: formData.username,
          server: formData.server,
          owner: formData.owner,
          job: formData.job,
          level: Number(formData.level),
          startDate: formData.startDate,
          status: formData.status,
          notes: formData.notes,
          groupId: formData.groupId || null,
          activityIds: formData.selectedActivityIds,
        };
        if (formData.password.trim()) {
          payload.password = formData.password.trim();
        }

        const res = await updateAccount(payload);
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
      setFormErrors({
        form: err instanceof Error ? err.message : "Failed to save account",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Paused" : "Active";
    startTransition(async () => {
      await toggleAccountStatus(id, nextStatus as "Active" | "Paused");
    });
  };

  const handleViewCredentials = async (acc: AccountItem) => {
    setShowPassword(false);
    setCredModal({
      isOpen: true,
      nickname: acc.nickname,
      username: acc.username,
      password: "",
      server: acc.server,
      isLoading: true,
    });

    const res = await getAccountCredentials(acc.id);
    if (res.success && res.data) {
      setCredModal({
        isOpen: true,
        nickname: acc.nickname,
        username: res.data.username,
        password: res.data.password,
        server: res.data.server,
        isLoading: false,
      });
    } else {
      setCredModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.accountId) return;
    try {
      await deleteAccount(deleteDialog.accountId);
    } finally {
      setDeleteDialog({ isOpen: false });
    }
  };

  const filteredAccounts = initialAccounts.filter((acc) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        acc.nickname.toLowerCase().includes(q) ||
        acc.username.toLowerCase().includes(q) ||
        acc.owner.toLowerCase().includes(q) ||
        acc.job.toLowerCase().includes(q) ||
        acc.server.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (statusFilter !== "all" && acc.status !== statusFilter) return false;
    if (groupFilter !== "all" && acc.groupId !== groupFilter) return false;

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Accounts
          </h1>
          <p className="text-xs text-gray-500">
            Manage Ragnarok tuyul accounts and custom activities
          </p>
        </div>
        <div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Account</span>
          </Button>
        </div>
      </div>

      {/* Flat Toolbar */}
      <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 h-8 shadow-2xs cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Paused">Paused</option>
          <option value="Finished">Finished</option>
        </select>

        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:border-blue-500 h-8 shadow-2xs cursor-pointer"
        >
          <option value="all">All Groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Accounts Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-xs font-semibold">
                <th className="py-2.5 px-3.5">Nickname</th>
                <th className="py-2.5 px-3">Username</th>
                <th className="py-2.5 px-3">Server</th>
                <th className="py-2.5 px-3">Owner</th>
                <th className="py-2.5 px-3">Job / Level</th>
                <th className="py-2.5 px-3">Group</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Activities</th>
                <th className="py-2.5 px-3 text-center w-28">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-400">
                    No accounts found.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    {/* Nickname */}
                    <td className="py-2.5 px-3.5">
                      <Link
                        href={`/accounts/${acc.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-1 group"
                      >
                        <span>{acc.nickname}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-gray-400" />
                      </Link>
                    </td>

                    {/* Username */}
                    <td className="py-2.5 px-3 font-mono text-gray-600">
                      {acc.username}
                    </td>

                    {/* Server */}
                    <td className="py-2.5 px-3 text-gray-700">{acc.server}</td>

                    {/* Owner */}
                    <td className="py-2.5 px-3 text-gray-700">{acc.owner}</td>

                    {/* Job & Level */}
                    <td className="py-2.5 px-3 text-gray-700">
                      <span>{acc.job}</span>
                      <span className="text-gray-400 text-[11px] ml-1">
                        (Lv.{acc.level})
                      </span>
                    </td>

                    {/* Group */}
                    <td className="py-2.5 px-3">
                      {acc.group ? (
                        <span className="text-gray-700 font-medium">
                          {acc.group.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
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

                    {/* Activities */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-xs text-gray-600 font-mono">
                        {acc.accountActivities.length} assigned
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleViewCredentials(acc)}
                          title="Show Credentials"
                          className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(acc.id, acc.status)}
                          title={
                            acc.status === "Active" ? "Pause Account" : "Activate Account"
                          }
                          className="p-1 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          {acc.status === "Active" ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(acc)}
                          title="Edit Account"
                          className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
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
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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

      {/* Add / Edit Account Modal (Clean grouped sections without nested cards) */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingAccount ? `Edit Account: ${editingAccount.nickname}` : "Add New Account"}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formErrors.form && (
            <div className="p-2 rounded bg-red-50 border border-red-200 text-red-600">
              {formErrors.form}
            </div>
          )}

          {/* Section 1: Account Information */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-1">
              Account Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nickname"
                required
                value={formData.nickname}
                onChange={(e) =>
                  setFormData({ ...formData, nickname: e.target.value })
                }
                error={formErrors.nickname}
                placeholder="e.g. Rynzo"
              />
              <Input
                label="Owner"
                required
                value={formData.owner}
                onChange={(e) =>
                  setFormData({ ...formData, owner: e.target.value })
                }
                error={formErrors.owner}
                placeholder="e.g. Personal / Client A"
              />
              <Input
                label="Job / Class"
                required
                value={formData.job}
                onChange={(e) =>
                  setFormData({ ...formData, job: e.target.value })
                }
                error={formErrors.job}
                placeholder="e.g. Assassin Cross"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Level"
                  type="number"
                  min={1}
                  max={200}
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: parseInt(e.target.value) || 1 })
                  }
                />
                <Input
                  label="Server"
                  required
                  value={formData.server}
                  onChange={(e) =>
                    setFormData({ ...formData, server: e.target.value })
                  }
                  error={formErrors.server}
                  placeholder="Prontera-1"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-medium text-gray-700">Group</label>
                <select
                  value={formData.groupId}
                  onChange={(e) =>
                    setFormData({ ...formData, groupId: e.target.value })
                  }
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 h-8"
                >
                  <option value="">No Group</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "Active" | "Paused" | "Finished",
                    })
                  }
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500 h-8"
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Finished">Finished</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Credentials (AES-256-GCM encrypted) */}
          <div className="space-y-2 pt-2">
            <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-1">
              Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Login Username"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                error={formErrors.username}
                placeholder="Game username / email"
              />
              <Input
                label={editingAccount ? "Password (leave blank to keep current)" : "Password"}
                type="password"
                required={!editingAccount}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                error={formErrors.password}
                placeholder={editingAccount ? "••••••••" : "Game account password"}
              />
            </div>
          </div>

          {/* Section 3: Activities Checklist Assignment */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between border-b border-gray-100 pb-1">
              <h3 className="font-semibold text-gray-900">
                Assigned Daily Activities
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      selectedActivityIds: activities.map((a) => a.id),
                    })
                  }
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, selectedActivityIds: [] })
                  }
                  className="text-[11px] text-gray-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activities.map((act) => {
                const checked = formData.selectedActivityIds.includes(act.id);
                return (
                  <label
                    key={act.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded border transition-colors cursor-pointer select-none",
                      checked
                        ? "bg-blue-50/60 border-blue-200 text-blue-900"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
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
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium truncate">{act.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Notes */}
          <div className="space-y-1 pt-2">
            <label className="block font-medium text-gray-700">Notes (Optional)</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="e.g. Farm target, pin code, gear notes..."
              className="w-full bg-white border border-gray-200 rounded-md p-2 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setFormModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              {editingAccount ? "Save Changes" : "Create Account"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Credentials Reveal Modal */}
      <Modal
        isOpen={credModal.isOpen}
        onClose={() => setCredModal((prev) => ({ ...prev, isOpen: false }))}
        title={`Credentials: ${credModal.nickname}`}
        maxWidth="sm"
      >
        <div className="space-y-3 text-xs">
          {credModal.isLoading ? (
            <div className="py-6 text-center text-gray-500">
              Decrypting credentials securely...
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-gray-500">Username / ID</label>
                <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md font-mono">
                  <span className="text-gray-900 font-medium">
                    {credModal.username}
                  </span>
                  <button
                    onClick={() => handleCopy(credModal.username, "user")}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    {copiedField === "user" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500">Password</label>
                <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md font-mono">
                  <span className="text-gray-900 font-medium">
                    {showPassword ? credModal.password : "••••••••••••"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopy(credModal.password, "pass")}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      {copiedField === "pass" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-500">Server</label>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-md font-mono text-gray-700">
                  {credModal.server}
                </div>
              </div>
            </>
          )}

          <div className="pt-2 flex justify-end border-t border-gray-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setCredModal((prev) => ({ ...prev, isOpen: false }))
              }
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={`Delete Account: ${deleteDialog.nickname}?`}
        message="Are you sure you want to delete this account? All associated daily activity logs will be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
