"use client";

import React, { useActionState } from "react";
import { loginAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShieldCheck, Lock, User, AlertCircle } from "lucide-react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            TT
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
              Tuyul Tracker
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Ragnarok Account Daily Management System
            </p>
          </div>
        </div>

        {/* Card Box */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Private Admin Access</span>
          </div>

          {state?.error && (
            <div className="p-3 rounded-md bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-medium text-zinc-300"
              >
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="admin"
                  defaultValue="admin"
                  className="w-full rounded-md bg-zinc-950 border border-zinc-800 pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-zinc-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full rounded-md bg-zinc-950 border border-zinc-800 pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2 font-semibold"
              isLoading={isPending}
            >
              Login ke Dashboard
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-zinc-600 font-mono">
          Default seed login: admin / adminpassword123
        </p>
      </div>
    </div>
  );
}
