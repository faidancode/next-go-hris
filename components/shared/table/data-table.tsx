"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  page: number; // Add page prop
  setPage: (page: number) => void;
  pageSize: number; // Add pageSize prop
  setPageSize: (pageSize: number) => void;
  totalPages: number; // Add page prop
  sort: string;
  setSort: (sort: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  page, // Destructure page
  setPage, // Destructure setPage
  pageSize, // Destructure Limit
  setPageSize, // Destructure setPageSize
  totalPages,
  sort,
  setSort,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: true,
    state: {
      sorting: sort
        ? [
            {
              id: sort.split(":")[0],
              desc: sort.split(":")[1] === "desc",
            },
          ]
        : [],
    },
    onSortingChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(table.getState().sorting)
          : updater;

      if (!next.length) {
        setSort("createdAt:desc");
        return;
      }

      const s = next[0];
      setSort(`${s.id}:${s.desc ? "desc" : "asc"}`);
      setPage(1);
    },
  });
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer"
                        : "cursor-default text-muted-foreground"
                    }
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                      {header.column.getIsSorted() === "asc" && (
                        <ArrowUp className="w-4 h-4" />
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <ArrowDown className="w-4 h-4" />
                      )}
                      {!header.column.getIsSorted() && (
                        <ArrowUpDown className="w-4 h-4 opacity-40" />
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getCoreRowModel().rows?.length ? (
            table.getCoreRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination
        table={table}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalPages={totalPages}
      />
    </div>
  );
}
