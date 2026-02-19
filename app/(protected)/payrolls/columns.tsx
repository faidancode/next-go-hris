"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  CheckCircle,
  Banknote,
  Download,
  Trash2,
  Eye,
} from "lucide-react";
import { Payroll } from "./types";

export type PayrollColumnOptions = {
  canApprove: boolean;
  canPay: boolean;
  canDelete: boolean;
  onView: (payroll: Payroll) => void;
  onApprove: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export function columns({
  canApprove,
  canPay,
  canDelete,
  onView,
  onApprove,
  onMarkPaid,
  onDelete,
  onDownload,
}: PayrollColumnOptions): ColumnDef<Payroll>[] {
  return [
    {
      accessorKey: "employee_name",
      header: "Employee",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.employee_name || "N/A"}</div>
      ),
    },
    {
      accessorKey: "period",
      header: "Period",
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {formatDate(row.original.period_start)} -{" "}
            {formatDate(row.original.period_end)}
          </div>
        );
      },
    },
    {
      accessorKey: "net_salary",
      header: "Net Salary",
      cell: ({ row }) => (
        <div className="font-mono">
          {formatCurrency(row.original.net_salary)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status.toLocaleLowerCase();

        let badgeClass = "";

        switch (status) {
          case "paid":
            badgeClass = "bg-blue-100  border border-blue-300  text-blue-800";
            break;
          case "approved":
            badgeClass = "bg-green-100 border border-green-300 text-green-800";
            break;
          case "void":
            badgeClass = "bg-red-100 border border-red-300 text-red-800";
            break;
          default:
            badgeClass = "bg-gray-100 border border-gray-300 text-gray-800";
        }

        return <Badge className={`capitalize ${badgeClass}`}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const payroll = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(payroll)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {payroll.payslip_url && (
                <DropdownMenuItem onClick={() => onDownload(payroll.id)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Payslip
                </DropdownMenuItem>
              )}

              {(canApprove || canPay || canDelete) && <DropdownMenuSeparator />}

              {canApprove && payroll.status.toLowerCase() === "draft" && (
                <DropdownMenuItem onClick={() => onApprove(payroll.id)}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  Approve
                </DropdownMenuItem>
              )}

              {canPay && payroll.status.toLowerCase() === "approved" && (
                <DropdownMenuItem onClick={() => onMarkPaid(payroll.id)}>
                  <Banknote className="mr-2 h-4 w-4 text-blue-600" />
                  Mark as Paid
                </DropdownMenuItem>
              )}

              {canDelete && payroll.status.toLowerCase() === "draft" && (
                <DropdownMenuItem
                  onClick={() => onDelete(payroll.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
