"use client";

import { ForbiddenState } from "@/components/guard/ForbiddenState";
import AppHeader from "@/components/shared/app-header";
import { DataTable } from "@/components/shared/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDepartments, useDeleteDepartment } from "@/hooks/use-department";
import { useDepartmentSheet } from "@/hooks/use-department-sheet";
import { can } from "@/lib/rbac/can";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import { columns } from "./columns";
import DepartmentSheet from "./sheet";
import type { Department } from "./types";

export default function DepartmentsPage() {
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [canRead, setCanRead] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { openCreate, openEdit } = useDepartmentSheet();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("name:asc");

  const departmentsQuery = useDepartments(
    page,
    pageSize,
    debouncedSearch,
    sort,
    canRead,
  );
  const deleteDepartmentMutation = useDeleteDepartment();

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const [readAllowed, createAllowed, updateAllowed, deleteAllowed] =
          await Promise.all([
            can("department", "read"),
            can("department", "create"),
            can("department", "update"),
            can("department", "delete"),
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

  const handleDelete = async (department: Department) => {
    const confirmed = window.confirm(
      `Delete department \"${department.name}\"?`,
    );
    if (!confirmed) return;

    setDeletingId(department.id);

    try {
      await deleteDepartmentMutation.mutateAsync(department.id);
    } catch {
      // Error toast is handled in hook.
    }

    setDeletingId(null);
  };

  const handleEdit = (department: Department) => {
    if (!canUpdate) {
      toast.error("You are not allowed to update departments.");
      return;
    }

    openEdit({
      id: department.id,
      name: department.name,
      parent_department_id: department.parent_department_id ?? "",
    });
  };

  if (permissionLoading || departmentsQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!canRead) {
    return (
      <ForbiddenState description="You are not allowed to read departments." />
    );
  }

  return (
    <>
      <AppHeader title="Departments" />

      <div className="container pt-2">
        <div className="flex items-center justify-between mb-4 mt-6 gap-2">
          <Input
            type="text"
            placeholder="Search department..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="bg-white p-2 border rounded-lg w-64"
          />

          {canCreate && (
            <Button onClick={openCreate}>
              <PlusCircle className="size-4" /> Create Department
            </Button>
          )}
        </div>

        {departmentsQuery.error ? (
          <ForbiddenState
            title="Request error"
            description={departmentsQuery.error.message}
          />
        ) : (
          <DataTable
            key={`${page}-${pageSize}`}
            columns={columns({
              canUpdate,
              canDelete,
              deletingId,
              onEdit: handleEdit,
              onDelete: (department) => {
                void handleDelete(department);
              },
            })}
            data={departmentsQuery.data?.data ?? []}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={departmentsQuery.data?.meta.totalPages ?? 1}
            sort={sort}
            setSort={setSort}
          />
        )}
      </div>

      <DepartmentSheet />
    </>
  );
}
