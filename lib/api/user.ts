import { User } from "@/app/(protected)/users/types";
import { apiClient } from "@/lib/api/client";

export type UserListResponse = {
  data: User[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type CreateUserPayload = {
  employee_id: string;
  email: string;
  password: string;
};

export type UpdateUserStatusPayload = {
  is_active: boolean;
};

export type ForceResetPasswordPayload = {
  new_password: string;
};

// --- Helper Functions ---

function normalizeUsers(payload: unknown): User[] {
  if (Array.isArray(payload)) return payload as User[];
  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    if (Array.isArray(body.items)) return body.items as User[];
    if (Array.isArray(body.data)) return body.data as User[];
  }
  return [];
}

function normalizeUser(payload: unknown): User | null {
  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    // Check direct object or wrapped in data/item
    const target = body.data || body.item || body;
    if (target && typeof target === "object" && "id" in target) {
      return target as User;
    }
  }
  return null;
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

// --- API Methods ---

export async function getUsers(
  page: number,
  pageSize: number,
  search: string,
  sort: string,
): Promise<UserListResponse> {
  const response = await apiClient.get<unknown>("/users");
  const users = normalizeUsers(response);

  // Filtering
  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? users.filter((item) => {
        const haystack = [item.full_name, item.email, item.employee_id]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(keyword);
      })
    : users;

  // Sorting
  const [sortField, sortDirection] = sort.split(":");
  const desc = sortDirection === "desc";

  const sorted = [...filtered].sort((a, b) => {
    const left = (a as Record<string, unknown>)[sortField];
    const right = (b as Record<string, unknown>)[sortField];
    return compareValues(left, right, desc);
  });

  // Pagination
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

export async function createUser(payload: CreateUserPayload) {
  return apiClient.post("/users", payload);
}

export async function getUserById(id: string): Promise<User> {
  const response = await apiClient.get<unknown>(`/users/${id}`);
  const user = normalizeUser(response);

  if (!user) {
    throw new Error("Invalid user detail response.");
  }

  return user;
}

export async function updateUserStatus(
  id: string,
  payload: UpdateUserStatusPayload,
) {
  return apiClient.patch(`/users/${id}/status`, payload);
}

export async function forceResetPassword(
  id: string,
  payload: ForceResetPasswordPayload,
) {
  return apiClient.post(`/users/${id}/force-reset-password`, payload);
}

export async function deleteUser(id: string) {
  return apiClient.delete(`/users/${id}`);
}
