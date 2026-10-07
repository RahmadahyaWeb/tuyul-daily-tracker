"use client";

import React, { useState, useTransition } from "react";
import {
  createActivity,
  updateActivity,
  toggleActivityStatus,
  deleteActivity,
  reorderActivities,
} from "@/server/actions/activities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  ListChecks,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AppPage } from "@/components/shared/AppPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTablePagination } from "@/components/shared/DataTablePagination";

interface ActivityItem {
  id: string;
  name: string;
  code: string;
  activityType?: "DAILY" | "WEEKLY";
  sortOrder: number;
  isActive: boolean;
  _count?: {
    accountActivities: number;
  };
}

interface ActivitiesViewProps {
  initialActivities: ActivityItem[];
}

export function ActivitiesView({ initialActivities }: ActivitiesViewProps) {
  const [, startTransition] = useTransition();
  const [activities, setActivities] = useState(initialActivities);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  React.useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    activityType: "DAILY" as "DAILY" | "WEEKLY",
    sortOrder: 0,
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    activityId?: string;
    activityName?: string;
  }>({ isOpen: false });

  const handleOpenCreate = () => {
    setEditingActivity(null);
    setFormData({
      name: "",
      code: "",
      activityType: "DAILY",
      sortOrder: activities.length,
      isActive: true,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (act: ActivityItem) => {
    setEditingActivity(act);
    setFormData({
      name: act.name,
      code: act.code,
      activityType: act.activityType || "DAILY",
      sortOrder: act.sortOrder,
      isActive: act.isActive,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.code.trim()) errors.code = "Code is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingActivity) {
        const res = await updateActivity({
          id: editingActivity.id,
          name: formData.name,
          code: formData.code,
          activityType: formData.activityType,
          sortOrder: Number(formData.sortOrder),
          isActive: formData.isActive,
        });
        if (!res.success) throw new Error(res.error);
        toast.success(`Activity "${formData.name}" updated!`);
      } else {
        const res = await createActivity({
          name: formData.name,
          code: formData.code,
          activityType: formData.activityType,
          sortOrder: Number(formData.sortOrder),
          isActive: formData.isActive,
        });
        if (!res.success) throw new Error(res.error);
        toast.success(`Activity "${formData.name}" created!`);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to save activity";
      setFormErrors({ form: errMsg });
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleActivityStatus(id, !currentStatus);
      if (res && res.success) {
        toast.success(`Activity status updated to ${!currentStatus ? "Active" : "Inactive"}`);
      } else {
        toast.error("Failed to update activity status");
      }
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activities.length) return;

    const newOrder = [...activities];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setActivities(newOrder);

    startTransition(async () => {
      await reorderActivities(
        newOrder.map((a, i) => ({ id: a.id, sortOrder: i }))
      );
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.activityId) return;
    try {
      const res = await deleteActivity(deleteDialog.activityId);
      if (res && res.success) {
        toast.success(`Activity "${deleteDialog.activityName || ""}" deleted.`);
      } else {
        toast.error("Failed to delete activity");
      }
    } finally {
      setDeleteDialog({ isOpen: false });
    }
  };

  return (
    <AppPage>
      {/* Unified Page Header */}
      <PageHeader
        title="Activities"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Activity</span>
          </Button>
        }
      />

      {/* DESKTOP TABLE (hidden on mobile < md) */}
      <div className="hidden md:block rounded-xs border border-[#cfbeaa] bg-white shadow-[2px_2px_0px_#ded5c5] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F4EFE6] border-b border-[#ded4c4]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16 text-center text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 font-sans">
                  Order
                </TableHead>
                <TableHead className="text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 font-sans">
                  Activity Name
                </TableHead>
                <TableHead className="text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 font-sans">
                  Short Code
                </TableHead>
                <TableHead className="text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 font-sans">
                  Type
                </TableHead>
                <TableHead className="text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 font-sans">
                  Assigned Accounts
                </TableHead>
                <TableHead className="text-center text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 font-sans">
                  Status
                </TableHead>
                <TableHead className="w-24 text-right text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 pr-4 font-sans">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-[#eee7dc]">
              {activities.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-28 text-center text-xs text-[#8a7b68] py-6"
                  >
                    No activities configured yet. Click &quot;Add Activity&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                activities
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((act, localIndex) => {
                    const globalIndex = (currentPage - 1) * pageSize + localIndex;
                    return (
                  <TableRow key={act.id} className="hover:bg-[#FAF6F0] transition-colors">
                    {/* Sort Order Cell with Up/Down buttons */}
                    <TableCell className="py-2.5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          type="button"
                          disabled={globalIndex === 0}
                          onClick={() => handleMove(globalIndex, "up")}
                          className="p-1 text-[#8a7b68] hover:text-[#231b12] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs text-[#8a7b68] font-semibold w-4 text-center">
                          {globalIndex + 1}
                        </span>
                        <button
                          type="button"
                          disabled={globalIndex === activities.length - 1}
                          onClick={() => handleMove(globalIndex, "down")}
                          className="p-1 text-[#8a7b68] hover:text-[#231b12] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </TableCell>

                    <TableCell className="font-semibold text-xs text-[#231b12] py-2.5">
                      {act.name}
                    </TableCell>

                    <TableCell className="py-2.5">
                      <span className="font-mono text-[10px] py-0.5 px-1.5 font-bold text-[#5c4a35] bg-[#FAF2E1] border border-[#cfbeaa] rounded-none">
                        {act.code}
                      </span>
                    </TableCell>

                    <TableCell className="py-2.5">
                      <span
                        className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-none uppercase font-sans ${
                          act.activityType === "WEEKLY"
                            ? "bg-[#FAF2E1] text-[#664b28] border border-[#cfbeaa]"
                            : "bg-[#f4efe6] text-[#5c4e3b] border border-[#ded4c4]"
                        }`}
                      >
                        {act.activityType === "WEEKLY" ? "Weekly" : "Daily"}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs text-[#736350] py-2.5">
                      {act._count?.accountActivities || 0} accounts
                    </TableCell>

                    <TableCell className="text-center py-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(act.id, act.isActive)}
                        className="cursor-pointer"
                        title="Click to toggle status"
                      >
                        <Badge
                          variant={act.isActive ? "success" : "neutral"}
                          size="sm"
                        >
                          {act.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </button>
                    </TableCell>

                    <TableCell className="text-right py-2.5 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-[#8a7b68] hover:text-[#231b12]"
                          onClick={() => handleOpenEdit(act)}
                          title="Edit activity"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-[#8a7b68] hover:text-[#A82A1E] hover:bg-[#FDECEB]"
                          onClick={() =>
                            setDeleteDialog({
                              isOpen: true,
                              activityId: act.id,
                              activityName: act.name,
                            })
                          }
                          title="Delete activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination
          currentPage={currentPage}
          totalItems={activities.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          itemLabel="activities"
        />
      </div>

      {/* MOBILE CARD LIST (shown only on mobile < md) */}
      <div className="md:hidden space-y-3">
        {activities.length === 0 ? (
          <div className="p-8 bg-white border border-[#ded5c5] rounded-xs text-center text-xs text-[#8a7b68]">
            No activities configured yet. Click &quot;Add Activity&quot; to create one.
          </div>
        ) : (
          activities
            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
            .map((act, localIndex) => {
              const globalIndex = (currentPage - 1) * pageSize + localIndex;
              return (
                <div
                  key={act.id}
                  className="bg-white border-2 border-[#cfbeaa] rounded-xs p-4 shadow-[2px_2px_0px_#dfd5c5] space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-[#8a7b68] bg-[#f4efe6] px-1.5 py-0.5 rounded-none border border-[#ded4c4]">
                          #{globalIndex + 1}
                        </span>
                        <h3 className="font-bold text-xs text-[#231b12]">{act.name}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="font-mono text-[10px] py-0.5 px-1.5 font-bold text-[#5c4a35] bg-[#FAF2E1] border border-[#cfbeaa] rounded-none">
                          {act.code}
                        </span>
                        <span
                          className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-none uppercase font-sans ${
                            act.activityType === "WEEKLY"
                              ? "bg-[#FAF2E1] text-[#664b28] border border-[#cfbeaa]"
                              : "bg-[#f4efe6] text-[#5c4e3b] border border-[#ded4c4]"
                          }`}
                        >
                          {act.activityType === "WEEKLY" ? "Weekly" : "Daily"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(act.id, act.isActive)}
                      className="cursor-pointer shrink-0"
                      title="Click to toggle status"
                    >
                      <Badge variant={act.isActive ? "success" : "neutral"} size="sm">
                        {act.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#eee7dc] text-xs">
                    <span className="text-[11px] text-[#736350]">
                      {act._count?.accountActivities || 0} accounts assigned
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 text-[#736350] disabled:opacity-30"
                        disabled={globalIndex === 0}
                        onClick={() => handleMove(globalIndex, "up")}
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 text-[#736350] disabled:opacity-30"
                        disabled={globalIndex === activities.length - 1}
                        onClick={() => handleMove(globalIndex, "down")}
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 text-[#736350] hover:text-[#231b12]"
                        onClick={() => handleOpenEdit(act)}
                        title="Edit Activity"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 text-[#736350] hover:text-[#A82A1E] hover:bg-[#FDECEB]"
                        onClick={() =>
                          setDeleteDialog({
                            isOpen: true,
                            activityId: act.id,
                            activityName: act.name,
                          })
                        }
                        title="Delete Activity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
        )}

        {activities.length > 0 && (
          <div className="bg-white border border-[#cfbeaa] rounded-xs overflow-hidden shadow-[2px_2px_0px_#ded5c5]">
            <DataTablePagination
              currentPage={currentPage}
              totalItems={activities.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              itemLabel="activities"
            />
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingActivity ? "Edit Activity" : "New Activity"}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formErrors.form && (
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
              {formErrors.form}
            </div>
          )}

          <Input
            label="Activity Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            placeholder="e.g. Monster Hunt 600"
            autoFocus
          />

          <Input
            label="Short Code *"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            error={formErrors.code}
            placeholder="e.g. MH600"
          />

          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Schedule Type
            </label>
            <select
              value={formData.activityType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  activityType: e.target.value as "DAILY" | "WEEKLY",
                })
              }
              className="h-8 w-full rounded-xs border border-[#cfc3b0] bg-white px-2.5 text-xs text-[#2c261e] focus:outline-none focus:border-[#3B6EA8] cursor-pointer shadow-[1px_1px_0px_#e5ddd0]"
            >
              <option value="DAILY">Daily Checklist (Repeats everyday)</option>
              <option value="WEEKLY">Weekly Task (Once per week, reset every Monday)</option>
            </select>
            <p className="text-[10px] text-slate-400">
              {formData.activityType === "WEEKLY"
                ? "Once checked on any day of the week, it stays completed for the entire week."
                : "Resets every day at 00:00."}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="is_active"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: Boolean(checked) })
              }
            />
            <label
              htmlFor="is_active"
              className="text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Active for tracking
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingActivity ? "Save Changes" : "Create Activity"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={`Delete "${deleteDialog.activityName}"?`}
        description="Are you sure you want to delete this activity? It will be removed from all account checklists and past activity records."
        confirmLabel="Delete Activity"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false })}
      />
    </AppPage>
  );
}
