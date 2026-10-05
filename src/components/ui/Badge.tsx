import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "neutral" | "danger" | "blue";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  className,
}: BadgeProps) {
  const variantStyles = {
    success: "bg-emerald-950/70 text-emerald-400 border border-emerald-800/60",
    warning: "bg-amber-950/70 text-amber-400 border border-amber-800/60",
    neutral: "bg-zinc-800/80 text-zinc-300 border border-zinc-700/60",
    danger: "bg-red-950/70 text-red-400 border border-red-800/60",
    blue: "bg-blue-950/70 text-blue-400 border border-blue-800/60",
  };

  const sizeStyles = {
    sm: "text-[10px] px-1.5 py-0.5 rounded",
    md: "text-xs px-2 py-0.5 rounded-md",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium tracking-wide",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
