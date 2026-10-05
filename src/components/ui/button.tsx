import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xs text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-white border border-slate-950 shadow-[1.5px_1.5px_0px_#0f172a] hover:bg-slate-800 active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none",
        primary:
          "bg-blue-600 text-white border border-blue-800 shadow-[1.5px_1.5px_0px_#1e3a8a] hover:bg-blue-700 active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none",
        destructive:
          "bg-rose-600 text-white border border-rose-800 shadow-[1.5px_1.5px_0px_#9f1239] hover:bg-rose-700 active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none",
        outline:
          "border border-[#D4CDC5] bg-white text-slate-800 shadow-[1px_1px_0px_rgba(0,0,0,0.06)] hover:bg-[#F5EFEA] hover:border-slate-400 active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none",
        secondary:
          "bg-[#F2ECE4] text-slate-800 border border-[#E2DCD5] shadow-[1px_1px_0px_rgba(0,0,0,0.05)] hover:bg-[#EAE2D8] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none",
        ghost: "hover:bg-[#F2ECE4] text-slate-700",
        link: "text-blue-600 underline-offset-4 hover:underline",
        rpg:
          "bg-amber-500 text-slate-950 font-bold border border-amber-700 shadow-[1.5px_1.5px_0px_#78350f] hover:bg-amber-400 active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none",
        "ghost-danger":
          "text-slate-500 hover:text-rose-600 hover:bg-rose-50",
      },
      size: {
        default: "h-8.5 px-3.5 py-1.5",
        sm: "h-7.5 px-2.5 text-xs",
        lg: "h-10 px-5 text-sm",
        icon: "h-7.5 w-7.5",
        xs: "h-6.5 px-2 text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin mr-1" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
