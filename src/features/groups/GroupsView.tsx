"use client";

import React, { useState } from "react";
import {
  createGroup,
  updateGroup,
  deleteGroup,
} from "@/server/actions/groups";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Plus, Edit2, Trash2, FolderKanban, Users } from "lucide-react";

interface GroupItem {
  id: string;
  name: string;
  createdAt: Date;
  _count?: {
    accounts: number;
  };
}

interface GroupsViewProps {
  initialGroups: GroupItem[];
}

export function GroupsView({ initialGroups }: GroupsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupItem | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    groupId?: string;
    groupName?: string;
  }>({ isOpen: false });

  const handleOpenCreate = () => {
    setEditingGroup(null);
    setName("");
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (g: GroupItem) => {
    setEditingGroup(g);
    setName(g.name);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama group tidak boleh kosong");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingGroup) {
        const res = await updateGroup({ id: editingGroup.id, name });
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createGroup({ name });
        if (!res.success) throw new Error(res.error);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.groupId) return;
    try {
      await deleteGroup(deleteDialog.groupId);
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
            Account Groups
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Kelola pengelompokan akun tuyul (Personal, Client A, Farm Card, dll)
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Group</span>
        </Button>
      </div>

      {/* Groups Grid / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {initialGroups.length === 0 ? (
          <div className="col-span-full py-12 text-center text-zinc-500 bg-zinc-900/60 rounded-lg border border-zinc-800">
            <FolderKanban className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-400">
              Belum ada account group.
            </p>
          </div>
        ) : (
          initialGroups.map((g) => (
            <div
              key={g.id}
              className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700/80 transition-colors flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-blue-400">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-100">
                      {g.name}
                    </h3>
                    <p className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                      <Users className="w-3 h-3 text-zinc-500" />
                      <span>{g._count?.accounts || 0} Akun Terdaftar</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(g)}
                    title="Edit Group"
                    className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteDialog({
                        isOpen: true,
                        groupId: g.id,
                        groupName: g.name,
                      })
                    }
                    title="Delete Group"
                    className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGroup ? "Edit Group" : "Tambah Group Baru"}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Group *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error || undefined}
            placeholder="e.g. Personal, Client A, Farm Card"
          />

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
              {editingGroup ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="Hapus Group?"
        message={`Apakah Anda yakin ingin menghapus group "${deleteDialog.groupName}"? Akun yang ada di dalam group ini tidak akan terhapus, hanya status group-nya menjadi kosong.`}
        confirmText="Ya, Hapus Group"
        variant="danger"
      />
    </div>
  );
}
