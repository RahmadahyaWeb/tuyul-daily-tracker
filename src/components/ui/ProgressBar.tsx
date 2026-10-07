import * as React from "react";
import { Progress } from "./progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "default" | "success" | "compact";
}

export function ProgressBar({
  progress,
  showLabel = false,
  size = "md",
  className,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-2.5",
  };

  return (
    <div className={cn("w-full flex items-center gap-2", className)}>
      <div className="flex-1">
        <Progress
          value={clampedProgress}
          className={sizeClasses[size]}
          indicatorColor={
            clampedProgress === 100
              ? "bg-[#347A46]"
              : clampedProgress > 0
              ? "bg-[#3B6EA8]"
              : "bg-transparent"
          }
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground w-8 text-right shrink-0">
          {clampedProgress}%
        </span>
      )}
    </div>
  );
}
