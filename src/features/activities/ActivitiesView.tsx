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
} from "lucide-react";

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Activities
        </h1>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Activity</span>
        </Button>
      </div>

      {/* Main Activities Table */}
      <div className="rounded-md border border-border overflow-hidden bg-background">
        <Table className="min-w-[550px]">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-16 text-center font-medium text-xs">Order</TableHead>
              <TableHead className="font-medium text-xs">Name</TableHead>
              <TableHead className="font-medium text-xs">Code</TableHead>
              <TableHead className="text-center font-medium text-xs">Accounts</TableHead>
              <TableHead className="text-center font-medium text-xs">Status</TableHead>
              <TableHead className="w-20 text-center font-medium text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                  No activities yet.
                </TableCell>
              </TableRow>
            ) : (
              activities.map((act, idx) => (
                <TableRow key={act.id} className="hover:bg-muted/30 transition-colors">
                  {/* Reorder */}
                  <TableCell className="text-center py-2">
                    <div className="flex items-center justify-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => handleMove(idx, "up")}
                        disabled={idx === 0}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === activities.length - 1}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>

                  {/* Name */}
                  <TableCell className="font-medium text-sm text-foreground">
                    {act.name}
                  </TableCell>

                  {/* Code */}
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {act.code}
                  </TableCell>

                  {/* Count */}
                  <TableCell className="text-center text-xs font-mono text-muted-foreground">
                    {act._count?.accountActivities ?? 0}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(act.id, act.isActive)}
                      className="cursor-pointer"
                    >
                      <Badge
                        variant={act.isActive ? "success" : "neutral"}
                        size="sm"
                      >
                        {act.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-center py-2">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEdit(act)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          setDeleteDialog({
                            isOpen: true,
                            activityId: act.id,
                            activityName: act.name,
                          })
                        }
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

      {/* Add / Edit Activity Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingActivity ? "Edit Activity" : "Add Activity"}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {formErrors.form && (
            <div className="p-2 rounded bg-destructive/10 text-destructive border border-destructive/20">
              {formErrors.form}
            </div>
          )}

          <Input
            label="Activity Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            placeholder="e.g. Monster Hunt 600"
          />

          <Input
            label="Short Code *"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            error={formErrors.code}
            placeholder="e.g. MH600"
          />

          <Input
            label="Sort Order"
            type="number"
            value={formData.sortOrder}
            onChange={(e) =>
              setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
            }
          />

          <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
            <Checkbox
              checked={formData.isActive}
              onCheckedChange={(c) =>
                setFormData({ ...formData, isActive: Boolean(c) })
              }
            />
            <span className="text-xs font-medium text-foreground">Active Activity</span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
            >
              {editingActivity ? "Save Changes" : "Create Activity"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={`Delete Activity?`}
        description={`Are you sure you want to delete ${deleteDialog.activityName}? It will be removed from all account checklists.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
