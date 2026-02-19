import { apiClient } from "@/lib/api/client";
import {
  extractTokens,
  getSession,
  normalizeSessionUser,
  setSession,
} from "@/lib/auth/session";

type CacheEntry = {
  value: boolean;
  expiresAt: number;
};

const CACHE_TTL_MS = 15_000;
const rbacCache = new Map<string, CacheEntry>();

export type Resource = string;
export type Action = string;

function getCacheKey(
  employeeId: string,
  companyId: string,
  resource: Resource,
  action: Action,
) {
  return `rbac:${employeeId}:${companyId}:${resource}:${action}`;
}

export function clearRbacCache() {
  rbacCache.clear();
}

async function ensureRbacIdentity() {
  const current = getSession();
  if (current?.user?.employee_id && current.user.company_id) {
    return current;
  }

  try {
    const me = await apiClient.get<Record<string, unknown>>("/auth/me");
    const user = normalizeSessionUser(me);
    if (!user) return current;

    const tokens = extractTokens(me);
    setSession({
      accessToken: tokens.accessToken ?? current?.accessToken,
      refreshToken: tokens.refreshToken ?? current?.refreshToken,
      user,
    });

    return getSession();
  } catch {
    return current;
  }
}

export async function can(
  resource: Resource,
  action: Action,
): Promise<boolean> {
  const session = await ensureRbacIdentity();
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
  console.log("rbac payload", {
    employee_id: session.user.employee_id,
    company_id: session.user.company_id,
    resource,
    action,
  });

  const response = await apiClient.post<{ allowed: boolean }>("/rbac/enforce", {
    employee_id: session.user.employee_id,
    company_id: session.user.company_id,
    resource,
    action,
  });

  const allowed = Boolean(response?.allowed);
  console.log("rbac result", {
    resource,
    action,
    allowed,
    response,
  });
  rbacCache.set(key, { value: allowed, expiresAt: now + CACHE_TTL_MS });
  return allowed;
}

export const __internal = {
  getCacheKey,
  cache: rbacCache,
  CACHE_TTL_MS,
};
