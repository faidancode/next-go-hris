import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  setPageSize?: (pageSize: number) => void;
  pageSize: number;
  setPage?: (pageSize: number) => void;
  page: number;
  totalPages: number;
}

export function DataTablePagination<TData>({
  table,
  pageSize,
  setPageSize,
  page,
  setPage,
  totalPages,
}: DataTablePaginationProps<TData> & {
  setPageSize?: (newLimit: number) => void;
  setPage?: (newPage: number) => void;
}) {
  const canPreviousPage = page > 1 ? true : false;
  const canNextPage = page < totalPages ? true : false;
  return (
    <div>
      {totalPages > 0 ? (
        <div className="flex items-center justify-between p-2 border-t bg-gray-50">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                // table.setPageSize(Number(value));
                // Call prop if available
                if (setPageSize) {
                  setPageSize(Number(value));
                  if (setPage) {
                    setPage(1);
                  }
                }
              }}
            >
              <SelectTrigger className="h-8 w-17.5">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 25, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex w-45 items-center justify-center text-sm font-medium">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => {
                  if (table) {
                    table.setPageIndex(0);
                    if (setPage) {
                      setPage(1);
                    }
                  }
                }}
                disabled={!canPreviousPage}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => {
                  table.previousPage();
                  if (setPage) {
                    setPage(page - 1);
                  }
                }}
                disabled={!canPreviousPage}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input
                min={1}
                max={totalPages}
                type="number"
                // defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) : 1;
                  if (setPage) {
                    setPage(Number(page));
                  }
                }}
                value={page}
                className="border rounded w-16 text-center"
              />
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => {
                  table.nextPage();
                  if (setPage) {
                    setPage(page + 1);
                  }
                }}
                disabled={!canNextPage}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => {
                  if (table) {
                    table.setPageIndex(table.getPageCount() - 1);
                    if (setPage) {
                      setPage(Number(totalPages));
                    }
                  }
                }}
                disabled={!canNextPage}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-2 border-t bg-gray-50" />
      )}
    </div>
  );
}
