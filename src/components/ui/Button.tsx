"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer";

    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
      secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/60",
      outline: "border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white",
      danger: "bg-red-600/90 text-white hover:bg-red-700 shadow-sm",
      ghost: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60",
      success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
    };

    const sizes = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5 h-7",
      md: "text-sm px-3.5 py-2 gap-2 h-9",
      lg: "text-base px-4 py-2.5 gap-2.5 h-11",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
