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
      <div className="bg-[#FCFAF7] border-2 border-[#cfbeaa] rounded-xs p-6 shadow-[3px_3px_0px_#baa892] space-y-5">
        <div>
          <h2 className="text-sm font-bold text-[#231b12] font-pixel tracking-wider uppercase">Workspace Settings</h2>
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
            <div className="flex items-center px-3 py-2 bg-white border border-[#cfc3b0] rounded-xs text-xs text-[#736350] font-mono shadow-[1px_1px_0px_#e5ddd0]">
              dituyulin.app/w/{workspace.slug}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-white border border-[#cfc3b0] rounded-xs text-xs shadow-[1px_1px_0px_#e5ddd0]">
            <div className="flex items-center gap-2 text-[#5c4e3b] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#1E5D2F]" />
              <span>Your Role</span>
            </div>
            <span className="font-bold text-[#231b12] bg-[#FAF2E1] border border-[#cfbeaa] px-2 py-0.5 rounded-none text-[11px] font-pixel">
              {workspace.role === "OWNER" ? "GUILD MASTER" : "MEMBER"}
            </span>
          </div>

          <div className="pt-3 flex justify-end">
            <Button
              type="submit"
              className="text-xs"
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border-2 border-[#e5b8b4] rounded-xs p-6 shadow-[3px_3px_0px_#e5b8b4] space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#FDF4F3] text-[#A82A1E] rounded-xs shrink-0 border border-[#e5b8b4]">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[#A82A1E] font-pixel uppercase tracking-wide">Danger Zone</h3>
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
