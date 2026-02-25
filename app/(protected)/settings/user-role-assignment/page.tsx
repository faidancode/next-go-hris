"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import AppHeader from "@/components/shared/app-header";
import { ForbiddenState } from "@/components/guard/ForbiddenState";
import { DataTable } from "@/components/shared/table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { can } from "@/lib/rbac/can";
import {
  useAssignRoleToUser,
  useRoles,
  useUsersWithRoles,
} from "@/hooks/use-rbac";
import type { UserWithRoles } from "@/lib/api/rbac";

export default function UserRoleAssignmentPage() {
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [canUserRead, setCanUserRead] = useState(false);
  const [canRoleRead, setCanRoleRead] = useState(false);
  const [canRoleManage, setCanRoleManage] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [assignRoleByUser, setAssignRoleByUser] = useState<
    Record<string, string>
  >({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("full_name:asc");

  const usersWithRolesQuery = useUsersWithRoles(canUserRead);
  const rolesQuery = useRoles(canRoleRead || canRoleManage);
  const assignRoleMutation = useAssignRoleToUser();

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const [userReadAllowed, roleReadAllowed, roleManageAllowed] =
          await Promise.all([
            can("user", "read"),
            can("role", "read"),
            can("role", "manage"),
          ]);

        if (!mounted) return;
        setCanUserRead(userReadAllowed);
        setCanRoleRead(roleReadAllowed);
        setCanRoleManage(roleManageAllowed);
      } finally {
        if (mounted) setPermissionLoading(false);
      }
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const roleNames = useMemo(
    () => (rolesQuery.data ?? []).map((role) => role.name),
    [rolesQuery.data],
  );

  const filteredUsers = useMemo(() => {
    const keyword = userSearch.trim().toLowerCase();
    if (!keyword) return usersWithRolesQuery.data ?? [];

    return (usersWithRolesQuery.data ?? []).filter((user) => {
      const haystack = [user.full_name, user.email, user.employee_id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [userSearch, usersWithRolesQuery.data]);

  const sortedUsers = useMemo(() => {
    const [sortBy, order] = sort.split(":");
    const multiplier = order === "desc" ? -1 : 1;
    const data = [...filteredUsers];

    data.sort((a, b) => {
      const getValue = (user: UserWithRoles) => {
        if (sortBy === "email") return user.email || "";
        if (sortBy === "employee_id") return user.employee_id || "";
        if (sortBy === "created_at") return user.created_at || "";
        if (sortBy === "roles") return String(user.roles?.join(",") || "");
        return user.full_name || "";
      };

      return getValue(a).localeCompare(getValue(b)) * multiplier;
    });

    return data;
  }, [filteredUsers, sort]);

  const totalPages = sortedUsers.length
    ? Math.ceil(sortedUsers.length / pageSize)
    : 0;

  useEffect(() => {
    if (totalPages === 0) {
      if (page !== 1) setPage(1);
      return;
    }

    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [page, pageSize, sortedUsers]);

  const handleAssignRole = useCallback(
    async (userId: string) => {
      if (!canRoleManage) {
        toast.error("You are not allowed to assign role.");
        return;
      }

      const roleNameValue = assignRoleByUser[userId];
      if (!roleNameValue) {
        toast.error("Please choose a role first.");
        return;
      }

      try {
        await assignRoleMutation.mutateAsync({
          userId,
          payload: { role_name: roleNameValue },
        });
      } catch {
        // handled in hook
      }
    },
    [assignRoleByUser, assignRoleMutation, canRoleManage],
  );

  const columns = useMemo<ColumnDef<UserWithRoles>[]>(
    () => [
      {
        accessorKey: "employee_number",
        header: "Employee Number",
        enableSorting: true,
        cell: ({ row }) => row.original.employee_number || "-",
      },
      {
        accessorKey: "full_name",
        header: "Full Name",
        enableSorting: true,
        cell: ({ row }) => row.original.full_name || "-",
      },
      {
        accessorKey: "email",
        header: "Email",
        enableSorting: true,
      },

      {
        accessorKey: "roles",
        header: "Current Roles",
        enableSorting: true,
        cell: ({ row }) => {
          const roles = row.original.roles ?? [];
          if (!roles.length) return <Badge variant="secondary">No role</Badge>;

          return (
            <div className="flex flex-wrap gap-1">
              {roles.map((role) => (
                <Badge key={`${row.original.id}-${role}`} variant="outline">
                  {role}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        id: "assign",
        header: "Assign Role",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Select
              value={assignRoleByUser[row.original.id]}
              onValueChange={(value) =>
                setAssignRoleByUser((prev) => ({
                  ...prev,
                  [row.original.id]: value,
                }))
              }
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleNames.map((name) => (
                  <SelectItem key={`${row.original.id}-${name}`} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              disabled={!canRoleManage || !assignRoleByUser[row.original.id]}
              onClick={() => {
                void handleAssignRole(row.original.id);
              }}
            >
              Assign
            </Button>
          </div>
        ),
      },
    ],
    [assignRoleByUser, canRoleManage, handleAssignRole, roleNames],
  );

  if (permissionLoading || usersWithRolesQuery.isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!canUserRead) {
    return (
      <ForbiddenState description="You are not allowed to read users with roles." />
    );
  }

  return (
    <>
      <AppHeader title="Settings - Assign Role to User" />

      <div className="container py-4 space-y-4">
        <Input
          placeholder="Search user by name/email..."
          value={userSearch}
          onChange={(event) => {
            setUserSearch(event.target.value);
            setPage(1);
          }}
          className="max-w-sm bg-white"
        />

        {usersWithRolesQuery.error ? (
          <ForbiddenState
            title="Request error"
            description={usersWithRolesQuery.error.message}
          />
        ) : (
          <DataTable
            key={`${page}-${pageSize}-${sort}`}
            columns={columns}
            data={paginatedUsers}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
            sort={sort}
            setSort={setSort}
          />
        )}
      </div>
    </>
  );
}
