import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-xs border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none select-none tracking-tight",
  {
    variants: {
      variant: {
        default:
          "border-[#2a5082] bg-[#3B6EA8] text-white shadow-[1px_1px_0px_#1e3b60]",
        secondary:
          "border-[#cfc3b0] bg-[#f0eae1] text-[#4a3e2e] hover:bg-[#e8e0d4]",
        destructive:
          "border-[#b34032] bg-[#FDECEB] text-[#A82A1E] font-medium shadow-[1px_1px_0px_#e8b0ab]",
        outline: "text-foreground border-[#d6cbba] bg-white/70",
        success:
          "border-[#347A46] bg-[#ECFDF3] text-[#1E5D2F] font-medium shadow-[1px_1px_0px_#b6e4c3]",
        warning:
          "border-[#B57C1E] bg-[#FFF8EB] text-[#8C580B] font-medium shadow-[1px_1px_0px_#f0d49e]",
        neutral:
          "border-[#ded3c3] bg-[#f5efe6] text-[#6d6150] font-medium",
        rpg:
          "border-[#8c7456] bg-[#FAF3E0] text-[#5A4122] font-semibold shadow-[1px_1px_0px_#baa58a]",
      },
      size: {
        default: "text-xs px-2 py-0.5",
        sm: "text-[11px] px-1.5 py-0.25",
        lg: "text-xs px-2.5 py-1 font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
