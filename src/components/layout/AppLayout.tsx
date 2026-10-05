"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Logo } from "@/components/brand/Logo";

interface AppLayoutProps {
  children: React.ReactNode;
  user?: { id?: string; username: string; role: string } | null;
}

export function AppLayout({ children, user }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F5] text-[#2c261e]">
      {/* Desktop Sidebar (230px fixed) */}
      <div className="hidden md:flex shrink-0">
        <Sidebar user={user} />
      </div>

      {/* Mobile Drawer using shadcn Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[230px] border-r border-[#dfd5c5] bg-[#FCFAF7]">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} user={user} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden h-14 border-b border-[#dfd5c5] bg-[#FCFAF7] px-4 flex items-center justify-between shrink-0 shadow-[0px_1px_2px_#e5ddd0]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="h-8 w-8 text-[#5a4c3a]"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </Button>

          <Link href="/dashboard" className="flex items-center">
            <Logo size="sm" />
          </Link>

          <div className="w-8" />
        </div>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#FAF8F5]">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
