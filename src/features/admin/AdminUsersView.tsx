"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  updateUserPlanAction,
  updateUserRoleAction,
  adminResetUserPasswordAction,
} from "@/server/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  Shield,
  CreditCard,
  Search,
  MoreHorizontal,
  Bot,
  Calendar,
  Check,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";

interface AdminUserItem {
  id: string;
  username: string;
  role: "ADMIN" | "USER";
  plan: "FREE" | "PRO";
  createdAt: string;
  accountCount: number;
}

interface AdminUsersViewProps {
  initialUsers: AdminUserItem[];
  stats: {
    totalUsers: number;
    totalAccounts: number;
    pendingBilling: number;
    proSubscribers: number;
  };
}

export function AdminUsersView({ initialUsers, stats }: AdminUsersViewProps) {
  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleUpdatePlan = (userId: string, newPlan: "FREE" | "PRO") => {
    startTransition(async () => {
      const res = await updateUserPlanAction(userId, newPlan);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u))
        );
        toast.success(`User plan updated to ${newPlan}`);
      } else {
        toast.error(res.error || "Failed to update plan");
      }
    });
  };

  const handleUpdateRole = (userId: string, newRole: "USER" | "ADMIN") => {
    startTransition(async () => {
      const res = await updateUserRoleAction(userId, newRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        toast.success(`User role updated to ${newRole}`);
      } else {
        toast.error(res.error || "Failed to update role");
      }
    });
  };

  // Reset Password Modal State
  const [resetModalUser, setResetModalUser] = useState<AdminUserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const generateRandomPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
    setShowPassword(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsResetting(true);
    try {
      const res = await adminResetUserPasswordAction(resetModalUser.id, newPassword);
      if (res.success) {
        toast.success(res.message || `Password for @${resetModalUser.username} has been reset.`);
        setResetModalUser(null);
        setNewPassword("");
      } else {
        toast.error(res.error || "Failed to reset password.");
      }
    } catch {
      toast.error("An unexpected error occurred while resetting password.");
    } finally {
      setIsResetting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!u.username.toLowerCase().includes(q)) return false;
    }
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (planFilter !== "all" && u.plan !== planFilter) return false;
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, planFilter]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              User Management
            </h1>
            <Badge variant="outline" className="text-[10px] uppercase font-mono">
              Admin Console
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor registered users, character account counts, and subscription plans
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/billing">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-1.5 relative"
            >
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
              <span>Billing Approvals</span>
              {stats.pendingBilling > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {stats.pendingBilling}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Total Users
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Total Tuyul Accounts
            </span>
            <Bot className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalAccounts}</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Pro Subscribers
            </span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            {stats.proSubscribers}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Pending Approvals
            </span>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {stats.pendingBilling}
          </p>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-2xs"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
        >
          <option value="all">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
        >
          <option value="all">All Plans</option>
          <option value="FREE">Free Plan</option>
          <option value="PRO">Pro Plan</option>
        </select>

        <div className="ml-auto text-xs text-slate-400">
          Showing <strong>{filteredUsers.length}</strong> of{" "}
          <strong>{users.length}</strong> users
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200/70">
            <TableRow>
              <TableHead className="py-2.5 pl-4 text-xs font-bold text-slate-600">
                User
              </TableHead>
              <TableHead className="py-2.5 text-xs font-bold text-slate-600">
                Role
              </TableHead>
              <TableHead className="py-2.5 text-xs font-bold text-slate-600">
                Plan
              </TableHead>
              <TableHead className="py-2.5 text-xs font-bold text-slate-600 text-center">
                Tuyul Count
              </TableHead>
              <TableHead className="py-2.5 text-xs font-bold text-slate-600">
                Registered
              </TableHead>
              <TableHead className="py-2.5 pr-4 text-xs font-bold text-slate-600 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-xs text-slate-400 py-8"
                >
                  No users found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((u) => (
                <TableRow
                  key={u.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <TableCell className="py-3 pl-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.username} size="sm" />
                      <div>
                        <span className="font-semibold text-xs text-slate-900 block leading-tight">
                          {u.username}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {u.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <Badge
                      variant={u.role === "ADMIN" ? "default" : "outline"}
                      className="text-[10px] py-0 px-2 font-medium"
                    >
                      {u.role === "ADMIN" && (
                        <Shield className="w-2.5 h-2.5 mr-1 text-indigo-300" />
                      )}
                      {u.role}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3">
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.plan === "PRO" || u.role === "ADMIN"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {u.plan === "PRO" || u.role === "ADMIN" ? (
                        <>
                          <Sparkles className="w-2.5 h-2.5 mr-1 text-indigo-600" />
                          PRO
                        </>
                      ) : (
                        "FREE"
                      )}
                    </span>
                  </TableCell>

                  <TableCell className="py-3 text-center">
                    <span className="font-mono text-xs font-semibold text-slate-800">
                      {u.accountCount}
                    </span>
                  </TableCell>

                  <TableCell className="py-3 text-xs text-slate-500">
                    <span title={new Date(u.createdAt).toLocaleString("id-ID")}>
                      {new Date(u.createdAt).toLocaleDateString("id-ID", {
                        dateStyle: "medium",
                      })}
                    </span>
                  </TableCell>

                  <TableCell className="py-3 pr-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-slate-700"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 text-xs">
                        <DropdownMenuLabel className="text-[10px] text-slate-400 uppercase font-semibold">
                          Manage User
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {u.plan === "FREE" ? (
                          <DropdownMenuItem
                            onClick={() => handleUpdatePlan(u.id, "PRO")}
                            disabled={isPending}
                            className="cursor-pointer text-indigo-600 font-medium"
                          >
                            <Sparkles className="w-3.5 h-3.5 mr-2" />
                            <span>Upgrade to Pro Plan</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleUpdatePlan(u.id, "FREE")}
                            disabled={isPending || u.role === "ADMIN"}
                            className="cursor-pointer text-slate-600"
                          >
                            <span>Downgrade to Free Plan</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        {u.role === "USER" ? (
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(u.id, "ADMIN")}
                            disabled={isPending}
                            className="cursor-pointer text-slate-700"
                          >
                            <Shield className="w-3.5 h-3.5 mr-2 text-indigo-600" />
                            <span>Promote to Admin</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(u.id, "USER")}
                            disabled={isPending}
                            className="cursor-pointer text-amber-700"
                          >
                            <span>Demote to User</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => {
                            setResetModalUser(u);
                            setNewPassword("");
                            setShowPassword(false);
                          }}
                          className="cursor-pointer text-amber-700 hover:text-amber-800 font-medium"
                        >
                          <KeyRound className="w-3.5 h-3.5 mr-2 text-amber-600" />
                          <span>Reset Password</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          itemLabel="users"
        />
      </div>

      {/* Reset Password Dialog */}
      <Dialog
        open={!!resetModalUser}
        onOpenChange={(open) => {
          if (!open) {
            setResetModalUser(null);
            setNewPassword("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Reset User Password
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Set a new password for <strong className="text-slate-800">@{resetModalUser?.username}</strong>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  New Password
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Generate Random
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 6 characters..."
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-2xs font-mono"
                  autoFocus
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                User @{resetModalUser?.username} will immediately be able to log in with this new password.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResetModalUser(null)}
                disabled={isResetting}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isResetting || !newPassword || newPassword.length < 6}
                className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white font-medium"
              >
                {isResetting ? "Updating..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
