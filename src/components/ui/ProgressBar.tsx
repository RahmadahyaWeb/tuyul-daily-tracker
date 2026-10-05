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
  size = "md",
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value || 0)));

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const getColor = (pct: number) => {
    if (pct >= 100) return "bg-emerald-500";
    if (pct > 0) return "bg-amber-500";
    return "bg-zinc-600";
  };

  return (
    <div className={cn("w-full flex items-center gap-2", className)}>
      <div
        className={cn(
          "w-full bg-zinc-800 rounded-full overflow-hidden flex-1",
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
        <span className="text-xs font-medium text-zinc-300 min-w-[36px] text-right font-mono">
          {clamped}%
        </span>
      )}
    </div>
  );
}
