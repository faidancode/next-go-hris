import { apiClient } from "@/lib/api/client";

export type PermissionCatalogItem = {
  id: string;
  resource: string;
  action: string;
  label: string;
  category: string;
};

export type RoleItem = {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
};

export type RolePayload = {
  name: string;
  description?: string;
  permissions: string[];
};

export type UserWithRoles = {
  id: string;
  employee_id: string;
  employee_number: string;
  email: string;
  full_name: string;
  is_active: boolean;
  roles: string[];
  created_at: string;
};

export type AssignRolePayload = {
  role_name: string;
};

function normalizeArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    if (Array.isArray(body.items)) return body.items as T[];
    if (Array.isArray(body.data)) return body.data as T[];
  }
  return [];
}

function normalizeObject<T>(payload: unknown): T | null {
  if (!payload || typeof payload !== "object") return null;

  const body = payload as Record<string, unknown>;
  if ("id" in body) return body as T;
  if (body.data && typeof body.data === "object") {
    return body.data as T;
  }
  return null;
}

export async function getPermissionCatalog(): Promise<PermissionCatalogItem[]> {
  const response = await apiClient.get<unknown>("/rbac/permissions");
  return normalizeArray<PermissionCatalogItem>(response);
}

export async function getRoles(): Promise<RoleItem[]> {
  const response = await apiClient.get<unknown>("/rbac/roles");
  return normalizeArray<RoleItem>(response);
}

export async function getRoleById(id: string): Promise<RoleItem> {
  const response = await apiClient.get<unknown>(`/rbac/roles/${id}`);
  const role = normalizeObject<RoleItem>(response);

  if (!role) {
    throw new Error("Invalid role detail response.");
  }

  return role;
}

export async function createRole(payload: RolePayload) {
  return apiClient.post("/rbac/roles", payload);
}

export async function updateRole(id: string, payload: RolePayload) {
  return apiClient.put(`/rbac/roles/${id}`, payload);
}

export async function deleteRole(id: string) {
  return apiClient.delete(`/rbac/roles/${id}`);
}

export async function getUsersWithRoles(): Promise<UserWithRoles[]> {
  const response = await apiClient.get<unknown>("/users/with-roles");
  return normalizeArray<UserWithRoles>(response);
}

export async function assignRoleToUser(id: string, payload: AssignRolePayload) {
  return apiClient.patch(`/users/${id}/role`, payload);
}
