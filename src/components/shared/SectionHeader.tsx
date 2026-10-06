import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, badge, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-2 pb-1", className)}>
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#736350] font-sans">
          {title}
        </h2>
        {badge}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
