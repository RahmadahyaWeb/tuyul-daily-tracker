"use client";

import React from "react";
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
  User,
  CreditCard,
  Layers,
  ChevronDown,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/server/actions/auth";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  onCloseMobile?: () => void;
  user?: { id?: string; username: string; role: string } | null;
}

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracker", label: "Tracker", icon: CheckSquare },
  { href: "/weekly", label: "Weekly", icon: CalendarDays },
];

const managementNavItems = [
  { href: "/accounts", label: "Accounts", icon: Users },
  { href: "/activities", label: "Activities", icon: ListChecks },
  { href: "/groups", label: "Groups", icon: Folder },
];

const adminNavItems = [
  { href: "/admin/users", label: "User Management", icon: ShieldAlert },
  { href: "/admin/billing", label: "Billing Approvals", icon: CreditCard },
];

export function Sidebar({ onCloseMobile, user }: SidebarProps) {
  const pathname = usePathname();

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const renderLink = (item: { href: string; label: string; icon: any }) => {
    const Icon = item.icon;
    const isActive =
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

    return (
      <Link
        key={item.href}
        href={item.href}
        prefetch={true}
        onClick={handleNavClick}
        className={cn(
          "group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all",
          isActive
            ? "bg-slate-900 text-white shadow-2xs"
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
    <aside className="w-[230px] bg-white border-r border-slate-200/80 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100">
        <Link
          href="/dashboard"
          onClick={handleNavClick}
          className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <span className="font-bold text-xs">T</span>
          </div>
          <span className="font-bold text-xs tracking-tight text-slate-900">
            Tuyul Tracker
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {/* Core Links */}
        <div className="space-y-1">
          {mainNavItems.map(renderLink)}
        </div>

        <Separator className="bg-slate-100" />

        {/* Management Section */}
        <div className="space-y-1">
          <p className="px-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Management
          </p>
          {managementNavItems.map(renderLink)}
        </div>

        {/* Admin Console (Only visible to ADMIN role) */}
        {user?.role === "ADMIN" && (
          <>
            <Separator className="bg-slate-100" />
            <div className="space-y-1">
              <p className="px-3 pb-1 text-[10px] font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                <span>Admin Console</span>
              </p>
              {adminNavItems.map(renderLink)}
            </div>
          </>
        )}
      </nav>

      {/* Footer: Workspace & User Dropdown */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 min-w-0 pr-1">
                <Avatar name={user?.username || "User"} size="sm" />
                <div className="truncate min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                    {user?.username || "User"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">
                    Workspace
                  </p>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="top" className="w-52 mb-1">
            <DropdownMenuLabel className="font-normal py-1.5 px-2">
              <div className="flex flex-col space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{user?.username || "User"}</p>
                <p className="text-[10px] text-slate-400">
                  {user?.role === "ADMIN" ? "Pro Plan" : "Free Plan"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link
                href="/settings/profile"
                onClick={handleNavClick}
                className="flex items-center gap-2 text-xs cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/settings/workspace"
                onClick={handleNavClick}
                className="flex items-center gap-2 text-xs cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Workspace</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/settings/billing"
                onClick={handleNavClick}
                className="flex items-center gap-2 text-xs cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                <span>Billing</span>
              </Link>
            </DropdownMenuItem>

            {user?.role === "ADMIN" && (
              <DropdownMenuItem asChild>
                <Link
                  href="/admin/users"
                  onClick={handleNavClick}
                  className="flex items-center gap-2 text-xs cursor-pointer text-indigo-600 font-medium"
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Admin Console</span>
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <form action={logoutAction} className="w-full">
              <button
                type="submit"
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-sm cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
