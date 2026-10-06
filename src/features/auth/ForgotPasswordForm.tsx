"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF8F5] text-[#2c261e]">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Link href="/">
              <Logo size="lg" />
            </Link>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#231b12]">
              Reset Password
            </h1>
            <p className="text-xs text-[#736350] mt-0.5">
              Enter your username to request a password reset
            </p>
          </div>
        </div>

        <div className="rounded-xs border border-[#cfbeaa] bg-white p-6 shadow-[2px_2px_0px_#ded5c5] space-y-4">
          {submitted ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-10 h-10 bg-[#ECFDF3] border border-[#a3ddb4] text-[#1E5D2F] rounded-xs flex items-center justify-center mx-auto shadow-[1px_1px_0px_#a3ddb4]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#231b12]">Request Sent</p>
                <p className="text-xs text-[#736350] leading-relaxed">
                  If an account exists for <span className="font-semibold text-[#231b12]">@{username}</span>, contact your guild administrator to complete reset.
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
                className="w-full"
                isLoading={loading}
              >
                Send Reset Link
              </Button>

              <div className="text-center pt-2 text-xs text-[#736350] border-t border-[#dfd5c5]">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#3B6EA8] hover:text-[#2F5B8D] hover:underline"
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
