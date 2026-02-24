"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PlusCircle, Save, Trash2 } from "lucide-react";

import AppHeader from "@/components/shared/app-header";
import { ForbiddenState } from "@/components/guard/ForbiddenState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { can } from "@/lib/rbac/can";
import {
  useAssignRoleToUser,
  useCreateRole,
  useDeleteRole,
  usePermissionCatalog,
  useRoleById,
  useRoles,
  useUpdateRole,
  useUsersWithRoles,
} from "@/hooks/use-rbac";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserRolePermissionPage() {
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [canRoleRead, setCanRoleRead] = useState(false);
  const [canRoleManage, setCanRoleManage] = useState(false);
  const [canUserRead, setCanUserRead] = useState(false);

  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [assignRoleByUser, setAssignRoleByUser] = useState<
    Record<string, string>
  >({});

  const rolesQuery = useRoles(canRoleRead);
  const roleDetailQuery = useRoleById(selectedRoleId, canRoleRead);
  const permissionsQuery = usePermissionCatalog(canRoleManage);
  const usersWithRolesQuery = useUsersWithRoles(canUserRead);

  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();
  const assignRoleMutation = useAssignRoleToUser();

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const [roleReadAllowed, roleManageAllowed, userReadAllowed] =
          await Promise.all([
            can("role", "read"),
            can("role", "manage"),
            can("user", "read"),
          ]);

        if (!mounted) return;
        setCanRoleRead(roleReadAllowed);
        setCanRoleManage(roleManageAllowed);
        setCanUserRead(userReadAllowed);
      } finally {
        if (mounted) setPermissionLoading(false);
      }
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedRoleId) return;
    if (!rolesQuery.data?.length) return;
    setSelectedRoleId(rolesQuery.data[0].id);
  }, [rolesQuery.data, selectedRoleId]);

  useEffect(() => {
    if (!roleDetailQuery.data) return;
    setRoleName(roleDetailQuery.data.name ?? "");
    setRoleDescription(roleDetailQuery.data.description ?? "");
    setSelectedPermissions(roleDetailQuery.data.permissions ?? []);
  }, [roleDetailQuery.data]);

  const groupedPermissions = useMemo(() => {
    const items = permissionsQuery.data ?? [];
    return items.reduce<Record<string, typeof items>>((acc, item) => {
      const category = item.category || "General";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
  }, [permissionsQuery.data]);

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

  const roleNames = useMemo(
    () => (rolesQuery.data ?? []).map((role) => role.name),
    [rolesQuery.data],
  );

  const resetForm = () => {
    setSelectedRoleId("");
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
  };

  const togglePermission = (permissionKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((item) => item !== permissionKey)
        : [...prev, permissionKey],
    );
  };

  const handleSaveRole = async () => {
    if (!canRoleManage) {
      toast.error("You are not allowed to manage roles.");
      return;
    }

    const cleanName = roleName.trim();
    if (!cleanName) {
      toast.error("Role name is required.");
      return;
    }

    try {
      if (selectedRoleId) {
        await updateRoleMutation.mutateAsync({
          id: selectedRoleId,
          payload: {
            name: cleanName,
            description: roleDescription.trim() || undefined,
            permissions: selectedPermissions,
          },
        });
      } else {
        await createRoleMutation.mutateAsync({
          name: cleanName,
          description: roleDescription.trim() || undefined,
          permissions: selectedPermissions,
        });
        resetForm();
      }
    } catch {
      // handled in hook
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRoleId) return;
    if (!canRoleManage) return;

    const confirmed = window.confirm("Delete this role?");
    if (!confirmed) return;

    try {
      await deleteRoleMutation.mutateAsync(selectedRoleId);
      resetForm();
    } catch {
      // handled in hook
    }
  };

  const handleAssignRole = async (userId: string) => {
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
  };

  if (permissionLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!canRoleRead && !canRoleManage && !canUserRead) {
    return (
      <ForbiddenState description="You are not allowed to access role permission settings." />
    );
  }

  return (
    <>
      <AppHeader title="Settings - User Role Permission" />

      <div className="container py-4 space-y-4">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Role Management</CardTitle>
            <CardDescription>
              Create role, update permission mapping, and remove role.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[260px_1fr]">
            <div className="space-y-2 border rounded-lg p-3 bg-white">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={resetForm}
                disabled={!canRoleManage}
              >
                <PlusCircle className="size-4 mr-2" />
                New Role
              </Button>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {(rolesQuery.data ?? []).map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                      selectedRoleId === role.id
                        ? "border-primary bg-primary/10"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-semibold">{role.name}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {role.description || "No description"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 border rounded-lg p-4 bg-white">
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  placeholder="Role name"
                  value={roleName}
                  disabled={!canRoleManage}
                  onChange={(event) => setRoleName(event.target.value)}
                />
                <Input
                  placeholder="Description"
                  value={roleDescription}
                  disabled={!canRoleManage}
                  onChange={(event) => setRoleDescription(event.target.value)}
                />
              </div>

              {permissionsQuery.isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : !canRoleManage ? (
                <p className="text-sm text-slate-500">
                  You do not have access to manage permission mapping.
                </p>
              ) : (
                <div className="max-h-[360px] overflow-y-auto border rounded-md p-3 space-y-4">
                  {Object.entries(groupedPermissions).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <p className="text-sm font-semibold">{category}</p>
                      <div className="grid gap-2 md:grid-cols-2">
                        {items.map((permission) => {
                          const permissionKey = `${permission.resource}:${permission.action}`;
                          const checked =
                            selectedPermissions.includes(permissionKey);
                          return (
                            <label
                              key={permission.id}
                              className="flex items-start gap-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5"
                                checked={checked}
                                onChange={() => togglePermission(permissionKey)}
                              />
                              <span>
                                <span className="font-medium">
                                  {permission.label}
                                </span>
                                <span className="block text-xs text-slate-500">
                                  {permissionKey}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    void handleSaveRole();
                  }}
                  disabled={!canRoleManage}
                >
                  <Save className="size-4 mr-2" />
                  {selectedRoleId ? "Update Role" : "Create Role"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    void handleDeleteRole();
                  }}
                  disabled={!canRoleManage || !selectedRoleId}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete Role
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Assign Role to User</CardTitle>
            <CardDescription>
              Add role mapping to selected user account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!canUserRead ? (
              <ForbiddenState description="You are not allowed to read users with roles." />
            ) : (
              <>
                <Input
                  placeholder="Search user by name/email..."
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  className="max-w-sm"
                />

                {usersWithRolesQuery.isLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="border rounded-lg p-3 bg-white flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-semibold">{user.full_name}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(user.roles ?? []).length ? (
                              user.roles.map((role) => (
                                <Badge key={`${user.id}-${role}`} variant="outline">
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="secondary">No role</Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Select
                            value={assignRoleByUser[user.id]}
                            onValueChange={(value) =>
                              setAssignRoleByUser((prev) => ({
                                ...prev,
                                [user.id]: value,
                              }))
                            }
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roleNames.map((name) => (
                                <SelectItem key={`${user.id}-${name}`} value={name}>
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            type="button"
                            disabled={!canRoleManage || !assignRoleByUser[user.id]}
                            onClick={() => {
                              void handleAssignRole(user.id);
                            }}
                          >
                            Assign
                          </Button>
                        </div>
                      </div>
                    ))}

                    {!filteredUsers.length && (
                      <p className="text-sm text-slate-500">No users found.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
