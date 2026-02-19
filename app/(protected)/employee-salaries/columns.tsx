"use client";

import { formatDateID } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { EmployeeSalary } from "./types";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function columns(
  isEmployeeRole: boolean,
): ColumnDef<EmployeeSalary>[] {
  const baseColumns: ColumnDef<EmployeeSalary>[] = [];

  if (!isEmployeeRole) {
    baseColumns.push({
      accessorKey: "employee_name",
      header: "Employee",
      enableSorting: false,
      cell: ({ row }) => row.original.employee_name || row.original.employee_id,
    });
  }

  baseColumns.push(
    {
      accessorKey: "base_salary",
      header: "Base Salary",
      enableSorting: true,
      cell: ({ row }) => currencyFormatter.format(row.original.base_salary || 0),
    },
    {
      accessorKey: "effective_date",
      header: "Effective Date",
      enableSorting: true,
      cell: ({ row }) => formatDateID(row.original.effective_date),
    },
  );

  return baseColumns;
}

