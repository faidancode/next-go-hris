import { Position } from "@/app/(protected)/positions/types";
import { apiClient } from "@/lib/api/client";

export type PositionListResponse = {
  data: Position[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type CreatePositionPayload = {
  name: string;
  department_id?: string;
};

export type UpdatePositionPayload = {
  name: string;
  department_id?: string;
};

function normalizePositions(payload: unknown): Position[] {
  if (Array.isArray(payload)) return payload as Position[];
  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    if (Array.isArray(body.items)) return body.items as Position[];
    if (Array.isArray(body.data)) return body.data as Position[];
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

export async function getPositions(
  page: number,
  pageSize: number,
  search: string,
  sort: string,
): Promise<PositionListResponse> {
  const response = await apiClient.get<unknown>("/positions");
  const positions = normalizePositions(response);

  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? positions.filter((item) => {
        const haystack = [item.name, item.department_id]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(keyword);
      })
    : positions;

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

export async function createPosition(payload: CreatePositionPayload) {
  return apiClient.post("/positions", payload);
}

export async function updatePosition(
  id: string,
  payload: UpdatePositionPayload,
) {
  return apiClient.put(`/positions/${id}`, payload);
}

export async function deletePosition(id: string) {
  return apiClient.delete(`/positions/${id}`);
}
