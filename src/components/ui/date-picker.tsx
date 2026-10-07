"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  formatDateDisplay,
  getTodayMakassar,
  addDays,
  isValidDateString,
} from "@/lib/date-utils";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  disabled?: boolean;
  className?: string;
  align?: "start" | "center" | "end";
}

export function DatePicker({
  value,
  onChange,
  disabled = false,
  className = "",
  align = "end",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const todayStr = getTodayMakassar();

  // Parse initial view year and month from value (or today)
  const initialDateStr = isValidDateString(value) ? value : todayStr;
  const [initialYear, initialMonth] = initialDateStr.split("-").map(Number);

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth); // 1-12

  // Sync view when value changes or popover opens
  useEffect(() => {
    if (isValidDateString(value)) {
      const [y, m] = value.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m);
    }
  }, [value, open]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handlePrevYear = () => {
    setViewYear((y) => y - 1);
  };

  const handleNextYear = () => {
    setViewYear((y) => y + 1);
  };

  const handleSelectDate = (dateStr: string) => {
    onChange(dateStr);
    setOpen(false);
  };

  // Generate 42 days grid for the month view (Monday start)
  const getCalendarDays = () => {
    // 1st day of the view month
    const firstDay = new Date(Date.UTC(viewYear, viewMonth - 1, 1));
    // getUTCDay: 0=Sun, 1=Mon... 6=Sat
    const firstDayOfWeek = firstDay.getUTCDay();
    // Days needed from previous month (Monday = 1 -> 0 padding, Sunday = 0 -> 6 padding)
    const paddingLeft = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Total days in current month
    const daysInCurrentMonth = new Date(
      Date.UTC(viewYear, viewMonth, 0)
    ).getUTCDate();

    // Total days in previous month
    const daysInPrevMonth = new Date(
      Date.UTC(viewYear, viewMonth - 1, 0)
    ).getUTCDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }[] = [];

    // 1. Padding days from prev month
    for (let i = paddingLeft - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthNum = viewMonth === 1 ? 12 : viewMonth - 1;
      const prevYearNum = viewMonth === 1 ? viewYear - 1 : viewYear;
      const dStr = `${prevYearNum}-${String(prevMonthNum).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      days.push({
        dateStr: dStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === value,
      });
    }

    // 2. Days in current month
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const dStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        dateStr: dStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        isSelected: dStr === value,
      });
    }

    // 3. Padding days for next month to complete 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    const totalCellsNeeded = days.length + remaining < 35 ? 35 : days.length + remaining;
    const additionalPadding = totalCellsNeeded - days.length;

    for (let i = 1; i <= additionalPadding; i++) {
      const nextMonthNum = viewMonth === 12 ? 1 : viewMonth + 1;
      const nextYearNum = viewMonth === 12 ? viewYear + 1 : viewYear;
      const dStr = `${nextYearNum}-${String(nextMonthNum).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        dateStr: dStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === value,
      });
    }

    return days;
  };

  const calendarDays = getCalendarDays();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`inline-flex items-center gap-2 text-xs font-semibold text-[#3d3326] bg-white hover:bg-[#FAF7F2] border border-[#cfc3b0] px-3 py-1.5 rounded-xs shadow-[1px_1px_0px_#e5ddd0] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          <CalendarIcon className="w-3.5 h-3.5 text-[#3B6EA8]" />
          <span>{formatDateDisplay(value, "en-US")}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        className="w-[300px] p-3 shadow-[3px_4px_0px_#cfbeaa] rounded-xs border-2 border-[#cfbeaa] bg-[#FCFAF7]"
      >
        {/* Calendar Header with Navigation */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#ebd7b2]">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handlePrevYear}
              className="p-1 rounded-xs text-[#8a7b68] hover:text-[#231b12] hover:bg-[#F3ECE0] transition-colors cursor-pointer"
              title="Previous Year"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-xs text-[#8a7b68] hover:text-[#231b12] hover:bg-[#F3ECE0] transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs font-bold text-[#231b12] font-pixel tracking-wider uppercase">
            {monthNames[viewMonth - 1]} {viewYear}
          </div>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-xs text-[#8a7b68] hover:text-[#231b12] hover:bg-[#F3ECE0] transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextYear}
              className="p-1 rounded-xs text-[#8a7b68] hover:text-[#231b12] hover:bg-[#F3ECE0] transition-colors cursor-pointer"
              title="Next Year"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {dayHeaders.map((dh) => (
            <div
              key={dh}
              className="text-[10px] font-bold text-[#8a7b68] uppercase tracking-wider py-1 font-pixel"
            >
              {dh}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarDays.map((d) => {
            const isSelected = d.isSelected;
            const isToday = d.isToday;
            const isCurrentMonth = d.isCurrentMonth;

            return (
              <button
                key={d.dateStr}
                type="button"
                onClick={() => handleSelectDate(d.dateStr)}
                className={`h-8 w-8 mx-auto rounded-xs text-xs font-medium flex items-center justify-center transition-all cursor-pointer relative ${
                  isSelected
                    ? "bg-[#3B6EA8] text-white font-bold shadow-[1px_1px_0px_#1e3b60]"
                    : isToday
                    ? "bg-[#FAF2E1] text-[#664b28] font-bold border border-[#d2c0aa]"
                    : isCurrentMonth
                    ? "text-[#2c261e] hover:bg-[#F3ECE0]"
                    : "text-[#b8aa97] hover:bg-[#FAF7F2]"
                }`}
              >
                <span>{d.dayNumber}</span>
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-none bg-[#B57C1E]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Shortcuts Footer */}
        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#ebd7b2] text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSelectDate(todayStr)}
              className="text-[11px] font-bold text-[#3B6EA8] hover:underline cursor-pointer flex items-center gap-1 font-pixel uppercase"
            >
              <Clock className="w-3 h-3" />
              Today
            </button>
            <span className="text-[#cfc3b0]">•</span>
            <button
              type="button"
              onClick={() => handleSelectDate(addDays(todayStr, -1))}
              className="text-[11px] font-medium text-[#736350] hover:text-[#231b12] cursor-pointer"
            >
              Yesterday
            </button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-6 px-2 text-[11px] text-[#8a7b68] hover:text-[#231b12]"
          >
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
