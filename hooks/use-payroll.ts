import {
  approvePayroll,
  createPayroll,
  deletePayroll,
  getPayrollById,
  getPayrollBreakdown,
  getPayrolls,
  markAsPaidPayroll,
  regeneratePayroll,
} from "@/lib/api/payroll";
import { getErrorMessage, getReadableErrorCode } from "@/lib/api/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreatePayrollRequest, RegeneratePayrollRequest } from "@/app/(protected)/payrolls/types";

export const usePayrolls = (
  page: number,
  pageSize: number,
  search: string,
  sort: string,
  filters?: {
    period?: string;
    department_id?: string;
    status?: string;
  },
  enabled = true,
) => {
  return useQuery({
    queryKey: ["payrolls", page, pageSize, search, sort, filters],
    queryFn: () => getPayrolls(page, pageSize, search, sort, filters),
    staleTime: 60_000,
    enabled,
  });
};

export const usePayrollById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["payrolls", "detail", id],
    queryFn: () => getPayrollById(id),
    staleTime: 60_000,
    enabled: enabled && Boolean(id),
  });
};

export const usePayrollBreakdown = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["payrolls", "breakdown", id],
    queryFn: () => getPayrollBreakdown(id),
    staleTime: 60_000,
    enabled: enabled && Boolean(id),
  });
};

export const useCreatePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePayrollRequest) => createPayroll(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      toast.success("Payroll created successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to create payroll.");
      toast.error(code, { description: message });
    },
  });
};

export const useRegeneratePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RegeneratePayrollRequest }) =>
      regeneratePayroll(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      queryClient.invalidateQueries({ queryKey: ["payrolls", "detail", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["payrolls", "breakdown", variables.id] });
      toast.success("Payroll regenerated successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to regenerate payroll.");
      toast.error(code, { description: message });
    },
  });
};

export const useApprovePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approvePayroll(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      queryClient.invalidateQueries({ queryKey: ["payrolls", "detail", id] });
      toast.success("Payroll approved successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to approve payroll.");
      toast.error(code, { description: message });
    },
  });
};

export const useMarkPaidPayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markAsPaidPayroll(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      queryClient.invalidateQueries({ queryKey: ["payrolls", "detail", id] });
      toast.success("Payroll marked as paid.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to mark payroll as paid.");
      toast.error(code, { description: message });
    },
  });
};

export const useDeletePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePayroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      toast.success("Payroll deleted successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to delete payroll.");
      toast.error(code, { description: message });
    },
  });
};
