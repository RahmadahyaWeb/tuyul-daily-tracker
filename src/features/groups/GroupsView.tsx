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
import { toast } from "sonner";
import { AppPage } from "@/components/shared/AppPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTablePagination } from "@/components/shared/DataTablePagination";

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
    <AppPage>
      {/* Unified Page Header */}
      <PageHeader
        title="Groups"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Group</span>
          </Button>
        }
      />

      {/* Main Groups Table */}
      <div className="rounded-xs border border-[#cfbeaa] bg-white shadow-[2px_2px_0px_#ded5c5] overflow-hidden">
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

            <TableBody className="divide-y divide-[#eee7dc]">
              {initialGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-28 text-center text-xs text-[#8a7b68] py-6">
                    No groups created yet. Click &quot;Add Group&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                initialGroups
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((g) => (
                  <TableRow key={g.id} className="hover:bg-[#FAF6F0] transition-colors">
                    <TableCell className="font-semibold text-xs text-[#231b12] py-3 pl-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-none bg-[#f4efe6] border border-[#ded4c4] flex items-center justify-center text-[#736350]">
                          <Folder className="w-3.5 h-3.5" />
                        </div>
                        <span>{g.name}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center py-3">
                      <span className="text-[10px] font-mono py-0.5 px-2 bg-[#FAF2E1] border border-[#cfbeaa] text-[#664b28] font-bold rounded-none">
                        {g._count?.accounts ?? 0} accounts
                      </span>
                    </TableCell>

                    <TableCell className="text-right py-3 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-[#8a7b68] hover:text-[#231b12]"
                          onClick={() => handleOpenEdit(g)}
                          title="Edit group"
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

        <DataTablePagination
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
            <Button type="submit" isLoading={isSubmitting}>
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
    </AppPage>
  );
}
