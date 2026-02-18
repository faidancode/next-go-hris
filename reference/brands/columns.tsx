"use client";

import { DataTableRowActions } from "@/components/shared/table/data-table-row-actions";
import { Brand } from "@/types/brand";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

export const columns = (
  handleDelete: (id: string) => void,
  handleEdit: (brand: Brand) => void,
): ColumnDef<Brand>[] => [
  {
    accessorKey: "name",
    header: "Brand",
    enableSorting: true,
  },
  {
    accessorKey: "imageUrl",
    header: "Logo",
    enableSorting: false, // Biasanya logo tidak perlu di-sort
    cell: ({ row }) => {
      const imageUrl = row.getValue("imageUrl") as string;
      const brandName = row.getValue("name") as string;

      return (
        <div className="relative h-10 w-10 overflow-hidden rounded-md border">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${brandName} logo`}
              fill
              className="object-contain p-1"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
              No Logo
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions
        menu="brands"
        id={row.original.id}
        entityName={row.original.name}
        onDelete={handleDelete}
        onEdit={() => handleEdit(row.original)}
        showView={false}
      />
    ),
  },
];
