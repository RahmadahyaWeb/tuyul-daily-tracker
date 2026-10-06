"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAF8F5] text-center space-y-4">
      <div className="rounded-xs border border-[#cfbeaa] bg-white p-8 shadow-[2px_2px_0px_#ded5c5] max-w-sm w-full space-y-4">
        <div className="w-12 h-12 rounded-none bg-[#FDECEB] border border-[#f5c6cb] flex items-center justify-center mx-auto text-[#A82A1E] font-bold text-base">
          !
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-[#231b12]">
            Something went wrong
          </h1>
          <p className="text-xs text-[#736350] max-w-xs mx-auto">
            An unexpected error occurred. Please try refreshing or contact support if the issue persists.
          </p>
        </div>
        <div className="pt-2">
          <Button
            onClick={() => reset()}
            size="default"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" /> Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
