"use client";

import React, { useActionState } from "react";
import { updateAdminCredentialsAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ProfileSettingsViewProps {
  user: {
    username: string;
    role: string;
  };
}

export function ProfileSettingsView({ user }: ProfileSettingsViewProps) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const res = await updateAdminCredentialsAction(prevState, formData);
      if (res?.success) {
        toast.success(res.message || "Profile updated successfully!");
      } else if (res && !res.success) {
        toast.error(res.error || "Failed to update profile");
      }
      return res;
    },
    null
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-2xs space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Profile Information</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Update your account credentials and login information.
          </p>
        </div>

        {state?.error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{state.error}</span>
          </div>
        )}

        {state?.success && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{state.message}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <Input
            label="Username"
            id="newUsername"
            name="newUsername"
            defaultValue={user.username}
            required
          />

          <div className="pt-2 border-t border-slate-100 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-900">Change Password</h3>
              <p className="text-[11px] text-slate-500">Leave blank if you don&apos;t want to change your password.</p>
            </div>

            <Input
              label="Current Password"
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="Enter current password to confirm changes"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="New Password"
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Minimum 6 characters"
              />
              <Input
                label="Confirm New Password"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat new password"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <Button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs"
              isLoading={isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
