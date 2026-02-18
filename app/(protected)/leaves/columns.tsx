"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Leave, LeaveStatus } from "./types";

const STATUS_BADGE_CLASS: Record<LeaveStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
};

type LeaveColumnsOptions = {
  canApprove: boolean;
  approvingId: string | null;
  onApprove: (leave: Leave) => void;
  onReject: (leave: Leave) => void;
};

export function columns({
  canApprove,
  approvingId,
  onApprove,
  onReject,
}: LeaveColumnsOptions): ColumnDef<Leave>[] {
  return [
    {
      accessorKey: "employee_name",
      header: "Employee",
      enableSorting: true,
      cell: ({ row }) => row.original.employee_name || row.original.employee_id,
    },
    {
      accessorKey: "leave_type",
      header: "Type",
      enableSorting: true,
    },
    {
      accessorKey: "start_date",
      header: "Date",
      enableSorting: true,
      cell: ({ row }) => `${row.original.start_date} - ${row.original.end_date}`,
    },
    {
      accessorKey: "total_days",
      header: "Total Days",
      enableSorting: true,
      cell: ({ row }) => row.original.total_days ?? "-",
    },
    {
      accessorKey: "reason",
      header: "Reason",
      enableSorting: false,
      cell: ({ row }) => row.original.reason || "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => (
        <Badge variant="outline" className={STATUS_BADGE_CLASS[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => {
        const leave = row.original;
        const isPending = leave.status === "PENDING";
        const isLoading = approvingId === leave.id;

        if (!canApprove || !isPending) {
          return <span className="text-muted-foreground">-</span>;
        }

        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isLoading}
              onClick={() => onApprove(leave)}
            >
              {isLoading ? "Processing..." : "Approve"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isLoading}
              onClick={() => onReject(leave)}
            >
              {isLoading ? "Processing..." : "Reject"}
            </Button>
          </div>
        );
      },
    },
  ];
}

