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
import { toast } from "sonner";
import type { User } from "./types";
import { useUserSheet } from "@/hooks/use-user-sheet";
import { useDeleteUser, useUsers } from "@/hooks/use-users";
import { useAuthStore } from "@/app/stores/auth";
import UserSheet from "./sheet";
import { columns } from "./columns";

export default function UsersPage() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const [permissionLoading, setPermissionLoading] = useState(true);
  const [canRead, setCanRead] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const { openCreate, openEdit } = useUserSheet();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("email:asc");

  const usersQuery = useUsers(
    page,
    pageSize,
    debouncedSearch,
    sort,
    canRead && hasHydrated,
  );

  const deleteUserMutation = useDeleteUser();

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const [readAllowed, createAllowed, updateAllowed, deleteAllowed] =
          await Promise.all([
            can("user", "read"),
            can("user", "create"),
            can("user", "update"),
            can("user", "delete"),
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
      await deleteUserMutation.mutateAsync(id);
    } catch {
      // Error handled in hook via toast
    }
  };

  const handleEdit = (user: User) => {
    if (!canUpdate) {
      toast.error("You are not allowed to update users.");
      return;
    }

    openEdit({
      id: user.id,
      employee_id: user.employee_id,
      email: user.email,
      is_active: user.is_active,
    });
  };

  if (!hasHydrated || permissionLoading || usersQuery.isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!canRead) {
    return (
      <ForbiddenState description="You are not allowed to access the user management." />
    );
  }

  return (
    <>
      <AppHeader title="User Management" />

      <div className="container pt-2">
        <div className="flex items-center justify-between mb-4 mt-6 gap-2">
          <Input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="bg-white p-2 border rounded-lg w-64"
          />

          {canCreate && (
            <Button onClick={openCreate}>
              <PlusCircle className="size-4 mr-2" /> Create User
            </Button>
          )}
        </div>

        {usersQuery.error ? (
          <ForbiddenState
            title="Request error"
            description={usersQuery.error.message}
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
            data={usersQuery.data?.data ?? []}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={usersQuery.data?.meta.totalPages ?? 1}
            sort={sort}
            setSort={setSort}
          />
        )}
      </div>

      <UserSheet />
    </>
  );
}
