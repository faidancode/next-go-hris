"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableRowActions } from "@/components/shared/table/data-table-row-actions";
import { Badge } from "@/components/ui/badge";
import type { Leave, LeaveStatus } from "./types";
import { formatDateID } from "@/lib/utils";

const STATUS_BADGE_CLASS: Record<LeaveStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  SUBMITTED: "bg-blue-100 text-blue-700 border-blue-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
};

type LeaveColumnsOptions = {
  canCreate: boolean;
  canApprove: boolean;
  onSubmit: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onDelete?: (id: string) => void;
};

export function columns({
  canCreate,
  canApprove,
  onSubmit,
  onApprove,
  onReject,
  onDelete,
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
      cell: ({ row }) => {
        const isSame = row.original.start_date === row.original.end_date;

        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {formatDateID(row.original.start_date, "short")}
            </span>
            {!isSame && (
              <span className="text-xs text-muted-foreground">
                - {formatDateID(row.original.end_date, "short")}
              </span>
            )}
          </div>
        );
      },
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
        <Badge
          variant="outline"
          className={STATUS_BADGE_CLASS[row.original.status]}
        >
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

        return (
          <DataTableRowActions
            menu="leaves"
            id={leave.id}
            entityName="Leave Request"
            onSubmit={onSubmit}
            onApprove={onApprove}
            onReject={onReject}
            onDelete={onDelete}
            showView={false}
            showEdit={false}
            showSubmission={canCreate && leave.status === "PENDING"}
            showApproval={canApprove && leave.status === "SUBMITTED"}
            showRejection={canApprove && leave.status === "SUBMITTED"}
            showDelete={canApprove && Boolean(onDelete)}
          />
        );
      },
    },
  ];
}
