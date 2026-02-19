import type { EmployeeSalary } from "@/app/(protected)/employee-salaries/types";
import { apiClient } from "@/lib/api/client";

export type EmployeeSalaryListResponse = {
  data: EmployeeSalary[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type CreateEmployeeSalaryPayload = {
  employee_id: string;
  base_salary: number;
  effective_date: string;
};

function normalizeEmployeeSalaries(payload: unknown): EmployeeSalary[] {
  if (Array.isArray(payload)) return payload as EmployeeSalary[];
  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    if (Array.isArray(body.items)) return body.items as EmployeeSalary[];
    if (Array.isArray(body.data)) return body.data as EmployeeSalary[];
  }
  return [];
}

function compareValues(a: unknown, b: unknown, desc: boolean) {
  if (a === b) return 0;

  const left = typeof a === "string" ? a.toLowerCase() : a;
  const right = typeof b === "string" ? b.toLowerCase() : b;

  let result = 0;
  if (left == null && right != null) result = -1;
  else if (left != null && right == null) result = 1;
  else if (left! < right!) result = -1;
  else result = 1;

  return desc ? result * -1 : result;
}

export async function getEmployeeSalaries(
  page: number,
  pageSize: number,
  search: string,
  sort: string,
  employeeId?: string,
): Promise<EmployeeSalaryListResponse> {
  const response = await apiClient.get<unknown>("/employee-salaries");
  const salaries = normalizeEmployeeSalaries(response);
  const scopedSalaries = employeeId
    ? salaries.filter((item) => item.employee_id === employeeId)
    : salaries;

  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? scopedSalaries.filter((item) => {
        const haystack = [
          item.employee_name,
          item.employee_id,
          item.base_salary,
          item.effective_date,
        ]
          .filter((value) => value !== null && value !== undefined)
          .join(" ")
          .toLowerCase();
        return haystack.includes(keyword);
      })
    : scopedSalaries;

  const [sortField, sortDirection] = sort.split(":");
  const desc = sortDirection === "desc";

  const sorted = [...filtered].sort((a, b) => {
    const left = (a as Record<string, unknown>)[sortField];
    const right = (b as Record<string, unknown>)[sortField];
    return compareValues(left, right, desc);
  });

  const safePageSize = Math.max(1, pageSize);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safePageSize;
  const data = sorted.slice(start, start + safePageSize);

  return {
    data,
    meta: {
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages,
    },
  };
}

export async function createEmployeeSalary(payload: CreateEmployeeSalaryPayload) {
  return apiClient.post("/employee-salaries", payload);
}

