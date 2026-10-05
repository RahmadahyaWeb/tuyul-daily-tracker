"use client";

import React, { useActionState } from "react";
import { loginAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/Button";
import { Lock, User, AlertCircle } from "lucide-react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F9FA] text-gray-900">
      <div className="w-full max-w-sm space-y-5">
        {/* Brand */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto shadow-2xs">
            TT
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              Tuyul Tracker
            </h1>
            <p className="text-xs text-gray-500">
              Sign in to manage Ragnarok tuyul accounts
            </p>
          </div>
        </div>

        {/* Card Surface */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
          {state?.error && (
            <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-3.5">
            <div className="space-y-1">
              <label
                htmlFor="username"
                className="block text-xs font-medium text-gray-700"
              >
                Username
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="admin"
                  defaultValue="admin"
                  className="w-full rounded-md bg-white border border-gray-200 pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full rounded-md bg-white border border-gray-200 pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 h-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-1 font-medium h-9 text-xs"
              isLoading={isPending}
            >
              Sign In
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-400 font-mono">
          Default seed login: admin / adminpassword123
        </p>
      </div>
    </div>
  );
}
