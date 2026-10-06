"use client";

import React, { useState } from "react";
import {
  createGroup,
  updateGroup,
  deleteGroup,
} from "@/server/actions/groups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, Folder } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
        toast.success(`Group "${name}" updated!`);
      } else {
        const res = await createGroup({ name });
        if (!res.success) throw new Error(res.error);
        toast.success(`Group "${name}" created!`);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to save group";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.groupId) return;
    try {
      const res = await deleteGroup(deleteDialog.groupId);
      if (res && res.success) {
        toast.success(`Group "${deleteDialog.groupName || ""}" deleted.`);
      } else {
        toast.error("Failed to delete group");
      }
    } finally {
      setDeleteDialog({ isOpen: false });
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#dfd5c5]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#3B6EA8] rounded-none shadow-[0.5px_0.5px_0px_#1e3b60]" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#231b12]">
              Account Groups
            </h1>
            <p className="text-xs text-[#736350] mt-0.5">
              Organize and categorize your character accounts (e.g., Client A, Personal, Card Farm)
            </p>
          </div>
        </div>

        <Button size="sm" onClick={handleOpenCreate} className="gap-1 text-xs">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Group</span>
        </Button>
      </div>

      {/* Main Groups Table */}
      <div className="rounded-xs border-2 border-[#cfbeaa] bg-white shadow-[3px_3px_0px_#baa892] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F4EFE6] border-b border-[#ded4c4]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 pl-4 font-sans">
                  Group Category Name
                </TableHead>
                <TableHead className="text-center text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 font-sans">
                  Characters
                </TableHead>
                <TableHead className="w-24 text-right text-[11px] font-bold text-[#2c261e] uppercase tracking-wider py-3 pr-4 font-sans">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {initialGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-28 text-center text-xs text-slate-400 py-6">
                    No groups created yet. Click &quot;Add Group&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                initialGroups
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((g) => (
                  <TableRow key={g.id} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell className="font-semibold text-xs text-slate-900 py-3 pl-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                          <Folder className="w-3.5 h-3.5" />
                        </div>
                        <span>{g.name}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center py-3">
                      <Badge variant="secondary" className="text-[10px] font-mono py-0 px-2">
                        {g._count?.accounts ?? 0} accounts
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right py-3 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-slate-800"
                          onClick={() => handleOpenEdit(g)}
                          title="Edit group"
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
                              groupId: g.id,
                              groupName: g.name,
                            })
                          }
                          title="Delete group"
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

        <Pagination
          currentPage={currentPage}
          totalItems={initialGroups.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          itemLabel="groups"
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGroup ? "Edit Group" : "New Group"}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          <Input
            label="Group Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Farm Card, Client A, Personal"
            autoFocus
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-slate-900 hover:bg-slate-800 text-white">
              {editingGroup ? "Save Changes" : "Create Group"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={`Delete "${deleteDialog.groupName}"?`}
        description="Are you sure you want to delete this group? Accounts in this group will remain intact but will be ungrouped."
        confirmLabel="Delete Group"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false })}
      />
    </div>
  );
}
