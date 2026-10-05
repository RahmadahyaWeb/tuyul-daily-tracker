"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  user?: { username: string; role: string } | null;
}

export function AppLayout({ children, user }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA] text-gray-900">
      {/* Desktop Sidebar (220px fixed) */}
      <div className="hidden md:flex shrink-0">
        <Sidebar user={user} />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-[240px] max-w-full bg-white shadow-xl h-full">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} user={user} />
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-3 right-3 p-2 text-white hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden h-12 border-b border-gray-200 bg-white px-4 flex items-center justify-between shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1 -ml-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm text-gray-900">Tuyul Tracker</span>
          <div className="w-5" />
        </div>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F8F9FA]">
          <div className="w-full max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
