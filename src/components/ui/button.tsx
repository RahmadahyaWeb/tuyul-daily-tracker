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
          "bg-[#3B6EA8] text-white border border-[#234c7a] shadow-[2px_2px_0px_#1e3b60] hover:bg-[#325d90] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
        primary:
          "bg-[#3B6EA8] text-white border border-[#234c7a] shadow-[2px_2px_0px_#1e3b60] hover:bg-[#325d90] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
        destructive:
          "bg-[#A82A1E] text-white border border-[#7a1e15] shadow-[2px_2px_0px_#591610] hover:bg-[#8f2419] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
        outline:
          "border border-[#cfbeaa] bg-white text-[#2c261e] shadow-[2px_2px_0px_#ded5c5] hover:bg-[#FAF6F0] hover:border-[#b5a38f] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
        secondary:
          "bg-[#F4EEE7] text-[#2c261e] border border-[#cfbeaa] shadow-[2px_2px_0px_#ded5c5] hover:bg-[#EAE2D8] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
        ghost: "hover:bg-[#F3ECE0] text-[#5c4e3b] hover:text-[#231b12] active:bg-[#EAE1D3]",
        link: "text-[#3B6EA8] underline-offset-4 hover:underline",
        rpg:
          "bg-[#3B6EA8] text-white font-bold border border-[#234c7a] shadow-[2px_2px_0px_#1e3b60] hover:bg-[#325d90] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
        "ghost-danger":
          "text-[#736350] hover:text-[#A82A1E] hover:bg-[#FDECEB] active:bg-[#fbdad7]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-5 text-sm",
        icon: "h-8 w-8",
        xs: "h-7 px-2 text-[11px]",
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
