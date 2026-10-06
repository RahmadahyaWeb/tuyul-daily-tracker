import React from "react";
import { cn } from "@/lib/utils";

interface AppPageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function AppPage({ children, className, ...props }: AppPageProps) {
  return (
    <div className={cn("space-y-6 w-full", className)} {...props}>
      {children}
    </div>
  );
}
