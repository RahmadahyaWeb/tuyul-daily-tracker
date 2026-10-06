"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Workspace } from "@/lib/workspace";
import { toast } from "sonner";
import { AlertTriangle, ShieldCheck } from "lucide-react";

interface WorkspaceSettingsViewProps {
  workspace: Workspace;
}

export function WorkspaceSettingsView({ workspace }: WorkspaceSettingsViewProps) {
  const [name, setName] = useState(workspace.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Workspace name updated successfully.");
    }, 400);
  };

  const handleResetData = () => {
    toast.success("Workspace reset simulated.");
  };

  return (
    <div className="space-y-6">
      {/* Workspace Profile */}
      <div className="bg-white border border-[#cfbeaa] rounded-xs p-6 shadow-[2px_2px_0px_#ded5c5] space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-[#231b12]">Workspace Settings</h2>
          <p className="text-xs text-[#736350] mt-0.5">
            Manage your workspace name and tenant identifiers.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Workspace Name"
            id="workspaceName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5c4e3b]">Workspace Slug</label>
            <div className="flex items-center px-3 py-2 bg-[#FAF6F0] border border-[#cfc3b0] rounded-xs text-xs text-[#736350] font-mono shadow-[1px_1px_0px_#e5ddd0]">
              dituyulin.app/w/{workspace.slug}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#FAF6F0] border border-[#cfc3b0] rounded-xs text-xs shadow-[1px_1px_0px_#e5ddd0]">
            <div className="flex items-center gap-2 text-[#5c4e3b] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#1E5D2F]" />
              <span>Your Role</span>
            </div>
            <span className="font-semibold text-[#231b12] bg-[#FAF2E1] border border-[#cfbeaa] px-2 py-0.5 rounded-none text-xs font-sans">
              {workspace.role === "OWNER" ? "Owner" : "Member"}
            </span>
          </div>

          <div className="pt-3 flex justify-end">
            <Button
              type="submit"
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-[#e5b8b4] rounded-xs p-6 shadow-[2px_2px_0px_#f5c6cb] space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#FDF4F3] text-[#A82A1E] rounded-xs shrink-0 border border-[#e5b8b4]">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-[#A82A1E] uppercase tracking-wide">Danger Zone</h3>
            <p className="text-xs text-[#736350] leading-relaxed">
              Reset all logs or delete this workspace. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="text-xs">
                Delete Workspace
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-[#736350]">
                  This will permanently delete your workspace, all {workspace.accountCount} character accounts, and associated activity history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetData}
                  className="bg-[#A82A1E] text-white hover:bg-[#8f2116] text-xs font-medium"
                >
                  Yes, Delete Workspace
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
