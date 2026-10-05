"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X, Clock } from "lucide-react";
import { formatDateDisplay, getTodayMakassar } from "@/lib/date-utils";

interface AppLayoutProps {
  children: React.ReactNode;
  user?: { username: string; role: string } | null;
}

export function AppLayout({ children, user }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const todayStr = getTodayMakassar();
  const todayFormatted = formatDateDisplay(todayStr);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar user={user} />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-full">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} user={user} />
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-3 right-3 p-2 text-zinc-300 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 px-4 md:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 -ml-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-medium text-zinc-200">{todayFormatted}</span>
              <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800 px-1.5 py-0.5 rounded">
                WITA (UTC+8)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-zinc-400 hidden sm:inline font-mono">
                System Active
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#090a0f] p-4 md:p-6">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
