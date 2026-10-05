"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Layers, CreditCard } from "lucide-react";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/settings/profile", label: "Profile", icon: User },
  { href: "/settings/workspace", label: "Workspace", icon: Layers },
  { href: "/settings/billing", label: "Billing & Plans", icon: CreditCard },
];

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="pb-3 border-b border-[#dfd5c5]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#3B6EA8] rounded-none shadow-[0.5px_0.5px_0px_#1e3b60]" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#231b12]">Settings</h1>
            <p className="text-xs text-[#736350] mt-0.5">
              Manage your personal account, workspace preferences, and billing.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Settings Navigation Tabs */}
        <nav className="w-full md:w-56 shrink-0 flex md:flex-col gap-1 p-1 bg-[#F4EFE6] md:bg-transparent rounded-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === "/settings/profile" && pathname === "/settings");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xs text-xs font-medium transition-colors w-full select-none",
                  isActive
                    ? "bg-[#3B6EA8] text-white shadow-[1.5px_1.5px_0px_#1e3b60]"
                    : "text-[#5c4e3b] hover:text-[#231b12] hover:bg-[#F3ECE0]"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-[#736350]")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Content View */}
        <div className="flex-1 w-full max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
