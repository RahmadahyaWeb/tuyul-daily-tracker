"use client";

import React, { useState, useTransition } from "react";
import {
  createActivity,
  updateActivity,
  toggleActivityStatus,
  deleteActivity,
  reorderActivities,
} from "@/server/actions/activities";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  X,
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
    <div className="space-y-4 text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Master Activities
          </h1>
          <p className="text-xs text-gray-500">
            Define daily repeatable checklist activities and display order
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
            <span>Add Activity</span>
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-xs font-semibold">
                <th className="py-2.5 px-3.5 w-16 text-center">Order</th>
                <th className="py-2.5 px-3">Activity Name</th>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3 text-center">Assigned Accounts</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center w-28">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">
                    No activities defined. Click &quot;Add Activity&quot; to create one.
                  </td>
                </tr>
              ) : (
                activities.map((act, idx) => (
                  <tr
                    key={act.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    {/* Reorder Buttons */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "up")}
                          disabled={idx === 0}
                          title="Move Up"
                          className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "down")}
                          disabled={idx === activities.length - 1}
                          title="Move Down"
                          className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      {act.name}
                    </td>

                    {/* Code */}
                    <td className="py-2.5 px-3 font-mono text-gray-600">
                      {act.code}
                    </td>

                    {/* Count */}
                    <td className="py-2.5 px-3 text-center text-gray-600 font-mono">
                      {act._count?.accountActivities ?? 0}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-2.5 px-3 text-center">
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
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(act)}
                          title="Edit Activity"
                          className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteDialog({
                              isOpen: true,
                              activityId: act.id,
                              activityName: act.name,
                            })
                          }
                          title="Delete Activity"
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

      {/* Add / Edit Activity Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingActivity ? `Edit Activity: ${editingActivity.name}` : "Add Activity"}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {formErrors.form && (
            <div className="p-2 rounded bg-red-50 border border-red-200 text-red-600">
              {formErrors.form}
            </div>
          )}

          <Input
            label="Activity Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            placeholder="e.g. Monster Hunt 600"
          />

          <Input
            label="Short Code"
            required
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
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-medium text-gray-700">Active Activity</span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(false)}
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
        title={`Delete Activity: ${deleteDialog.activityName}?`}
        message="Are you sure you want to delete this activity? It will be removed from all account checklists and historical logs."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
