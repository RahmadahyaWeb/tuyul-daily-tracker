"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
  user?: { username: string; role: string } | null;
}

export function AppLayout({ children, user }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Desktop Sidebar (230px fixed) */}
      <div className="hidden md:flex shrink-0">
        <Sidebar user={user} />
      </div>

      {/* Mobile Drawer using shadcn Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[230px] border-r border-slate-200">
          <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} user={user} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between shrink-0 shadow-2xs">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="h-8 w-8 text-slate-700"
          >
            <Menu className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-slate-900 to-indigo-700 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            </div>
            <span className="font-bold text-xs text-slate-900 tracking-tight">
              Tuyul Tracker
            </span>
          </div>

          <div className="w-8" />
        </div>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
