"use client";

import { ForbiddenState } from "@/components/guard/ForbiddenState";
import AppHeader from "@/components/shared/app-header";
import { DataTable } from "@/components/shared/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { can } from "@/lib/rbac/can";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { columns } from "./columns";
import PayrollSheet from "./sheet";
import { usePayrolls, useApprovePayroll, useMarkPaidPayroll, useDeletePayroll } from "@/hooks/use-payroll";
import { usePayrollSheet } from "@/hooks/use-payroll-sheet";
import { downloadPayslip } from "@/lib/api/payroll";

export default function PayrollsPage() {
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    canRead: false,
    canCreate: false,
    canApprove: false,
    canPay: false,
    canDelete: false,
  });

  const { openCreate, openView } = usePayrollSheet();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("period_start:desc");

  const payrollsQuery = usePayrolls(
    page,
    pageSize,
    debouncedSearch,
    sort,
    {},
    permissions.canRead
  );

  const approveMutation = useApprovePayroll();
  const payMutation = useMarkPaidPayroll();
  const deleteMutation = useDeletePayroll();

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const [read, create, approve, pay, del] = await Promise.all([
          can("payroll", "read"),
          can("payroll", "create"),
          can("payroll", "approve"),
          can("payroll", "pay"),
          can("payroll", "delete"),
        ]);

        if (!mounted) return;

        setPermissions({
          canRead: read,
          canCreate: create,
          canApprove: approve,
          canPay: pay,
          canDelete: del,
        });
      } catch {
        // Handle error if needed
      } finally {
        if (mounted) setPermissionLoading(false);
      }
    }

    void bootstrap();
    return () => { mounted = false; };
  }, []);

  if (permissionLoading || payrollsQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!permissions.canRead) {
    return <ForbiddenState description="You are not allowed to read payrolls." />;
  }

  return (
    <>
      <AppHeader title="Payrolls" />

      <div className="container pt-2">
        <div className="flex items-center justify-between mb-4 mt-6 gap-2">
          <Input
            type="text"
            placeholder="Search payroll..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="bg-white p-2 border rounded-lg w-64"
          />

          {permissions.canCreate && (
            <Button onClick={openCreate}>
              <PlusCircle className="size-4 mr-2" /> Create Payroll
            </Button>
          )}
        </div>

        {payrollsQuery.error ? (
          <ForbiddenState title="Request error" description={payrollsQuery.error.message} />
        ) : (
          <DataTable
            columns={columns({
              canApprove: permissions.canApprove,
              canPay: permissions.canPay,
              canDelete: permissions.canDelete,
              onView: openView,
              onApprove: (id) => approveMutation.mutate(id),
              onMarkPaid: (id) => payMutation.mutate(id),
              onDelete: (id) => deleteMutation.mutate(id),
              onDownload: (id) => void downloadPayslip(id),
            })}
            data={payrollsQuery.data?.data ?? []}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={payrollsQuery.data?.meta.totalPages ?? 1}
            sort={sort}
            setSort={setSort}
          />
        )}
      </div>

      <PayrollSheet />
    </>
  );
}

