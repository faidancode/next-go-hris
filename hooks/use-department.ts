import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
  type CreateDepartmentPayload,
  type UpdateDepartmentPayload,
} from "@/lib/api/department";
import { getErrorMessage, getReadableErrorCode } from "@/lib/api/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDepartments = (
  page: number,
  pageSize: number,
  search: string,
  sort: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["departments", page, pageSize, search, sort],
    queryFn: () => getDepartments(page, pageSize, search, sort),
    staleTime: 60_000,
    enabled,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDepartmentPayload) =>
      createDepartment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department created successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to create department.");
      toast.error(code, { description: message });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateDepartmentPayload;
    }) => updateDepartment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department updated successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to update department.");
      toast.error(code, { description: message });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department deleted successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to delete department.");
      toast.error(code, { description: message });
    },
  });
};

