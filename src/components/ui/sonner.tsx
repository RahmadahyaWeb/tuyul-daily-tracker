"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      richColors
      closeButton
      duration={3500}
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans shadow-lg rounded-xl border text-xs font-medium py-3 px-4 flex items-center gap-2.5",
          title: "text-xs font-semibold leading-tight",
          description: "text-[11px] text-slate-500 mt-0.5",
          actionButton:
            "bg-slate-900 text-white font-medium text-xs px-2.5 py-1 rounded-md hover:bg-slate-800 transition-colors",
          cancelButton:
            "bg-slate-100 text-slate-600 font-medium text-xs px-2.5 py-1 rounded-md hover:bg-slate-200 transition-colors",
          closeButton:
            "border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors",
          success:
            "bg-emerald-50/95 text-emerald-950 border-emerald-200/80 shadow-emerald-500/5",
          error:
            "bg-rose-50/95 text-rose-950 border-rose-200/80 shadow-rose-500/5",
          warning:
            "bg-amber-50/95 text-amber-950 border-amber-200/80 shadow-amber-500/5",
          info:
            "bg-sky-50/95 text-sky-950 border-sky-200/80 shadow-sky-500/5",
        },
      }}
      {...props}
    />
  );
}
