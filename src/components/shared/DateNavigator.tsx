import React from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateNavigatorProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  onJumpCurrent: () => void;
  jumpLabel?: string;
  isCurrentActive?: boolean;
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
  className?: string;
}

export function DateNavigator({
  currentDate,
  onDateChange,
  onJumpCurrent,
  jumpLabel = "TODAY",
  isCurrentActive = false,
  onPrev,
  onNext,
  disabled = false,
  className,
}: DateNavigatorProps) {
  return (
    <div className={cn("flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2", className)}>
      <div className="flex items-center bg-white border border-[#cfc3b0] rounded-xs p-0.5 shadow-[1px_1px_0px_#e5ddd0] shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-6 sm:w-7 text-[#736350] hover:text-[#231b12]"
          onClick={onPrev}
          disabled={disabled}
          aria-label="Previous"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>

        <Button
          variant={isCurrentActive ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-[11px] sm:text-xs px-2 sm:px-2.5 font-bold text-[#3d3326] font-sans"
          onClick={onJumpCurrent}
          disabled={disabled || isCurrentActive}
        >
          {jumpLabel}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-6 sm:w-7 text-[#736350] hover:text-[#231b12]"
          onClick={onNext}
          disabled={disabled}
          aria-label="Next"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      <DatePicker value={currentDate} onChange={onDateChange} disabled={disabled} className="shrink-0" />
    </div>
  );
}
