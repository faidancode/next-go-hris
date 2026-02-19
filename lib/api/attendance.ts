import type { Attendance } from "@/app/(protected)/attendances/types";
import { apiClient } from "@/lib/api/client";

export type AttendanceListResponse = {
  data: Attendance[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ClockInPayload = {
  latitude?: number;
  longitude?: number;
  source: string;
  notes?: string;
};

export type ClockOutPayload = {
  latitude?: number;
  longitude?: number;
  notes?: string;
};

function normalizeAttendances(payload: unknown): Attendance[] {
  if (Array.isArray(payload)) return payload as Attendance[];
  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    if (Array.isArray(body.items)) return body.items as Attendance[];
    if (Array.isArray(body.data)) return body.data as Attendance[];
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

export async function getAttendances(
  page: number,
  pageSize: number,
  search: string,
  sort: string,
  employeeId?: string,
): Promise<AttendanceListResponse> {
  const response = await apiClient.get<unknown>("/attendances");
  const attendances = normalizeAttendances(response);
  const scopedAttendances = employeeId
    ? attendances.filter((item) => item.employee_id === employeeId)
    : attendances;

  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? scopedAttendances.filter((item) => {
        const haystack = [
          item.attendance_date,
          item.status,
          item.source,
          item.notes,
          item.clock_in,
          item.clock_out,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(keyword);
      })
    : scopedAttendances;

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

export async function clockInAttendance(payload: ClockInPayload) {
  return apiClient.post("/attendances/clock-in", payload);
}

export async function clockOutAttendance(payload: ClockOutPayload) {
  return apiClient.post("/attendances/clock-out", payload);
}
