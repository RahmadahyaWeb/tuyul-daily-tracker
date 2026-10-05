"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Finish loading when route changes
    setLoading(true);
    setProgress(30);

    const t1 = setTimeout(() => setProgress(70), 100);
    const t2 = setTimeout(() => setProgress(100), 200);
    const t3 = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname, searchParams]);

  // Listen to global loading events from client transitions
  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
      setProgress(40);
    };
    const handleEnd = () => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
    };

    window.addEventListener("app:loading:start", handleStart);
    window.addEventListener("app:loading:end", handleEnd);

    return () => {
      window.removeEventListener("app:loading:start", handleStart);
      window.removeEventListener("app:loading:end", handleEnd);
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[2.5px] bg-transparent overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(99,102,241,0.6)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? "width 0.2s ease-out, opacity 0.3s ease-out" : "width 0.2s ease-out",
        }}
      />
    </div>
  );
}

/**
 * Helper utilities to trigger global top progress bar manually for any background task
 */
export const globalLoading = {
  start: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("app:loading:start"));
    }
  },
  end: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("app:loading:end"));
    }
  },
};
