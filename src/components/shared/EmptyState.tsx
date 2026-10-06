import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: any;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "p-8 bg-white border border-[#ded5c5] rounded-xs text-center shadow-[1px_1px_0px_#e5ddd0] space-y-2",
        className
      )}
    >
      {Icon && (
        <div className="flex justify-center text-[#8a7b68] mb-1">
          <Icon className="w-8 h-8 opacity-60" />
        </div>
      )}
      <p className="text-xs font-semibold text-[#3d3326]">{title}</p>
      {description && <p className="text-xs text-[#736350] max-w-sm mx-auto">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
