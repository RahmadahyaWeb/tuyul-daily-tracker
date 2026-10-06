import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#dfd5c5]",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 bg-[#3B6EA8] rounded-none shrink-0 shadow-[0.5px_0.5px_0px_#1e3b60]" />
        <h1 className="text-xl font-bold tracking-tight text-[#231b12] font-sans">
          {title}
        </h1>
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}
