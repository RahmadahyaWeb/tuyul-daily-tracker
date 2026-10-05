import React from "react";
import { Spinner } from "@/components/ui/spinner";

export default function WeeklyLoading() {
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center p-6">
      <Spinner size="md" />
    </div>
  );
}
