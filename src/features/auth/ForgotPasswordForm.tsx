"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate reset request / provide instructions
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-slate-900">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white mx-auto shadow-sm">
            <span className="font-bold text-sm">T</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Reset Password
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your username to request a password reset
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
          {submitted ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">Request Sent</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  If an account exists for <span className="font-medium text-slate-700">{username}</span>, contact your workspace administrator or support to complete reset.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full text-xs mt-2">
                <Link href="/login">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Sign In
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username"
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                autoFocus
              />

              <Button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium"
                isLoading={loading}
              >
                Send Reset Link
              </Button>

              <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
