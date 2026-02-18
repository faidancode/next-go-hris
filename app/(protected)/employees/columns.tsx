"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableRowActions } from "@/components/shared/table/data-table-row-actions";
import { Employee } from "./types";

type EmployeeColumnsOptions = {
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
};

export function columns({
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: EmployeeColumnsOptions): ColumnDef<Employee>[] {
  return [
    {
      accessorKey: "full_name",
      header: "Full Name",
      enableSorting: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: false,
      cell: ({ row }) => row.original.email || "-",
    },
    {
      id: "actions",
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => {
        const employee = row.original;

        return (
          <DataTableRowActions
            menu="employees"
            id={employee.id}
            entityName={employee.full_name}
            onEdit={() => onEdit(employee)}
            onDelete={onDelete}
            showView={false}
            showEdit={canUpdate}
            showDelete={canDelete}
          />
        );
      },
    },
  ];
}
