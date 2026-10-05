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
import { formatDateShort } from "@/lib/date-utils";
import { Plus, Edit2, Trash2 } from "lucide-react";

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
      setError("Group name cannot be empty");
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
      setError(err instanceof Error ? err.message : "Failed to save group");
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
    <div className="space-y-4 text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Account Groups
          </h1>
          <p className="text-xs text-gray-500">
            Categorize tuyul accounts (e.g. Personal, Client A, Farm Card)
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
            <span>Add Group</span>
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-xs font-semibold">
                <th className="py-2.5 px-3.5">Group Name</th>
                <th className="py-2.5 px-3 text-center">Assigned Accounts</th>
                <th className="py-2.5 px-3">Created Date</th>
                <th className="py-2.5 px-3 text-center w-24">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs">
              {initialGroups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-400">
                    No groups found. Click &quot;Add Group&quot; to create one.
                  </td>
                </tr>
              ) : (
                initialGroups.map((g) => (
                  <tr
                    key={g.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    {/* Name */}
                    <td className="py-2.5 px-3.5 font-semibold text-gray-900">
                      {g.name}
                    </td>

                    {/* Count */}
                    <td className="py-2.5 px-3 text-center text-gray-700 font-mono">
                      {g._count?.accounts ?? 0}
                    </td>

                    {/* Created */}
                    <td className="py-2.5 px-3 text-gray-500">
                      {formatDateShort(new Date(g.createdAt).toISOString().split("T")[0])}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(g)}
                          title="Edit Group"
                          className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
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

      {/* Add / Edit Group Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGroup ? `Edit Group: ${editingGroup.name}` : "Add New Group"}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {error && (
            <div className="p-2 rounded bg-red-50 border border-red-200 text-red-600">
              {error}
            </div>
          )}

          <Input
            label="Group Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Farm Card / Client A"
          />

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
              {editingGroup ? "Save Changes" : "Create Group"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={`Delete Group: ${deleteDialog.groupName}?`}
        message="Are you sure you want to delete this group? Accounts assigned to this group will become unassigned."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
