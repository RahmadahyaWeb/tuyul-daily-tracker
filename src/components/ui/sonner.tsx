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
            "group toast font-sans shadow-[2px_2px_0px_#baa892] rounded-xs border text-xs font-medium py-3 px-4 flex items-center gap-2.5",
          title: "text-xs font-semibold leading-tight",
          description: "text-[11px] text-slate-600 mt-0.5",
          actionButton:
            "bg-[#3B6EA8] text-white font-medium text-xs px-2.5 py-1 rounded-xs hover:bg-[#2F5B8D] transition-colors shadow-[1px_1px_0px_#1e3b60]",
          cancelButton:
            "bg-[#f0eae1] text-[#4a3e2e] font-medium text-xs px-2.5 py-1 rounded-xs hover:bg-[#e4dcce] transition-colors border border-[#cfc3b0]",
          closeButton:
            "border-[#cfc3b0] bg-[#fbf9f5] text-[#7a6d5c] hover:text-[#2c261e] hover:bg-[#ede5d8] transition-colors",
          success:
            "bg-[#F2FAF4] text-[#1E5D2F] border-[#347A46]",
          error:
            "bg-[#FDF4F3] text-[#A82A1E] border-[#b34032]",
          warning:
            "bg-[#FFFBF0] text-[#8C580B] border-[#B57C1E]",
          info:
            "bg-[#F2F7FC] text-[#204E85] border-[#3B6EA8]",
        },
      }}
      {...props}
    />
  );
}
