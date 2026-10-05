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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/server/actions/auth";
import { SettingsModal } from "./SettingsModal";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  onCloseMobile?: () => void;
  user?: { username: string; role: string } | null;
}

const mainNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracker", label: "Tracker", icon: CheckSquare },
  { href: "/weekly", label: "Weekly", icon: CalendarDays },
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
          "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors",
          isActive
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )}
      >
        <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      <aside className="w-[220px] bg-background border-r border-border flex flex-col h-full select-none">
        {/* Brand Header */}
        <div className="h-12 px-4 flex items-center border-b border-border">
          <span className="font-semibold text-sm tracking-tight text-foreground">
            Tuyul Tracker
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
          {/* Main Links */}
          <div className="space-y-0.5">
            {mainNavItems.map(renderLink)}
          </div>

          <Separator />

          {/* Management Section */}
          <div className="space-y-0.5">
            <p className="px-3 pb-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Management
            </p>
            {managementNavItems.map(renderLink)}
          </div>
        </nav>

        {/* Footer: User & Logout */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="text-left truncate min-w-0 pr-2 hover:opacity-80 transition-opacity cursor-pointer group"
              title="Edit credentials"
            >
              <p className="text-xs font-medium text-foreground truncate group-hover:underline">
                {user?.username || "Admin"}
              </p>
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                title="Account Settings"
                className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Logout"
                  className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
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


