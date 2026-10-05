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
    <aside className="w-[220px] bg-white border-r border-gray-200 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center gap-2.5 border-b border-gray-100">
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center font-bold text-white text-xs tracking-tight">
          TT
        </div>
        <span className="font-semibold text-sm tracking-tight text-gray-900">
          Tuyul Tracker
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
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
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  isActive ? "text-blue-600" : "text-gray-400"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="truncate min-w-0 pr-2">
            <p className="text-xs font-semibold text-gray-800 truncate">
              {user?.username || "Admin"}
            </p>
            <p className="text-[11px] text-gray-500">Administrator</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Logout"
              className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
