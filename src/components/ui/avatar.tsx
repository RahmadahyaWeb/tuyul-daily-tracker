import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ name = "U", size = "md", className, ...props }: AvatarProps) {
  const initials = (name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs font-semibold",
    lg: "w-10 h-10 text-sm font-semibold",
  };

  // Deterministic subtle pastel gradient based on name hash
  const colors = [
    "from-violet-500/20 to-indigo-500/20 text-indigo-700 border-indigo-200/60",
    "from-blue-500/20 to-cyan-500/20 text-blue-700 border-blue-200/60",
    "from-emerald-500/20 to-teal-500/20 text-emerald-700 border-emerald-200/60",
    "from-amber-500/20 to-orange-500/20 text-amber-700 border-amber-200/60",
    "from-rose-500/20 to-pink-500/20 text-rose-700 border-rose-200/60",
  ];

  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = (name || "").charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-xs bg-gradient-to-br border shrink-0 select-none shadow-[1px_1px_0px_#ded5c5]",
        sizeClasses[size],
        colors[colorIndex],
        className
      )}
      {...props}
    >
      <span>{initials}</span>
    </div>
  );
}
