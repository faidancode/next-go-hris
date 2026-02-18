"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { Department } from "./types";

type DepartmentColumnsOptions = {
  canUpdate: boolean;
  canDelete: boolean;
  deletingId: string | null;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
};

export function columns({
  canUpdate,
  canDelete,
  deletingId,
  onEdit,
  onDelete,
}: DepartmentColumnsOptions): ColumnDef<Department>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: true,
    },
    {
      accessorKey: "parent_department_id",
      header: "Parent Department ID",
      enableSorting: false,
      cell: ({ row }) => row.original.parent_department_id || "-",
    },
    {
      id: "actions",
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => {
        const department = row.original;
        const isDeleting = deletingId === department.id;

        if (!canUpdate && !canDelete) {
          return <span className="text-muted-foreground">-</span>;
        }

        return (
          <div className="flex gap-2">
            {canUpdate && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(department)}
              >
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                disabled={isDeleting}
                onClick={() => onDelete(department)}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}
