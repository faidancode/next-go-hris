import { Employee } from "@/app/(protected)/employees/types";
import { apiClient } from "@/lib/api/client";

export type EmployeeListResponse = {
  data: Employee[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type EmployeeOption = {
  id: string;
  full_name: string;
  email: string;
};

export type CreateEmployeePayload = {
  full_name: string;
  email: string;
  employee_number: string;
  phone?: string;
  hire_date: string;
  employment_status: string;
  position_id: string;
};

export type UpdateEmployeePayload = {
  full_name: string;
  email: string;
  employee_number: string;
  phone?: string;
  hire_date: string;
  employment_status: string;
  position_id: string;
};

function normalizeEmployees(payload: unknown): Employee[] {
  if (Array.isArray(payload)) return payload as Employee[];
  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    if (Array.isArray(body.items)) return body.items as Employee[];
    if (Array.isArray(body.data)) return body.data as Employee[];
  }
  return [];
}

function normalizeEmployee(payload: unknown): Employee | null {
  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    if ("id" in body && typeof body.id === "string") {
      return body as Employee;
    }

    if (body.data && typeof body.data === "object") {
      const data = body.data as Record<string, unknown>;
      if ("id" in data && typeof data.id === "string") {
        return data as Employee;
      }
    }

    if (body.item && typeof body.item === "object") {
      const item = body.item as Record<string, unknown>;
      if ("id" in item && typeof item.id === "string") {
        return item as Employee;
      }
    }
  }

  return null;
}

function normalizeEmployeeOptions(payload: unknown): EmployeeOption[] {
  let rawOptions: unknown[] = [];

  if (Array.isArray(payload)) {
    rawOptions = payload;
  } else if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    if (Array.isArray(body.data)) rawOptions = body.data;
    else if (Array.isArray(body.items)) rawOptions = body.items;
  }

  return rawOptions
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;

      const id =
        typeof raw.id === "string"
          ? raw.id
          : typeof raw.employee_id === "string"
            ? raw.employee_id
            : typeof raw.value === "string"
              ? raw.value
              : "";

      const full_name =
        typeof raw.full_name === "string"
          ? raw.full_name
          : typeof raw.name === "string"
            ? raw.name
            : "";

      const email = typeof raw.email === "string" ? raw.email : "";

      if (!id || !full_name) return null;
      return { id, full_name, email };
    })
    .filter((option): option is EmployeeOption => option !== null);
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

export async function getEmployees(
  page: number,
  pageSize: number,
  search: string,
  sort: string,
): Promise<EmployeeListResponse> {
  const response = await apiClient.get<unknown>("/employees");
  const employees = normalizeEmployees(response);

  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? employees.filter((item) => {
        const haystack = [
          item.full_name,
          item.email,
          item.employee_number,
          item.phone,
          item.hire_date,
          item.employment_status,
          item.department,
          item.department_id,
          item.position,
          item.position_id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(keyword);
      })
    : employees;

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

export async function createEmployee(payload: CreateEmployeePayload) {
  return apiClient.post("/employees", payload);
}

export async function getEmployeeOptions(): Promise<EmployeeOption[]> {
  const response = await apiClient.get<unknown>("/employees/options");
  return normalizeEmployeeOptions(response);
}

export async function getEmployeeById(id: string): Promise<Employee> {
  const response = await apiClient.get<unknown>(`/employees/${id}`);
  const employee = normalizeEmployee(response);

  if (!employee) {
    throw new Error("Invalid employee detail response.");
  }

  return employee;
}

export async function updateEmployee(
  id: string,
  payload: UpdateEmployeePayload,
) {
  return apiClient.put(`/employees/${id}`, payload);
}

export async function deleteEmployee(id: string) {
  return apiClient.delete(`/employees/${id}`);
}
