import React from "react";
import { Pagination } from "@/components/ui/pagination";

interface DataTablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

export function DataTablePagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  itemLabel = "items",
}: DataTablePaginationProps) {
  return (
    <Pagination
      currentPage={currentPage}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      pageSizeOptions={pageSizeOptions}
      itemLabel={itemLabel}
    />
  );
}
