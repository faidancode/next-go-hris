"use client";

import { ForbiddenState } from "@/components/guard/ForbiddenState";
import AppHeader from "@/components/shared/app-header";
import { DataTable } from "@/components/shared/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { can } from "@/lib/rbac/can";
import { useDepartments } from "@/hooks/use-department";
import { PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import { columns } from "./columns";
import PositionSheet from "./sheet";
import type { Position } from "./types";
import { usePositionSheet } from "@/hooks/use-position-sheet";
import { useDeletePosition, usePositions } from "@/hooks/use-position";

export default function PositionsPage() {
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [canRead, setCanRead] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const { openCreate, openEdit } = usePositionSheet();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("name:asc");

  const positionsQuery = usePositions(
    page,
    pageSize,
    debouncedSearch,
    sort,
    canRead,
  );
  const departmentsQuery = useDepartments(1, 1000, "", "name:asc", canRead);
  const deletePositionMutation = useDeletePosition();

  const departmentOptions = useMemo(
    () =>
      (departmentsQuery.data?.data ?? []).map((department) => ({
        id: department.id,
        name: department.name,
      })),
    [departmentsQuery.data?.data],
  );

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const [readAllowed, createAllowed, updateAllowed, deleteAllowed] =
          await Promise.all([
            can("position", "read"),
            can("position", "create"),
            can("position", "update"),
            can("position", "delete"),
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
      await deletePositionMutation.mutateAsync(id);
    } catch {
      // Error toast is handled in hook.
    }
  };

  const handleEdit = (position: Position) => {
    if (!canUpdate) {
      toast.error("You are not allowed to update positions.");
      return;
    }

    openEdit({
      id: position.id,
      name: position.name,
      department_id: position.department_id ?? "",
    });
  };

  if (permissionLoading || positionsQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!canRead) {
    return (
      <ForbiddenState description="You are not allowed to read positions." />
    );
  }

  return (
    <>
      <AppHeader title="Positions" />

      <div className="container pt-2">
        <div className="flex items-center justify-between mb-4 mt-6 gap-2">
          <Input
            type="text"
            placeholder="Search position..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="bg-white p-2 border rounded-lg w-64"
          />

          {canCreate && (
            <Button onClick={openCreate}>
              <PlusCircle className="size-4" /> Create Position
            </Button>
          )}
        </div>

        {positionsQuery.error ? (
          <ForbiddenState
            title="Request error"
            description={positionsQuery.error.message}
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
            data={positionsQuery.data?.data ?? []}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={positionsQuery.data?.meta.totalPages ?? 1}
            sort={sort}
            setSort={setSort}
          />
        )}
      </div>

      <PositionSheet
        departmentOptions={departmentOptions}
        departmentsLoading={departmentsQuery.isLoading}
      />
    </>
  );
}
