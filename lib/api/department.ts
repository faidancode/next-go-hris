import { apiClient } from "@/lib/api/client";
import type { Department } from "@/app/(protected)/departments/types";

export type DepartmentListResponse = {
  data: Department[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type CreateDepartmentPayload = {
  name: string;
  parent_department_id?: string;
};

export type UpdateDepartmentPayload = {
  name: string;
  parent_department_id?: string;
};

function normalizeDepartments(payload: unknown): Department[] {
  if (Array.isArray(payload)) return payload as Department[];
  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    if (Array.isArray(body.items)) return body.items as Department[];
    if (Array.isArray(body.data)) return body.data as Department[];
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

export async function getDepartments(
  page: number,
  pageSize: number,
  search: string,
  sort: string,
): Promise<DepartmentListResponse> {
  const response = await apiClient.get<unknown>("/departments");
  const departments = normalizeDepartments(response);

  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? departments.filter((item) => {
        const haystack = [item.name, item.parent_department_id]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(keyword);
      })
    : departments;

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

export async function createDepartment(payload: CreateDepartmentPayload) {
  return apiClient.post("/departments", payload);
}

export async function updateDepartment(
  id: string,
  payload: UpdateDepartmentPayload,
) {
  return apiClient.put(`/departments/${id}`, payload);
}

export async function deleteDepartment(id: string) {
  return apiClient.delete(`/departments/${id}`);
}
