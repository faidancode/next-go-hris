"use client";

import { ForbiddenState } from "@/components/guard/ForbiddenState";
import AppHeader from "@/components/shared/app-header";
import { DataTable } from "@/components/shared/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { can } from "@/lib/rbac/can";
import { useDepartments } from "@/hooks/use-department";
import { usePositions } from "@/hooks/use-position";
import { PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import { columns } from "./columns";
import EmployeeSheet from "./sheet";
import type { Employee } from "./types";
import { useEmployeeSheet } from "@/hooks/use-employee-sheet";
import { useDeleteEmployee, useEmployees } from "@/hooks/use-employee";

export default function EmployeesPage() {
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [canRead, setCanRead] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const { openCreate, openEdit } = useEmployeeSheet();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("full_name:asc");

  const employeesQuery = useEmployees(
    page,
    pageSize,
    debouncedSearch,
    sort,
    canRead,
  );
  const departmentsQuery = useDepartments(1, 1000, "", "name:asc", canRead);
  const positionsQuery = usePositions(1, 1000, "", "name:asc", canRead);
  const deleteEmployeeMutation = useDeleteEmployee();

  const departmentOptions = useMemo(
    () =>
      (departmentsQuery.data?.data ?? []).map((department) => ({
        id: department.id,
        name: department.name,
      })),
    [departmentsQuery.data?.data],
  );

  const positionOptions = useMemo(
    () =>
      (positionsQuery.data?.data ?? []).map((position) => ({
        id: position.id,
        name: position.name,
        department_id: position.department_id,
      })),
    [positionsQuery.data?.data],
  );

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const [readAllowed, createAllowed, updateAllowed, deleteAllowed] =
          await Promise.all([
            can("employee", "read"),
            can("employee", "create"),
            can("employee", "update"),
            can("employee", "delete"),
          ]);

        if (!mounted) return;

        setCanRead(readAllowed);
        setCanCreate(createAllowed);
        setCanUpdate(updateAllowed);
        setCanDelete(deleteAllowed);
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

  const handleDelete = async (id: string) => {
    try {
      await deleteEmployeeMutation.mutateAsync(id);
    } catch {
      // Error toast is handled in hook.
    }
  };

  const handleEdit = (employee: Employee) => {
    if (!canUpdate) {
      toast.error("You are not allowed to update employees.");
      return;
    }

    openEdit({
      id: employee.id,
      full_name: employee.full_name,
      email: employee.email ?? "",
      employee_number: employee.employee_number ?? "",
      phone: employee.phone ?? "",
      hire_date: employee.hire_date ?? "",
      employment_status: employee.employment_status ?? "",
      position_id: employee.position_id ?? "",
    });
  };

  if (permissionLoading || employeesQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!canRead) {
    return (
      <ForbiddenState description="You are not allowed to read employees." />
    );
  }

  return (
    <>
      <AppHeader title="Employees" />

      <div className="container pt-2">
        <div className="flex items-center justify-between mb-4 mt-6 gap-2">
          <Input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="bg-white p-2 border rounded-lg w-64"
          />

          {canCreate && (
            <Button onClick={openCreate}>
              <PlusCircle className="size-4" /> Create Employee
            </Button>
          )}
        </div>

        {employeesQuery.error ? (
          <ForbiddenState
            title="Request error"
            description={employeesQuery.error.message}
          />
        ) : (
          <DataTable
            key={`${page}-${pageSize}`}
            columns={columns({
              canUpdate,
              canDelete,
              onEdit: handleEdit,
              onDelete: (id) => {
                void handleDelete(id);
              },
            })}
            data={employeesQuery.data?.data ?? []}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={employeesQuery.data?.meta.totalPages ?? 1}
            sort={sort}
            setSort={setSort}
          />
        )}
      </div>

      <EmployeeSheet
        departmentOptions={departmentOptions}
        departmentsLoading={departmentsQuery.isLoading}
        positionOptions={positionOptions}
        positionsLoading={positionsQuery.isLoading}
      />
    </>
  );
}
