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
  ListTodo,
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

  // Modal states
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

  // Delete modal
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    activityId?: string;
    activityName?: string;
  }>({ isOpen: false });

  // Open Create
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

  // Open Edit
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

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    if (!formData.name.trim()) {
      setFormErrors({ name: "Nama aktivitas wajib diisi" });
      return;
    }
    if (!formData.code.trim()) {
      setFormErrors({ code: "Kode aktivitas wajib diisi" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingActivity) {
        const res = await updateActivity({
          id: editingActivity.id,
          name: formData.name,
          code: formData.code.toUpperCase(),
          sortOrder: Number(formData.sortOrder),
          isActive: formData.isActive,
        });
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createActivity({
          name: formData.name,
          code: formData.code.toUpperCase(),
          sortOrder: Number(formData.sortOrder),
          isActive: formData.isActive,
        });
        if (!res.success) throw new Error(res.error);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan activity";
      setFormErrors({ form: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active
  const handleToggle = (act: ActivityItem) => {
    startTransition(async () => {
      await toggleActivityStatus(act.id, !act.isActive);
    });
  };

  // Move Sort Order Up / Down
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activities.length) return;

    const newActivities = [...activities];
    const [moved] = newActivities.splice(index, 1);
    newActivities.splice(targetIndex, 0, moved);

    setActivities(newActivities);
    await reorderActivities(newActivities.map((a) => a.id));
  };

  // Confirm Delete
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            Master Activities
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Kelola master checklist aktivitas harian yang tersedia untuk semua akun
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Activity</span>
        </Button>
      </div>

      {/* Activities Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px] text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 font-semibold">
                <th className="py-3 px-4 w-16 text-center">Urutan</th>
                <th className="py-3 px-4">Nama Activity</th>
                <th className="py-3 px-3">Kode</th>
                <th className="py-3 px-3 text-center">Digunakan Oleh</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/60">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <ListTodo className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-zinc-400">
                      Belum ada master activity.
                    </p>
                  </td>
                </tr>
              ) : (
                activities.map((act, idx) => (
                  <tr
                    key={act.id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    {/* Reorder Buttons */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-20 transition-colors cursor-pointer"
                          title="Geser ke Atas"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "down")}
                          disabled={idx === activities.length - 1}
                          className="p-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-20 transition-colors cursor-pointer"
                          title="Geser ke Bawah"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-2.5 px-4 font-semibold text-zinc-200">
                      {act.name}
                    </td>

                    {/* Code */}
                    <td className="py-2.5 px-3 font-mono font-bold text-zinc-400">
                      {act.code}
                    </td>

                    {/* Usage count */}
                    <td className="py-2.5 px-3 text-center text-zinc-400 font-mono">
                      {act._count?.accountActivities || 0} Akun
                    </td>

                    {/* Status Toggle */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(act)}
                        className="cursor-pointer inline-flex items-center"
                        title={act.isActive ? "Nonaktifkan" : "Aktifkan"}
                      >
                        <Badge
                          variant={act.isActive ? "success" : "neutral"}
                          size="sm"
                        >
                          {act.isActive ? (
                            <span className="flex items-center gap-1">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <X className="w-3 h-3" /> Inactive
                            </span>
                          )}
                        </Badge>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(act)}
                          title="Edit Activity"
                          className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
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

      {/* Add / Edit Activity Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingActivity ? "Edit Activity" : "Tambah Activity Baru"}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formErrors.form && (
            <div className="p-2.5 rounded bg-red-950/80 border border-red-800 text-red-300 text-xs">
              {formErrors.form}
            </div>
          )}

          <Input
            label="Nama Activity *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            placeholder="e.g. Monster Hunt 600"
          />

          <Input
            label="Kode Singkat (Unique) *"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            error={formErrors.code}
            placeholder="e.g. MH600"
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-0"
            />
            <label
              htmlFor="isActiveCheck"
              className="text-xs text-zinc-300 cursor-pointer select-none"
            >
              Aktifkan untuk Daily Tracker
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              {editingActivity ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="Hapus Master Activity?"
        message={`Apakah Anda yakin ingin menghapus activity "${deleteDialog.activityName}"? Aktivitas ini akan dihapus dari seluruh akun dan checklist terkait.`}
        confirmText="Ya, Hapus"
        variant="danger"
      />
    </div>
  );
}
