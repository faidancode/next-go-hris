import {
  Payroll,
  PayrollBreakdown,
  CreatePayrollRequest,
  RegeneratePayrollRequest,
} from "@/app/(protected)/payrolls/types";
import { apiClient } from "@/lib/api/client";

export type PayrollListResponse = {
  data: Payroll[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

function normalizePayrolls(payload: unknown): Payroll[] {
  if (Array.isArray(payload)) return payload as Payroll[];
  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    if (Array.isArray(body.items)) return body.items as Payroll[];
    if (Array.isArray(body.data)) return body.data as Payroll[];
  }
  return [];
}

function normalizePayroll(payload: unknown): Payroll | null {
  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    if ("id" in body && typeof body.id === "string") {
      return body as Payroll;
    }

    if (body.data && typeof body.data === "object") {
      const data = body.data as Record<string, unknown>;
      if ("id" in data && typeof data.id === "string") {
        return data as Payroll;
      }
    }
  }

  return null;
}

export async function getPayrolls(
  pageIndex: number,
  pageSize: number,
  search: string,
  sort: string,
  filters?: {
    period?: string;
    department_id?: string;
    status?: string;
  },
): Promise<PayrollListResponse> {
  const params = new URLSearchParams();
  if (filters?.period) params.append("period", filters.period);
  if (filters?.department_id) params.append("department_id", filters.department_id);
  if (filters?.status) params.append("status", filters.status);

  // Note: Backend might not support all filters/pagination yet, 
  // following the pattern in employee.ts for client-side fallback if needed.
  const response = await apiClient.get<unknown>(`/payrolls?${params.toString()}`);
  const allPayrolls = normalizePayrolls(response);

  // Client-side filtering/search if necessary (similar to employee.ts)
  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? allPayrolls.filter((item) => {
        const haystack = [
          item.employee_name,
          item.period_start,
          item.period_end,
          item.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(keyword);
      })
    : allPayrolls;

  // Sorting
  const [sortField, sortDirection] = sort.split(":");
  const desc = sortDirection === "desc";

  const sorted = [...filtered].sort((a, b) => {
    const left = (a as any)[sortField];
    const right = (b as any)[sortField];
    if (left === right) return 0;
    if (left == null) return 1;
    if (right == null) return -1;
    const result = left < right ? -1 : 1;
    return desc ? result * -1 : result;
  });

  const total = sorted.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const page = Math.min(Math.max(1, pageIndex), totalPages);
  const start = (page - 1) * pageSize;
  const data = sorted.slice(start, start + pageSize);

  return {
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

export async function getPayrollById(id: string): Promise<Payroll> {
  const response = await apiClient.get<unknown>(`/payrolls/${id}`);
  const payroll = normalizePayroll(response);
  if (!payroll) throw new Error("Invalid payroll response");
  return payroll;
}

export async function getPayrollBreakdown(id: string): Promise<PayrollBreakdown> {
  const response = await apiClient.get<unknown>(`/payrolls/${id}/breakdown`);
  if (response && typeof response === "object") {
    const body = response as any;
    if (body.data) return body.data as PayrollBreakdown;
    return body as PayrollBreakdown;
  }
  throw new Error("Invalid breakdown response");
}

export async function createPayroll(payload: CreatePayrollRequest): Promise<Payroll> {
  const response = await apiClient.post<unknown>("/payrolls", payload);
  const payroll = normalizePayroll(response);
  if (!payroll) throw new Error("Failed to create payroll");
  return payroll;
}

export async function regeneratePayroll(id: string, payload: RegeneratePayrollRequest): Promise<Payroll> {
  const response = await apiClient.post<unknown>(`/payrolls/${id}/regenerate`, payload);
  const payroll = normalizePayroll(response);
  if (!payroll) throw new Error("Failed to regenerate payroll");
  return payroll;
}

export async function approvePayroll(id: string): Promise<Payroll> {
  const response = await apiClient.post<unknown>(`/payrolls/${id}/approve`, {});
  const payroll = normalizePayroll(response);
  if (!payroll) throw new Error("Failed to approve payroll");
  return payroll;
}

export async function markAsPaidPayroll(id: string): Promise<Payroll> {
  const response = await apiClient.post<unknown>(`/payrolls/${id}/mark-paid`, {});
  const payroll = normalizePayroll(response);
  if (!payroll) throw new Error("Failed to mark as paid");
  return payroll;
}

export async function deletePayroll(id: string): Promise<void> {
  await apiClient.delete(`/payrolls/${id}`);
}

export async function downloadPayslip(id: string): Promise<void> {
  // Usually this opens in a new tab or triggers a download
  // Using relative path which will be handled by normalizePath in apiClient or just window.open
  window.open(`/api/v1/payrolls/${id}/payslip/download`, "_blank");
}
