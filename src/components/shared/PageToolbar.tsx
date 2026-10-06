import React from "react";
import { cn } from "@/lib/utils";

interface PageToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function PageToolbar({ children, className }: PageToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-[#FCFAF7] border-2 border-[#cfbeaa] rounded-xs shadow-[2px_2px_0px_#dfd5c5]",
        className
      )}
    >
      {children}
    </div>
  );
}
