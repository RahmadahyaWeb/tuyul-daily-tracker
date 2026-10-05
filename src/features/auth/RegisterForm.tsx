"use client";

import React, { useActionState } from "react";
import { registerAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-slate-900">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-700 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-500/10">
            <Sparkles className="w-5 h-5 text-indigo-200" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Create your account
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Start organizing and tracking your tuyul accounts
            </p>
          </div>
        </div>

        {/* Card Surface */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
          {state?.error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
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
              placeholder="e.g. shadowhunter"
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
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium"
              isLoading={isPending}
            >
              Get Started
            </Button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
