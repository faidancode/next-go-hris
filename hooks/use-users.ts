import {
  createUser,
  deleteUser,
  forceResetPassword,
  getUserById,
  getUsers,
  updateUserStatus,
  type CreateUserPayload,
  type ForceResetPasswordPayload,
  type UpdateUserStatusPayload,
} from "@/lib/api/user";
import { getErrorMessage, getReadableErrorCode } from "@/lib/api/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUsers = (
  page: number,
  pageSize: number,
  search: string,
  sort: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["users", page, pageSize, search, sort],
    queryFn: () => getUsers(page, pageSize, search, sort),
    staleTime: 60_000,
    enabled,
  });
};

export const useUserById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["users", "detail", id],
    queryFn: () => getUserById(id),
    staleTime: 60_000,
    enabled: enabled && Boolean(id),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to create user.");
      toast.error(code, { description: message });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateUserStatusPayload;
    }) => updateUserStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({
        queryKey: ["users", "detail", variables.id],
      });
      toast.success("User status updated successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to update user status.");
      toast.error(code, { description: message });
    },
  });
};

export const useForceResetPassword = () => {
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: ForceResetPasswordPayload;
    }) => forceResetPassword(id, payload),
    onSuccess: () => {
      toast.success("Password has been reset successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to reset password.");
      toast.error(code, { description: message });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to delete user.");
      toast.error(code, { description: message });
    },
  });
};
