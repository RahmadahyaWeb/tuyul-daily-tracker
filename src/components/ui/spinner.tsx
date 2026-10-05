import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function Spinner({ className, size = "md", label }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-10 h-10 border-[2.5px]",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2.5", className)}>
      <div
        className={cn(
          "rounded-full border-slate-200 border-t-slate-900 animate-spin",
          sizeClasses[size]
        )}
      />
      {label && (
        <span className="text-xs font-medium text-slate-400 tracking-wide animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
}
