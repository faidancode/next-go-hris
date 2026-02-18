"use client";

import { formatDateID, formatTimeID } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getAttendanceStatusBadgeClass } from "@/lib/constants/attendance";
import type { Attendance } from "./types";
import type { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Attendance>[] = [
  {
    accessorKey: "attendance_date",
    header: "Date",
    enableSorting: true,
    cell: ({ getValue }) => formatDateID(getValue<string>()),
  },
  {
    accessorKey: "clock_in",
    header: "Clock In",
    enableSorting: true,
    cell: ({ getValue }) => formatTimeID(getValue<string>()),
  },
  {
    accessorKey: "clock_out",
    header: "Clock Out",
    enableSorting: true,
    cell: ({ getValue }) => formatTimeID(getValue<string>()),
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={getAttendanceStatusBadgeClass(row.original.status)}
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "source",
    header: "Source",
    enableSorting: false,
  },
  {
    accessorKey: "notes",
    header: "Notes",
    enableSorting: false,
    cell: ({ row }) => row.original.notes || "-",
  },
];
