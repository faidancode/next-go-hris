import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  getEmployees,
  updateEmployee,
  type CreateEmployeePayload,
  type UpdateEmployeePayload,
} from "@/lib/api/employee";
import { getErrorMessage, getReadableErrorCode } from "@/lib/api/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useEmployees = (
  page: number,
  pageSize: number,
  search: string,
  sort: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["employees", page, pageSize, search, sort],
    queryFn: () => getEmployees(page, pageSize, search, sort),
    staleTime: 60_000,
    enabled,
  });
};

export const useEmployeeById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["employees", "detail", id],
    queryFn: () => getEmployeeById(id),
    staleTime: 60_000,
    enabled: enabled && Boolean(id),
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateEmployeePayload) =>
      createEmployee(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee created successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to create employee.");
      toast.error(code, { description: message });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateEmployeePayload;
    }) => updateEmployee(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({
        queryKey: ["employees", "detail", variables.id],
      });
      toast.success("Employee updated successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to update employee.");
      toast.error(code, { description: message });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deleted successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to delete employee.");
      toast.error(code, { description: message });
    },
  });
};
