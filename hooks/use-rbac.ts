import {
  assignRoleToUser,
  createRole,
  deleteRole,
  getPermissionCatalog,
  getRoleById,
  getRoles,
  getUsersWithRoles,
  updateRole,
  type AssignRolePayload,
  type RolePayload,
} from "@/lib/api/rbac";
import { getErrorMessage, getReadableErrorCode } from "@/lib/api/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const usePermissionCatalog = (enabled = true) => {
  return useQuery({
    queryKey: ["rbac", "permissions"],
    queryFn: () => getPermissionCatalog(),
    staleTime: 60_000,
    enabled,
  });
};

export const useRoles = (enabled = true) => {
  return useQuery({
    queryKey: ["rbac", "roles"],
    queryFn: () => getRoles(),
    staleTime: 60_000,
    enabled,
  });
};

export const useRoleById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["rbac", "roles", "detail", id],
    queryFn: () => getRoleById(id),
    staleTime: 60_000,
    enabled: enabled && Boolean(id),
  });
};

export const useUsersWithRoles = (enabled = true) => {
  return useQuery({
    queryKey: ["rbac", "users-with-roles"],
    queryFn: () => getUsersWithRoles(),
    staleTime: 60_000,
    enabled,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RolePayload) => createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
      toast.success("Role created successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to create role.");
      toast.error(code, { description: message });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: RolePayload }) =>
      updateRole(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
      queryClient.invalidateQueries({
        queryKey: ["rbac", "roles", "detail", variables.id],
      });
      toast.success("Role updated successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to update role.");
      toast.error(code, { description: message });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });
      toast.success("Role deleted successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to delete role.");
      toast.error(code, { description: message });
    },
  });
};

export const useAssignRoleToUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string;
      payload: AssignRolePayload;
    }) => assignRoleToUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rbac", "users-with-roles"] });
      toast.success("Role assigned successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to assign role.");
      toast.error(code, { description: message });
    },
  });
};
