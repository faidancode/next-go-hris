import { apiClient } from "@/lib/api/client";
import { getSession } from "@/lib/auth/session";

type CacheEntry = {
  value: boolean;
  expiresAt: number;
};

const CACHE_TTL_MS = 15_000;
const rbacCache = new Map<string, CacheEntry>();

export type Resource = string;
export type Action = string;

function getCacheKey(employeeId: string, companyId: string, resource: Resource, action: Action) {
  return `rbac:${employeeId}:${companyId}:${resource}:${action}`;
}

export function clearRbacCache() {
  rbacCache.clear();
}

export async function can(resource: Resource, action: Action): Promise<boolean> {
  const session = getSession();
  if (!session?.user?.employee_id || !session.user.company_id) {
    return false;
  }

  const key = getCacheKey(
    session.user.employee_id,
    session.user.company_id,
    resource,
    action,
  );

  const now = Date.now();
  const cached = rbacCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const response = await apiClient.post<{ allowed: boolean }>("/rbac/enforce", {
    employee_id: session.user.employee_id,
    company_id: session.user.company_id,
    resource,
    action,
  });

  const allowed = Boolean(response?.allowed);
  rbacCache.set(key, { value: allowed, expiresAt: now + CACHE_TTL_MS });
  return allowed;
}

export const __internal = {
  getCacheKey,
  cache: rbacCache,
  CACHE_TTL_MS,
};
