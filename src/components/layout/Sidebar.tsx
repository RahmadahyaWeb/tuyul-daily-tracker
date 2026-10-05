"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Users,
  ListTodo,
  FolderKanban,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/server/actions/auth";

interface SidebarProps {
  onCloseMobile?: () => void;
  user?: { username: string; role: string } | null;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracker", label: "Tracker", icon: CheckSquare },
  { href: "/weekly", label: "Weekly", icon: Calendar },
  { href: "/accounts", label: "Accounts", icon: Users },
  { href: "/activities", label: "Activities", icon: ListTodo },
  { href: "/groups", label: "Groups", icon: FolderKanban },
];

export function Sidebar({ onCloseMobile, user }: SidebarProps) {
  const pathname = usePathname();

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-14 px-5 flex items-center gap-2.5 border-b border-zinc-800/80">
        <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center font-black text-white text-xs tracking-wider shadow-sm">
          TT
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-zinc-100">
            Tuyul Tracker
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">
            Ragnarok Daily Manager
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                isActive
                  ? "bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/20"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4",
                  isActive ? "text-blue-400" : "text-zinc-400"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-zinc-900/60 border border-zinc-800/60">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <Shield className="w-3 h-3 text-blue-400" />
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-zinc-200 truncate">
                {user?.username || "Admin"}
              </p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                {user?.role || "ADMIN"}
              </p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Logout"
              className="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
