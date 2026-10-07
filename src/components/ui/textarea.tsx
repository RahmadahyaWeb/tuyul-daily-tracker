import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || (label ? generatedId : undefined);

    const textareaElement = (
      <textarea
        id={textareaId}
        className={cn(
          "flex min-h-[70px] w-full rounded-xs border border-[#cfc3b0] bg-white px-3 py-2 text-xs text-[#2c261e] shadow-[1px_1px_0px_#e8dfd2] transition-colors placeholder:text-[#9c8e7b] focus-visible:outline-none focus-visible:border-[#3B6EA8] focus-visible:ring-1 focus-visible:ring-[#3B6EA8] disabled:cursor-not-allowed disabled:opacity-50",
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
              htmlFor={textareaId}
              className="text-xs font-medium text-foreground leading-none"
            >
              {label}
            </label>
          )}
          {textareaElement}
          {error && <p className="text-xs text-destructive">{error}</p>}
          {!error && helperText && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
        </div>
      );
    }

    return textareaElement;
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
