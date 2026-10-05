"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  withTagline?: boolean;
  href?: string;
}

/**
 * Dituyulin Original Pixel Mascot & Wordmark
 * Inspired by classic pixel MMORPG spirit/coin companion. 100% original pixel vector art.
 */
export function LogoIcon({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-xs", className)}
    >
      {/* Pixel Spirit Body - Emerald Green / Forest nature slime */}
      <rect x="5" y="4" width="2" height="3" fill="#047857" />
      <rect x="7" y="2" width="4" height="2" fill="#059669" />
      <rect x="6" y="5" width="12" height="12" fill="#10B981" />
      <rect x="5" y="7" width="14" height="8" fill="#10B981" />
      <rect x="4" y="9" width="16" height="5" fill="#34D399" />
      
      {/* Highlight Shine (Top-Left) */}
      <rect x="7" y="6" width="3" height="2" fill="#A7F3D0" />
      <rect x="6" y="8" width="2" height="2" fill="#A7F3D0" />

      {/* Eyes (Retro Pixel Black & White dot) */}
      <rect x="8" y="10" width="2" height="3" fill="#064E3B" />
      <rect x="8" y="10" width="1" height="1" fill="#FFFFFF" />
      <rect x="14" y="10" width="2" height="3" fill="#064E3B" />
      <rect x="14" y="10" width="1" height="1" fill="#FFFFFF" />

      {/* Cute Pixel Blush */}
      <rect x="6" y="13" width="2" height="1" fill="#F472B6" />
      <rect x="16" y="13" width="2" height="1" fill="#F472B6" />

      {/* Floating Gold Coin / Treasure Sparkle */}
      <rect x="17" y="3" width="3" height="3" fill="#F59E0B" />
      <rect x="18" y="2" width="1" height="1" fill="#FDE68A" />
      <rect x="17" y="4" width="1" height="1" fill="#D97706" />
      
      {/* Pixel Outline Base */}
      <rect x="6" y="17" width="12" height="1" fill="#064E3B" />
      <rect x="7" y="18" width="10" height="1" fill="#064E3B" />
    </svg>
  );
}

export function Logo({
  className = "",
  size = "md",
  withText = true,
  withTagline = false,
  href = "/dashboard",
}: LogoProps) {
  const iconSizes = {
    sm: 22,
    md: 28,
    lg: 38,
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-2 select-none", className)}>
      <div className="p-1 rounded-sm bg-amber-50/80 border border-amber-200/80 shadow-[1px_1px_0px_#d97706] flex items-center justify-center">
        <LogoIcon size={iconSizes[size]} />
      </div>

      {withText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "font-pixel font-bold tracking-tight text-slate-900 leading-none",
                textSizes[size]
              )}
            >
              Dituyulin
            </span>
            <span className="font-pixel text-[9px] uppercase px-1 py-0.2 rounded-xs bg-amber-100 text-amber-800 border border-amber-300 font-bold leading-none">
              SaaS
            </span>
          </div>
          {withTagline && (
            <span className="text-[10px] text-slate-500 font-sans tracking-normal mt-0.5">
              Track every account, the pixel way.
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
