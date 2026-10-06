"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  createAccount,
  updateAccount,
  deleteAccount,
  toggleAccountStatus,
} from "@/server/actions/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
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
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  KeyRound,
  Edit2,
  Trash2,
  Play,
  Pause,
  Copy,
  Check,
  Eye,
  EyeOff,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanLimitDialog } from "@/components/shared/PlanLimitDialog";
import { toast } from "sonner";
import { AppPage } from "@/components/shared/AppPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageToolbar } from "@/components/shared/PageToolbar";
import { DataTablePagination } from "@/components/shared/DataTablePagination";

interface AccountItem {
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountItem | null>(null);
  const [planLimitOpen, setPlanLimitOpen] = useState(false);

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
    job: "",
    level: 1,
    startDate: new Date().toISOString().split("T")[0],
    status: "Active" as "Active" | "Paused" | "Finished",
    notes: "",
    groupId: "",
    selectedActivityIds: activities.map((a) => a.id),
  });

  const [showFormPassword, setShowFormPassword] = useState(false);
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

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setEditingAccount(null);
    setShowFormPassword(false);
    setFormData({
      nickname: "",
      username: "",
      password: "",
      server: "Prontera-1",
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
    setShowFormPassword(false);
    setFormData({
      nickname: acc.nickname,
      username: acc.username,
      password: "",
      server: acc.server,
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

  const handleActivityCheckbox = (actId: string) => {
    setFormData((prev) => {
      const exists = prev.selectedActivityIds.includes(actId);
      const next = exists
        ? prev.selectedActivityIds.filter((id) => id !== actId)
        : [...prev.selectedActivityIds, actId];
      return { ...prev, selectedActivityIds: next };
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.nickname.trim()) errors.nickname = "Nickname is required";
    if (!formData.username.trim()) errors.username = "Username is required";
    if (!formData.job.trim()) errors.job = "Job is required";
    if (!formData.server.trim()) errors.server = "Server is required";
    if (formData.selectedActivityIds.length === 0) {
      errors.activities = "Select at least 1 activity";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingAccount) {
        const payload: any = {
          id: editingAccount.id,
          nickname: formData.nickname,
          username: formData.username,
          server: formData.server,
          job: formData.job,
          level: formData.level,
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
        if (!res.success) {
          const errMsg = res.error || "Failed to update account";
          setFormErrors({ form: errMsg });
          toast.error(errMsg);
          return;
        }
        toast.success(`Character "${formData.nickname}" updated successfully!`);
      } else {
        const res: any = await createAccount({
          nickname: formData.nickname,
          username: formData.username,
          password: formData.password.trim() || undefined,
          server: formData.server,
          job: formData.job,
          level: formData.level,
          startDate: formData.startDate,
          status: formData.status,
          notes: formData.notes,
          groupId: formData.groupId || null,
          activityIds: formData.selectedActivityIds,
        });
        if (!res.success) {
          if (res.planLimitReached) {
            setFormModalOpen(false);
            setPlanLimitOpen(true);
            toast.warning("Free plan account limit reached. Please upgrade to Pro.");
            return;
          }
          const errMsg = res.error || "Failed to create account";
          setFormErrors({ form: errMsg });
          toast.error(errMsg);
          return;
        }
        toast.success(`Character "${formData.nickname}" created successfully!`);
      }

      setFormModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Paused" : "Active";
    startTransition(async () => {
      const res = await toggleAccountStatus(id, nextStatus as "Active" | "Paused");
      if (res && res.success) {
        toast.success(`Account status changed to ${nextStatus}`);
      } else {
        toast.error("Failed to update account status");
      }
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.accountId) return;
    try {
      const res = await deleteAccount(deleteDialog.accountId);
      if (res && res.success) {
        toast.success(`Character "${deleteDialog.nickname || ""}" deleted.`);
      } else {
        toast.error("Failed to delete character");
      }
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
        (acc.group?.name && acc.group.name.toLowerCase().includes(q)) ||
        acc.job.toLowerCase().includes(q) ||
        acc.server.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (statusFilter !== "all" && acc.status !== statusFilter) return false;
    if (groupFilter !== "all" && acc.groupId !== groupFilter) return false;

    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, groupFilter, statusFilter]);

  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <AppPage>
      {/* Unified Page Header */}
      <PageHeader
        title="Accounts"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Account</span>
          </Button>
        }
      />

      {/* Unified Page Toolbar */}
      <PageToolbar>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a7b68]" />
          <input
            type="text"
            placeholder="Search accounts, username, group..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-xs border border-[#cfc3b0] bg-white pl-8 pr-3 text-xs text-[#2c261e] placeholder:text-[#9c8e7b] focus:outline-none focus:border-[#3B6EA8] shadow-[1px_1px_0px_#e5ddd0]"
          />
        </div>

        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="h-8 rounded-xs border border-[#cfc3b0] bg-white px-2.5 text-xs text-[#3d3326] focus:outline-none cursor-pointer shadow-[1px_1px_0px_#e5ddd0]"
        >
          <option value="all">All Groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 rounded-xs border border-[#cfc3b0] bg-white px-2.5 text-xs text-[#3d3326] focus:outline-none cursor-pointer shadow-[1px_1px_0px_#e5ddd0]"
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active Only</option>
          <option value="Paused">Paused</option>
          <option value="Finished">Finished</option>
        </select>
      </PageToolbar>

      {/* Main Accounts Table */}
      <div className="rounded-xs border border-[#cfbeaa] bg-white shadow-[2px_2px_0px_#ded5c5] overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[750px]">
            <TableHeader className="bg-[#F4EFE6] border-b border-[#ded4c4]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 pl-4 font-sans">
                  Character Nickname
                </TableHead>
                <TableHead className="text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 font-sans">
                  Username
                </TableHead>
                <TableHead className="text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 font-sans">
                  Password
                </TableHead>
                <TableHead className="text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 font-sans">
                  Job / Class
                </TableHead>
                <TableHead className="text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 font-sans">
                  Server
                </TableHead>
                <TableHead className="text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 font-sans">
                  Group
                </TableHead>
                <TableHead className="text-center text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 font-sans">
                  Status
                </TableHead>
                <TableHead className="w-12 text-right text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 pr-4 font-sans">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-32 text-center text-xs text-slate-400 py-8"
                  >
                    No accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAccounts.map((acc) => (
                  <TableRow key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell className="py-3 pl-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={acc.nickname} size="sm" />
                        <div>
                          <Link
                            href={`/accounts/${acc.id}`}
                            className="font-semibold text-xs text-slate-900 hover:text-indigo-600 hover:underline block leading-tight"
                          >
                            {acc.nickname}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Lv.{acc.level}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-slate-800">
                          {acc.username}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(acc.username, "Username", `acc-user-${acc.id}`)}
                          className="p-1 rounded-xs hover:bg-[#ebd7b2]/50 text-[#8a7b68] hover:text-[#231b12] cursor-pointer transition-colors"
                          title="Copy Username"
                        >
                          {copiedField === `acc-user-${acc.id}` ? (
                            <Check className="w-3.5 h-3.5 text-[#1E5D2F]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      {acc.password ? (
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs text-slate-600 tracking-wider">
                            {visiblePasswords[acc.id] ? acc.password : "••••••"}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(acc.id)}
                            className="p-1 rounded-xs hover:bg-[#ebd7b2]/50 text-[#8a7b68] hover:text-[#231b12] cursor-pointer"
                            title={visiblePasswords[acc.id] ? "Hide Password" : "Show Password"}
                          >
                            {visiblePasswords[acc.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(acc.password || "", "Password", `acc-pass-${acc.id}`)}
                            className="p-1 rounded-xs hover:bg-[#ebd7b2]/50 text-[#8a7b68] hover:text-[#231b12] cursor-pointer"
                            title="Copy Password"
                          >
                            {copiedField === `acc-pass-${acc.id}` ? (
                              <Check className="w-3.5 h-3.5 text-[#1E5D2F]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 italic">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span>{acc.job}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Lv.{acc.level}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-slate-500 font-medium">
                      {acc.server}
                    </TableCell>

                    <TableCell className="text-xs text-slate-500">
                      {acc.group?.name ? (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                          {acc.group.name}
                        </Badge>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
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
                    </TableCell>

                    <TableCell className="text-right py-2 pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-800">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => handleCopy(acc.username, "Username", `acc-user-${acc.id}`)}>
                            <Copy className="w-3.5 h-3.5 mr-2" />
                            <span>Copy Username</span>
                          </DropdownMenuItem>
                          {acc.password && (
                            <DropdownMenuItem onClick={() => handleCopy(acc.password || "", "Password", `acc-pass-${acc.id}`)}>
                              <KeyRound className="w-3.5 h-3.5 mr-2" />
                              <span>Copy Password</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleOpenEdit(acc)}>
                            <Edit2 className="w-3.5 h-3.5 mr-2" />
                            <span>Edit Account</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(acc.id, acc.status)}>
                            {acc.status === "Active" ? (
                              <>
                                <Pause className="w-3.5 h-3.5 mr-2" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 mr-2" />
                                <span>Activate</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                            onClick={() =>
                              setDeleteDialog({
                                isOpen: true,
                                accountId: acc.id,
                                nickname: acc.nickname,
                              })
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination
          currentPage={currentPage}
          totalItems={filteredAccounts.length}
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

      {/* Add / Edit Account Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingAccount ? `Edit "${editingAccount.nickname}"` : "Add New Account"}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formErrors.form && (
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
              {formErrors.form}
            </div>
          )}

          {/* Section 1: Account Information */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              Character Information
            </h3>
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
                label="Login Username *"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                error={formErrors.username}
                placeholder="Game username"
              />
              <div className="relative">
                <Input
                  label="Password (Optional)"
                  type={showFormPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    editingAccount
                      ? "Leave blank to keep existing password"
                      : "Optional account password"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowFormPassword(!showFormPassword)}
                  className="absolute right-2.5 top-[27px] p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title={showFormPassword ? "Hide password" : "Show password"}
                >
                  {showFormPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <Input
                label="Job / Class *"
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
                  label="Server *"
                  value={formData.server}
                  onChange={(e) =>
                    setFormData({ ...formData, server: e.target.value })
                  }
                  error={formErrors.server}
                  placeholder="Prontera-1"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Group Category</label>
                <select
                  value={formData.groupId}
                  onChange={(e) =>
                    setFormData({ ...formData, groupId: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 h-9 shadow-2xs"
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
                <label className="text-xs font-semibold text-slate-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "Active" | "Paused" | "Finished",
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 h-9 shadow-2xs"
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Finished">Finished</option>
                </select>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-100" />

          {/* Section 3: Activities Checklist */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
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
                  className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer font-medium"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, selectedActivityIds: [] })
                  }
                  className="text-xs text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {formErrors.activities && (
              <p className="text-xs text-rose-600">{formErrors.activities}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-slate-200/80 rounded-lg p-3 bg-slate-50/50 max-h-48 overflow-y-auto">
              {activities.map((act) => {
                const isSelected = formData.selectedActivityIds.includes(act.id);
                return (
                  <label
                    key={act.id}
                    onClick={() => handleActivityCheckbox(act.id)}
                    className={cn(
                      "flex items-center gap-2 p-1.5 rounded-md border cursor-pointer transition-colors text-xs select-none",
                      isSelected
                        ? "bg-white border-indigo-200 text-slate-900 shadow-2xs font-medium"
                        : "border-transparent text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => {}}
                    />
                    <span className="truncate">{act.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <Separator className="bg-slate-100" />

          {/* Section 4: Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Notes / Remarks</label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="e.g. Auto-potion settings, hunting target, or special equipment"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingAccount ? "Save Changes" : "Create Account"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={`Delete "${deleteDialog.nickname}"?`}
        description="Are you sure you want to delete this account? This action cannot be undone and will delete all associated activity logs."
        confirmLabel="Delete Account"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false })}
      />

      {/* Plan Limit Upgrade Dialog */}
      <PlanLimitDialog
        open={planLimitOpen}
        onOpenChange={setPlanLimitOpen}
      />
    </AppPage>
  );
}
