"use client";

import { useAuthStore } from "@/app/stores/auth";
import { ForbiddenState } from "@/components/guard/ForbiddenState";
import AppHeader from "@/components/shared/app-header";
import { DataTable } from "@/components/shared/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeSalaries } from "@/hooks/use-employee-salary";
import { useEmployeeSalarySheet } from "@/hooks/use-employee-salary-sheet";
import { useEmployees } from "@/hooks/use-employee";
import { can } from "@/lib/rbac/can";
import { PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { columns } from "./columns";
import EmployeeSalarySheet from "./sheet";

export default function EmployeeSalariesPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const role = user?.role?.toLowerCase();
  const isEmployeeRole = role === "employee";
  const employeeId = user?.employee_id;

  const [permissionLoading, setPermissionLoading] = useState(true);
  const [canRead, setCanRead] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);

  const { openCreate } = useEmployeeSalarySheet();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("effective_date:desc");

  const salariesQuery = useEmployeeSalaries(
    page,
    pageSize,
    debouncedSearch,
    sort,
    isEmployeeRole ? employeeId : undefined,
    hasHydrated && canRead && (!isEmployeeRole || Boolean(employeeId)),
  );

  const employeesQuery = useEmployees(
    1,
    1000,
    "",
    "full_name:asc",
    canUpdate && !isEmployeeRole,
  );

  const employeeOptions = useMemo(
    () =>
      (employeesQuery.data?.data ?? []).map((employee) => ({
        id: employee.id,
        name: employee.full_name,
      })),
    [employeesQuery.data?.data],
  );

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const [readAllowed, updateAllowed] = await Promise.all([
          can("salary", "read"),
          can("salary", "update"),
        ]);

        if (!mounted) return;

        setCanRead(readAllowed);
        setCanUpdate(updateAllowed);
      } catch {
        if (!mounted) return;
      } finally {
        if (mounted) setPermissionLoading(false);
      }
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  if (permissionLoading || salariesQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!canRead) {
    return (
      <ForbiddenState
        description="You are not allowed to read employee salaries."
      />
    );
  }

  if (isEmployeeRole && !employeeId) {
    return (
      <ForbiddenState
        title="Employee not found"
        description="Your account is not linked to an employee profile."
      />
    );
  }

  return (
    <>
      <AppHeader title="Employee Salaries" />

      <div className="container pt-2">
        <div className="flex items-center justify-between mb-4 mt-6 gap-2">
          <Input
            type="text"
            placeholder="Search salary..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="bg-white p-2 border rounded-lg w-64"
          />

          {canUpdate && (
            <Button onClick={openCreate}>
              <PlusCircle className="size-4" /> Add Salary
            </Button>
          )}
        </div>

        {salariesQuery.error ? (
          <ForbiddenState
            title="Request error"
            description={salariesQuery.error.message}
          />
        ) : (
          <DataTable
            key={`${page}-${pageSize}`}
            columns={columns(isEmployeeRole)}
            data={salariesQuery.data?.data ?? []}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={salariesQuery.data?.meta.totalPages ?? 1}
            sort={sort}
            setSort={setSort}
          />
        )}
      </div>

      <EmployeeSalarySheet
        employeeOptions={employeeOptions}
        employeesLoading={employeesQuery.isLoading}
        isEmployeeRole={isEmployeeRole}
        selfEmployeeId={employeeId}
      />
    </>
  );
}

