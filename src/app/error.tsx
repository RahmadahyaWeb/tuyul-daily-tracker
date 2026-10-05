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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold text-sm">
        !
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Something went wrong.
        </h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          An unexpected error occurred. Please try refreshing or contact support if the issue persists.
        </p>
      </div>
      <div className="pt-2">
        <Button
          onClick={() => reset()}
          size="sm"
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Try Again
        </Button>
      </div>
    </div>
  );
}
