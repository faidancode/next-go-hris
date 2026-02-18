"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableRowActions } from "@/components/shared/table/data-table-row-actions";
import { Position } from "./types";

type PositionColumnsOptions = {
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (position: Position) => void;
  onDelete: (id: string) => void;
};

export function columns({
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: PositionColumnsOptions): ColumnDef<Position>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: true,
    },
    {
      accessorKey: "department_name",
      header: "Department",
      enableSorting: false,
      cell: ({ row }) => row.original.department_name || "-",
    },
    {
      id: "actions",
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => {
        const position = row.original;

        return (
          <DataTableRowActions
            menu="positions"
            id={position.id}
            entityName={position.name}
            onEdit={() => onEdit(position)}
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
