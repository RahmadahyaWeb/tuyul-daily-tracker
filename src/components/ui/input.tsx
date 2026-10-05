import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || (label ? generatedId : undefined);

    const inputElement = (
      <input
        type={type}
        id={inputId}
        className={cn(
          "flex h-9 w-full rounded-xs border border-[#cfc3b0] bg-white px-3 py-1 text-sm text-[#2c261e] shadow-[1px_1px_0px_#e8dfd2] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#9c8e7b] focus-visible:outline-none focus-visible:border-[#3B6EA8] focus-visible:ring-1 focus-visible:ring-[#3B6EA8] disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-[#A82A1E] focus-visible:ring-[#A82A1E]",
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (label || error || helperText) {
      return (
        <div className="space-y-1.5 w-full">
          {label && (
            <label
              htmlFor={inputId}
              className="text-xs font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
            </label>
          )}
          {inputElement}
          {error && <p className="text-xs text-destructive">{error}</p>}
          {!error && helperText && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
        </div>
      );
    }

    return inputElement;
  }
);
Input.displayName = "Input";

export { Input };
