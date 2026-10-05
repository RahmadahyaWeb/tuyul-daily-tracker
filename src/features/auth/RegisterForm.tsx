"use client";

import React, { useActionState } from "react";
import { registerAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Tuyul Tracker
          </h1>
          <p className="text-xs text-muted-foreground">
            Create an account to manage your tuyul daily tasks
          </p>
        </div>

        {/* Card Surface */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-4">
          {state?.error && (
            <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <Input
              label="Username"
              id="username"
              name="username"
              type="text"
              required
              placeholder="e.g. johndoe"
              autoFocus
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              required
              placeholder="Minimum 6 characters"
            />

            <Input
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="Repeat your password"
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isPending}
            >
              Create Account
            </Button>
          </form>

          <div className="text-center pt-2 text-xs text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-foreground hover:underline"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
