"use client";

import React, { useState, useTransition } from "react";
import {
  approveBillingRequestAction,
  rejectBillingRequestAction,
} from "@/server/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowLeft,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface BillingRequestItem {
  id: string;
  userId: string;
  username: string;
  plan: string;
  currentUserPlan: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminBillingViewProps {
  initialRequests: BillingRequestItem[];
}

export function AdminBillingView({ initialRequests }: AdminBillingViewProps) {
  const [requests, setRequests] = useState<BillingRequestItem[]>(initialRequests);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleApprove = (requestId: string, username: string) => {
    startTransition(async () => {
      const res = await approveBillingRequestAction(requestId);
      if (res.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: "APPROVED" } : r))
        );
        toast.success(`Approved Pro plan upgrade for @${username}`);
      } else {
        toast.error(res.error || "Failed to approve request");
      }
    });
  };

  const handleReject = (requestId: string, username: string) => {
    startTransition(async () => {
      const res = await rejectBillingRequestAction(requestId);
      if (res.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: "REJECTED" } : r))
        );
        toast.info(`Rejected upgrade request for @${username}`);
      } else {
        toast.error(res.error || "Failed to reject request");
      }
    });
  };

  const filteredRequests = requests.filter((r) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!r.username.toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to User Management</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Billing & Subscription Approvals
              </h1>
              {pendingCount > 0 && (
                <Badge variant="warning" size="sm">
                  {pendingCount} Pending
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and approve user upgrade requests to activate paid subscriptions
            </p>
          </div>
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

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("PENDING")}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              statusFilter === "PENDING"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("APPROVED")}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              statusFilter === "APPROVED"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Approved
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("REJECTED")}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              statusFilter === "REJECTED"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200/70">
            <TableRow>
              <TableHead className="py-2.5 pl-4 text-xs font-bold text-slate-600">
                User
              </TableHead>
              <TableHead className="py-2.5 text-xs font-bold text-slate-600">
                Requested Plan
              </TableHead>
              <TableHead className="py-2.5 text-xs font-bold text-slate-600">
                Notes / Proof
              </TableHead>
              <TableHead className="py-2.5 text-xs font-bold text-slate-600">
                Date Requested
              </TableHead>
              <TableHead className="py-2.5 text-xs font-bold text-slate-600 text-center">
                Status
              </TableHead>
              <TableHead className="py-2.5 pr-4 text-xs font-bold text-slate-600 text-right">
                Decision
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-100">
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-xs text-slate-400 py-8"
                >
                  No billing upgrade requests found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((req) => (
                <TableRow
                  key={req.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <TableCell className="py-3 pl-4">
                    <span className="font-semibold text-xs text-slate-900 block">
                      @{req.username}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Current: {req.currentUserPlan}
                    </span>
                  </TableCell>

                  <TableCell className="py-3">
                    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      <Sparkles className="w-2.5 h-2.5 mr-1 text-indigo-600" />
                      {req.plan} PLAN ($9/mo)
                    </span>
                  </TableCell>

                  <TableCell className="py-3 text-xs text-slate-600 max-w-xs truncate">
                    {req.notes || <span className="text-slate-300 italic">No notes provided</span>}
                  </TableCell>

                  <TableCell className="py-3 text-xs text-slate-500">
                    <span title={new Date(req.createdAt).toLocaleString("id-ID")}>
                      {new Date(req.createdAt).toLocaleDateString("id-ID", {
                        dateStyle: "medium",
                      })}
                    </span>
                  </TableCell>

                  <TableCell className="py-3 text-center">
                    <Badge
                      variant={
                        req.status === "APPROVED"
                          ? "success"
                          : req.status === "PENDING"
                          ? "warning"
                          : "destructive"
                      }
                      size="sm"
                    >
                      {req.status === "PENDING" && (
                        <Clock className="w-2.5 h-2.5 mr-1" />
                      )}
                      {req.status === "APPROVED" && (
                        <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                      )}
                      {req.status === "REJECTED" && (
                        <XCircle className="w-2.5 h-2.5 mr-1" />
                      )}
                      {req.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3 pr-4 text-right">
                    {req.status === "PENDING" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(req.id, req.username)}
                          disabled={isPending}
                          className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(req.id, req.username)}
                          disabled={isPending}
                          className="h-7 text-xs px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Processed
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
