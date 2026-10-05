import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0 to 100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  size = "sm",
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value || 0)));

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  const getColor = (pct: number) => {
    if (pct >= 100) return "bg-emerald-600";
    if (pct > 0) return "bg-blue-600";
    return "bg-gray-300";
  };

  return (
    <div className={cn("w-full flex items-center gap-2", className)}>
      <div
        className={cn(
          "w-full bg-gray-200 rounded-full overflow-hidden flex-1",
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out rounded-full",
            getColor(clamped)
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-600 min-w-[32px] text-right font-mono">
          {clamped}%
        </span>
      )}
    </div>
  );
}
