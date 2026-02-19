import {
  createEmployeeSalary,
  getEmployeeSalaries,
  type CreateEmployeeSalaryPayload,
} from "@/lib/api/employee-salary";
import { getErrorMessage, getReadableErrorCode } from "@/lib/api/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useEmployeeSalaries = (
  page: number,
  pageSize: number,
  search: string,
  sort: string,
  employeeId?: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["employee-salaries", page, pageSize, search, sort, employeeId],
    queryFn: () =>
      getEmployeeSalaries(page, pageSize, search, sort, employeeId),
    staleTime: 60_000,
    enabled,
  });
};

export const useCreateEmployeeSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateEmployeeSalaryPayload) =>
      createEmployeeSalary(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-salaries"] });
      toast.success("Employee salary added successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to add employee salary.");
      toast.error(code, { description: message });
    },
  });
};

