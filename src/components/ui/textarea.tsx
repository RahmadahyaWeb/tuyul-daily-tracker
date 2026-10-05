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
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
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
