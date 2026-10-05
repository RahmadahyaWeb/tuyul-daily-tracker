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
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
    warning: "bg-amber-50 text-amber-800 border border-amber-200/80",
    neutral: "bg-gray-100 text-gray-700 border border-gray-200/80",
    danger: "bg-red-50 text-red-700 border border-red-200/80",
    blue: "bg-blue-50 text-blue-700 border border-blue-200/80",
  };

  const sizeStyles = {
    sm: "text-[11px] px-1.5 py-0.2 rounded leading-tight font-medium",
    md: "text-xs px-2 py-0.5 rounded-md font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center tracking-tight",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
