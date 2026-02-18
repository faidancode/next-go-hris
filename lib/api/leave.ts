import { apiClient } from "@/lib/api/client";
import type { Leave } from "@/app/(protected)/leaves/types";

export type LeaveListResponse = {
  data: Leave[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type CreateLeavePayload = {
  employee_id: string;
  leave_type: "ANNUAL" | "SICK" | "UNPAID";
  start_date: string;
  end_date: string;
  reason: string;
};

export type LeaveStatus =
  | "PENDING"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type UpdateLeavePayload = {
  employee_id: string;
  leave_type: "ANNUAL" | "SICK" | "UNPAID";
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatus;
  approved_by?: string;
  rejection_reason?: string;
};

export type RejectLeavePayload = {
  rejection_reason: string;
};

function normalizeLeaves(payload: unknown): Leave[] {
  if (Array.isArray(payload)) return payload as Leave[];
  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    if (Array.isArray(body.items)) return body.items as Leave[];
    if (Array.isArray(body.data)) return body.data as Leave[];
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

export async function getLeaves(
  page: number,
  pageSize: number,
  search: string,
  sort: string,
): Promise<LeaveListResponse> {
  const response = await apiClient.get<unknown>("/leaves");
  const leaves = normalizeLeaves(response);

  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? leaves.filter((item) => {
        const haystack = [
          item.employee_name,
          item.employee_id,
          item.leave_type,
          item.reason,
          item.status,
          item.start_date,
          item.end_date,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(keyword);
      })
    : leaves;

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

export async function createLeave(payload: CreateLeavePayload) {
  return apiClient.post("/leaves", payload);
}

export async function updateLeave(id: string, payload: UpdateLeavePayload) {
  return apiClient.put(`/leaves/${id}`, payload);
}

export async function submitLeave(id: string) {
  return apiClient.post(`/leaves/${id}/submit`, {});
}

export async function approveLeave(id: string) {
  return apiClient.post(`/leaves/${id}/approve`, {});
}

export async function rejectLeave(id: string, payload: RejectLeavePayload) {
  return apiClient.post(`/leaves/${id}/reject`, payload);
}

export async function deleteLeave(id: string) {
  return apiClient.delete(`/leaves/${id}`);
}
