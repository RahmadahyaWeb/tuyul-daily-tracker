"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-5 w-5 shrink-0 rounded-xs border-2 border-[#8c7860] bg-[#FCFAF7] shadow-[1px_1px_0px_#baa892] hover:border-[#231b12] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B6EA8] disabled:cursor-not-allowed disabled:opacity-40 data-[state=checked]:bg-[#1E5D2F] data-[state=checked]:border-[#143E20] data-[state=checked]:text-white data-[state=checked]:shadow-[1.5px_1.5px_0px_#0b2312] cursor-pointer transition-all checkbox-interactive",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4 stroke-[3.5]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
