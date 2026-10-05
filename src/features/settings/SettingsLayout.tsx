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
      <div className="pb-4 border-b border-slate-200/80">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal account, workspace preferences, and billing.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Settings Navigation Tabs */}
        <nav className="w-full md:w-56 shrink-0 flex md:flex-col gap-1 p-1 bg-slate-100/70 md:bg-transparent rounded-lg">
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
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full",
                  isActive
                    ? "bg-white text-slate-900 shadow-2xs md:bg-slate-900 md:text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "md:text-white" : "text-slate-500")} />
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
