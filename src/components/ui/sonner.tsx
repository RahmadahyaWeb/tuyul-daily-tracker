"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg text-xs font-medium",
          description: "group-[.toast]:text-slate-500 text-xs",
          actionButton:
            "group-[.toast]:bg-slate-900 group-[.toast]:text-white font-medium text-xs",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600 font-medium text-xs",
          error: "group-[.toaster]:border-rose-200 group-[.toaster]:text-rose-900",
          success: "group-[.toaster]:border-emerald-200 group-[.toaster]:text-emerald-900",
        },
      }}
      {...props}
    />
  );
}
