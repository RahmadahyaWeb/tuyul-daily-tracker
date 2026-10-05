"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  itemLabel = "items",
  className = "",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate page numbers to display with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (safeCurrentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-3 border-t border-slate-200/80 bg-white/80 text-xs text-slate-600 ${className}`}
    >
      {/* Left side: Item Count & Page Size Selector */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <span className="text-slate-500 font-medium">
          Showing <strong className="text-slate-900">{startItem}</strong> to{" "}
          <strong className="text-slate-900">{endItem}</strong> of{" "}
          <strong className="text-slate-900">{totalItems}</strong> {itemLabel}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Per page:
            </span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer shadow-2xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right side: Navigation Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 text-slate-600 hover:text-slate-900 disabled:opacity-40"
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage <= 1}
          title="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 text-slate-600 hover:text-slate-900 disabled:opacity-40"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-slate-400 select-none text-xs"
                >
                  ...
                </span>
              );
            }

            const isCurrent = p === safeCurrentPage;
            return (
              <Button
                key={`page-${p}`}
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                className={`h-7 min-w-7 px-2 text-xs font-medium transition-colors ${
                  isCurrent
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </Button>
            );
          })}
        </div>

        {/* Mobile current page indicator */}
        <span className="sm:hidden px-2 text-xs font-medium text-slate-700">
          {safeCurrentPage} / {totalPages}
        </span>

        {/* Next Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 text-slate-600 hover:text-slate-900 disabled:opacity-40"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          title="Next Page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 text-slate-600 hover:text-slate-900 disabled:opacity-40"
          onClick={() => onPageChange(totalPages)}
          disabled={safeCurrentPage >= totalPages}
          title="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
