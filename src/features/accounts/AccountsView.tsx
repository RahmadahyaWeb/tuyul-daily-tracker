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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Checkbox } from "@/components/ui/checkbox";
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

  // Credentials modal
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
      password: "",
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Accounts
        </h1>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Account</span>
        </Button>
      </div>

      {/* Toolbar */}
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
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
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
          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Paused">Paused</option>
          <option value="Finished">Finished</option>
        </select>
      </div>

      {/* Main Accounts Table */}
      <div className="rounded-md border border-border overflow-hidden bg-background">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-medium text-xs">Nickname</TableHead>
              <TableHead className="font-medium text-xs">Username</TableHead>
              <TableHead className="font-medium text-xs">Server</TableHead>
              <TableHead className="font-medium text-xs">Owner</TableHead>
              <TableHead className="font-medium text-xs">Job</TableHead>
              <TableHead className="font-medium text-xs">Level</TableHead>
              <TableHead className="font-medium text-xs">Group</TableHead>
              <TableHead className="text-center font-medium text-xs">Status</TableHead>
              <TableHead className="w-12 text-center font-medium text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-xs text-muted-foreground"
                >
                  No accounts found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((acc) => (
                <TableRow key={acc.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-sm">
                    <Link
                      href={`/accounts/${acc.id}`}
                      className="hover:underline text-foreground"
                    >
                      {acc.nickname}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {acc.username}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{acc.server}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{acc.owner}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{acc.job}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{acc.level}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {acc.group?.name || "—"}
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
                  <TableCell className="text-center py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="w-4 h-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleViewCredentials(acc)}>
                          <KeyRound className="w-3.5 h-3.5 mr-2" />
                          <span>Credentials</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEdit(acc)}>
                          <Edit2 className="w-3.5 h-3.5 mr-2" />
                          <span>Edit</span>
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
                          className="text-destructive focus:text-destructive"
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

      {/* Add / Edit Account Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingAccount ? "Edit Account" : "Add Account"}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formErrors.form && (
            <div className="p-2 rounded bg-destructive/10 text-destructive border border-destructive/20">
              {formErrors.form}
            </div>
          )}

          {/* Section 1: Account Information */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider">
              Account Information
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
                label="Owner *"
                value={formData.owner}
                onChange={(e) =>
                  setFormData({ ...formData, owner: e.target.value })
                }
                error={formErrors.owner}
                placeholder="e.g. Personal"
              />
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
                <label className="text-xs font-medium text-foreground">Group</label>
                <select
                  value={formData.groupId}
                  onChange={(e) =>
                    setFormData({ ...formData, groupId: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-9"
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
                <label className="text-xs font-medium text-foreground">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "Active" | "Paused" | "Finished",
                    })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-9"
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Finished">Finished</option>
                </select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section 2: Credentials */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider">
              Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Login Username *"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                error={formErrors.username}
                placeholder="Username"
              />
              <Input
                label={editingAccount ? "Password (leave blank to keep current)" : "Password *"}
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                error={formErrors.password}
                placeholder={editingAccount ? "••••••••" : "Password"}
              />
            </div>
          </div>

          <Separator />

          {/* Section 3: Activities Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Assigned Activities
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
                  className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, selectedActivityIds: [] })
                  }
                  className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
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
                    className="flex items-center gap-2 p-2 rounded-md border border-border transition-colors cursor-pointer hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) => {
                        if (c) {
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
                    />
                    <span className="text-xs font-medium truncate">{act.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Section 4: Notes */}
          <div className="space-y-1">
            <Textarea
              label="Notes"
              rows={2}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Optional notes..."
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
            >
              {editingAccount ? "Save Changes" : "Create Account"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Credentials Modal */}
      <Modal
        isOpen={credModal.isOpen}
        onClose={() => setCredModal((prev) => ({ ...prev, isOpen: false }))}
        title={`Credentials: ${credModal.nickname}`}
        maxWidth="sm"
      >
        <div className="space-y-3 text-xs">
          {credModal.isLoading ? (
            <div className="py-6 text-center text-muted-foreground">
              Decrypting credentials...
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Username</label>
                <div className="flex items-center justify-between p-2 bg-muted/40 border border-border rounded-md font-mono">
                  <span className="text-foreground font-medium">
                    {credModal.username}
                  </span>
                  <button
                    onClick={() => handleCopy(credModal.username, "user")}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
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
                <label className="text-xs text-muted-foreground">Password</label>
                <div className="flex items-center justify-between p-2 bg-muted/40 border border-border rounded-md font-mono">
                  <span className="text-foreground font-medium">
                    {showPassword ? credModal.password : "••••••••••••"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(credModal.password, "pass")}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
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

              <div className="pt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCredModal((prev) => ({ ...prev, isOpen: false }))}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="Delete Account?"
        description={`Are you sure you want to delete ${deleteDialog.nickname}? All activity logs for this account will be removed.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
