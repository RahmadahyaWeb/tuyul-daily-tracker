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

import { Logo } from "@/components/brand/Logo";

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
          "group flex items-center px-3 py-2 rounded-xs text-xs font-medium transition-all select-none",
          isActive
            ? "bg-[#3B6EA8] text-white shadow-[1px_1px_0px_#1e3b60]"
            : "text-[#5c4e3b] hover:text-[#231b12] hover:bg-[#F3ECE0]"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon
            className={cn(
              "w-4 h-4 shrink-0 transition-transform group-hover:scale-105",
              isActive ? "text-white" : "text-[#7a6a54] group-hover:text-[#231b12]"
            )}
          />
          <span className="truncate">{item.label}</span>
        </div>
      </Link>
    );
  };

  return (
    <aside className="w-[230px] bg-[#FCFAF7] border-r border-[#dfd5c5] flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#dfd5c5] bg-[#F7F2E9]/60">
        <Link
          href="/dashboard"
          onClick={handleNavClick}
          className="hover:opacity-90 transition-opacity"
        >
          <Logo size="md" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {/* Core Links */}
        <div className="space-y-1">
          <p className="px-3 pb-1 text-[10px] font-bold text-[#8f7e68] uppercase tracking-wider font-sans">
            MAIN
          </p>
          {mainNavItems.map(renderLink)}
        </div>

        <div className="border-b border-[#ebd7b2] my-2" />

        {/* Management Section */}
        <div className="space-y-1">
          <p className="px-3 pb-1 text-[10px] font-bold text-[#8f7e68] uppercase tracking-wider font-sans">
            MANAGEMENT
          </p>
          {managementNavItems.map(renderLink)}
        </div>

        {/* Admin Console (Only visible to ADMIN role) */}
        {user?.role === "ADMIN" && (
          <>
            <div className="border-b border-[#ebd7b2] my-2" />
            <div className="space-y-1">
              <p className="px-3 pb-1 text-[10px] font-bold text-[#3B6EA8] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Shield className="w-3 h-3 text-[#3B6EA8]" />
                <span>ADMINISTRATION</span>
              </p>
              {adminNavItems.map(renderLink)}
            </div>
          </>
        )}
      </nav>

      {/* Footer: Workspace & User Dropdown */}
      <div className="p-2.5 border-t border-[#dfd5c5] bg-[#F7F2E9]/60">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between p-1.5 rounded-xs hover:bg-[#F0E8DC] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 min-w-0 pr-1">
                <Avatar name={user?.username || "User"} size="sm" />
                <div className="truncate min-w-0">
                  <p className="text-xs font-semibold text-[#2c261e] truncate leading-tight">
                    {user?.username || "User"}
                  </p>
                  <p className="text-[10px] text-[#8a7b68] truncate leading-none mt-0.5 font-sans font-medium uppercase">
                    Workspace
                  </p>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8a7b68] shrink-0" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="top" className="w-52 mb-1 rounded-xs border-2 border-[#cfc3b0] bg-[#FCFAF7] shadow-[2px_2px_0px_#baa892]">
            <DropdownMenuLabel className="font-normal py-1.5 px-2">
              <div className="flex flex-col space-y-0.5">
                <p className="text-xs font-bold text-[#2c261e]">{user?.username || "User"}</p>
                <p className="text-[10px] text-[#8a7b68] font-sans uppercase">
                  {user?.role === "ADMIN" ? "Administrator" : "Member"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#e8dfd0]" />

            <DropdownMenuItem asChild>
              <Link
                href="/settings/profile"
                onClick={handleNavClick}
                className="flex items-center gap-2 text-xs cursor-pointer text-[#4d4030] hover:bg-[#F3ECE0] rounded-xs"
              >
                <User className="w-3.5 h-3.5 text-[#7a6a54]" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/settings/workspace"
                onClick={handleNavClick}
                className="flex items-center gap-2 text-xs cursor-pointer text-[#4d4030] hover:bg-[#F3ECE0] rounded-xs"
              >
                <Layers className="w-3.5 h-3.5 text-[#7a6a54]" />
                <span>Workspace</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/settings/billing"
                onClick={handleNavClick}
                className="flex items-center gap-2 text-xs cursor-pointer text-[#4d4030] hover:bg-[#F3ECE0] rounded-xs"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#7a6a54]" />
                <span>Billing</span>
              </Link>
            </DropdownMenuItem>

            {user?.role === "ADMIN" && (
              <DropdownMenuItem asChild>
                <Link
                  href="/admin/users"
                  onClick={handleNavClick}
                  className="flex items-center gap-2 text-xs cursor-pointer text-[#3B6EA8] font-semibold hover:bg-[#F3ECE0] rounded-xs"
                >
                  <Shield className="w-3.5 h-3.5 text-[#3B6EA8]" />
                  <span>Admin Console</span>
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-[#e8dfd0]" />

            <form action={logoutAction} className="w-full">
              <button
                type="submit"
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[#A82A1E] hover:bg-[#FDECEB] rounded-xs cursor-pointer transition-colors font-medium"
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
