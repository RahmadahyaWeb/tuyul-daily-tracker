"use client";

import React, { useActionState, useEffect } from "react";
import { loginAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF8F5] text-[#2c261e]">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Link href="/">
              <Logo size="lg" />
            </Link>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#231b12]">
              Welcome back
            </h1>
            <p className="text-xs text-[#736350] mt-0.5">
              Sign in to your Dituyulin workspace
            </p>
          </div>
        </div>

        {/* Card Surface */}
        <div className="rounded-xs border border-[#cfbeaa] bg-white p-6 shadow-[2px_2px_0px_#ded5c5] space-y-4">
          {state?.error && (
            <div className="p-3 rounded-xs bg-[#FDF4F3] border border-[#e5b8b4] text-[#A82A1E] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#A82A1E]" />
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
              placeholder="Username"
              autoFocus
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isPending}
            >
              Sign In
            </Button>
          </form>

          <div className="text-center pt-2 text-xs text-[#736350] border-t border-[#dfd5c5]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#3B6EA8] hover:text-[#2F5B8D] hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
