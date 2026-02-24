"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableRowActions } from "@/components/shared/table/data-table-row-actions";
import { Badge } from "@/components/ui/badge";
import { User } from "./types";

type UserColumnsOptions = {
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
};

export function columns({
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: UserColumnsOptions): ColumnDef<User>[] {
  return [
    {
      accessorKey: "full_name",
      header: "Full Name",
      enableSorting: true,
      cell: ({ row }) => row.original.full_name || "No Name",
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
    },
    {
      accessorKey: "is_active",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => {
        const isActive = row.original.is_active;
        return (
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      enableSorting: true,
      cell: ({ row }) => {
        return new Date(row.original.created_at).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    },
    {
      id: "actions",
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DataTableRowActions
            menu="users"
            id={user.id}
            entityName={user.email}
            onEdit={() => onEdit(user)}
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
