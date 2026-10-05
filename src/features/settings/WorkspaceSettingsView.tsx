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
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-2xs space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Workspace Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
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
            <label className="text-xs font-semibold text-slate-700">Workspace Slug</label>
            <div className="flex items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 font-mono">
              tuyul-tracker.app/w/{workspace.slug}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Your Role</span>
            </div>
            <span className="font-semibold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px]">
              {workspace.role}
            </span>
          </div>

          <div className="pt-3 flex justify-end">
            <Button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs"
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-rose-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-rose-900">Danger Zone</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
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
                <AlertDialogDescription className="text-xs text-slate-500">
                  This will permanently delete your workspace, all {workspace.accountCount} tuyul accounts, and associated activity history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetData}
                  className="bg-rose-600 text-white hover:bg-rose-700 text-xs"
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
