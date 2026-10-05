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

interface ActivityItem {
  id: string;
  name: string;
  code: string;
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

  React.useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
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
          sortOrder: Number(formData.sortOrder),
          isActive: formData.isActive,
        });
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createActivity({
          name: formData.name,
          code: formData.code,
          sortOrder: Number(formData.sortOrder),
          isActive: formData.isActive,
        });
        if (!res.success) throw new Error(res.error);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      setFormErrors({
        form: err instanceof Error ? err.message : "Failed to save activity",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleActivityStatus(id, !currentStatus);
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
      await deleteActivity(deleteDialog.activityId);
    } finally {
      setDeleteDialog({ isOpen: false });
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Daily Activities Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure repeatable daily checklist tasks and sort orders for your characters
          </p>
        </div>

        <Button size="sm" onClick={handleOpenCreate} className="bg-slate-900 hover:bg-slate-800 text-white shadow-xs gap-1 text-xs">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Activity</span>
        </Button>
      </div>

      {/* Main Activities Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200/70">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16 text-center text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">
                  Order
                </TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">
                  Activity Name
                </TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">
                  Short Code
                </TableHead>
                <TableHead className="text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">
                  Assigned Characters
                </TableHead>
                <TableHead className="text-center text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3">
                  Status
                </TableHead>
                <TableHead className="w-24 text-right text-[11px] font-bold text-slate-600 uppercase tracking-wider py-3 pr-4">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {activities.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center text-xs text-slate-400 py-6"
                  >
                    No activities configured yet. Click &quot;Add Activity&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((act, index) => (
                  <TableRow key={act.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Sort Order Cell with Up/Down buttons */}
                    <TableCell className="py-2.5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMove(index, "up")}
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs text-slate-400 font-semibold w-4 text-center">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          disabled={index === activities.length - 1}
                          onClick={() => handleMove(index, "down")}
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </TableCell>

                    <TableCell className="font-semibold text-xs text-slate-900 py-2.5">
                      {act.name}
                    </TableCell>

                    <TableCell className="py-2.5">
                      <Badge variant="outline" className="font-mono text-[10px] py-0 px-2 font-bold text-slate-700 bg-slate-50">
                        {act.code}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-slate-500 py-2.5">
                      {act._count?.accountActivities || 0} characters
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
                          className="h-7 w-7 text-slate-400 hover:text-slate-800"
                          onClick={() => handleOpenEdit(act)}
                          title="Edit activity"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
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
            <Button type="submit" isLoading={isSubmitting} className="bg-slate-900 hover:bg-slate-800 text-white">
              {editingActivity ? "Save Changes" : "Create Activity"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={`Delete "${deleteDialog.activityName}"?`}
        description="Are you sure you want to delete this activity? It will be removed from all character checklists and past activity records."
        confirmLabel="Delete Activity"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false })}
      />
    </div>
  );
}
