import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xs bg-[#ebd7b2]/70",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
