"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Users,
  ListChecks,
  Folder,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/server/actions/auth";
import { SettingsModal } from "./SettingsModal";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";

interface SidebarProps {
  onCloseMobile?: () => void;
  user?: { username: string; role: string } | null;
}

const mainNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracker", label: "Daily Tracker", icon: CheckSquare },
  { href: "/weekly", label: "Weekly View", icon: CalendarDays },
];

const managementNavItems = [
  { href: "/accounts", label: "Accounts", icon: Users },
  { href: "/activities", label: "Activities", icon: ListChecks },
  { href: "/groups", label: "Groups", icon: Folder },
];

export function Sidebar({ onCloseMobile, user }: SidebarProps) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const renderLink = (item: { href: string; label: string; icon: any }) => {
    const Icon = item.icon;
    const isActive =
      item.href === "/"
        ? pathname === "/"
        : pathname === item.href || pathname.startsWith(item.href + "/");

    return (
      <Link
        key={item.href}
        href={item.href}
        prefetch={true}
        onClick={handleNavClick}
        className={cn(
          "group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all",
          isActive
            ? "bg-slate-900 text-white shadow-xs"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon
            className={cn(
              "w-4 h-4 shrink-0 transition-transform group-hover:scale-105",
              isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900"
            )}
          />
          <span className="truncate">{item.label}</span>
        </div>
      </Link>
    );
  };

  return (
    <>
      <aside className="w-[230px] bg-white border-r border-slate-200/80 flex flex-col h-full select-none">
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-900 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-500/10">
              <Sparkles className="w-4 h-4 text-indigo-200" />
            </div>
            <div>
              <span className="font-bold text-xs tracking-tight text-slate-900 block leading-tight">
                Tuyul Tracker
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-none block">
                Daily Workspace
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {/* Main Links */}
          <div className="space-y-1">
            <p className="px-3 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Overview
            </p>
            {mainNavItems.map(renderLink)}
          </div>

          <Separator className="bg-slate-100" />

          {/* Management Section */}
          <div className="space-y-1">
            <p className="px-3 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Management
            </p>
            {managementNavItems.map(renderLink)}
          </div>
        </nav>

        {/* Footer: User & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 text-left truncate min-w-0 pr-1 hover:opacity-85 transition-opacity cursor-pointer flex-1"
              title="Account Settings"
            >
              <Avatar name={user?.username || "Admin"} size="sm" />
              <div className="truncate min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                  {user?.username || "Admin"}
                </p>
                <p className="text-[10px] text-slate-400 capitalize leading-none">
                  {user?.role?.toLowerCase() || "user"}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                title="Account Settings"
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Logout"
                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Account Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentUser={user}
      />
    </>
  );
}
