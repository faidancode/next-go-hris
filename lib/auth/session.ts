"use client";

export type SessionUser = {
  id: string;
  company_id?: string;
  employee_id?: string;
  email: string;
  name: string;
  role?: string;
};

export type AuthSession = {
  accessToken?: string;
  refreshToken?: string;
  user: SessionUser;
};

const SESSION_STORAGE_KEY = "go-hris.session";
const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function isBrowser() {
  return typeof window !== "undefined";
}

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function writeCookie(name: string, value: string, maxAge = COOKIE_MAX_AGE_SECONDS) {
  if (!isBrowser()) return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (!isBrowser()) return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function normalizeRoleValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  return normalized || undefined;
}

function extractRoleFromObject(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const source = value as Record<string, unknown>;

  return (
    normalizeRoleValue(source.role) ||
    normalizeRoleValue(source.name) ||
    normalizeRoleValue(source.code) ||
    normalizeRoleValue(source.slug) ||
    normalizeRoleValue(source.key) ||
    normalizeRoleValue(source.label) ||
    normalizeRoleValue(source.value)
  );
}

function pickMostPrivilegedRole(roles: string[]): string | undefined {
  if (!roles.length) return undefined;

  const priority = [
    "superadmin",
    "admin",
    "hr",
    "manager",
    "lead",
    "supervisor",
    "employee",
  ];

  const unique = Array.from(new Set(roles));
  const best = unique.sort((a, b) => {
    const ia = priority.indexOf(a);
    const ib = priority.indexOf(b);
    const pa = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
    const pb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
    return pa - pb;
  })[0];

  return best;
}

function resolveRole(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;

  const root = payload as Record<string, unknown>;
  const source = (
    root.user && typeof root.user === "object"
      ? root.user
      : root
  ) as Record<string, unknown>;
  const nestedEmployee =
    source.employee && typeof source.employee === "object"
      ? (source.employee as Record<string, unknown>)
      : undefined;

  const collected: string[] = [];
  const collect = (candidate: unknown) => {
    const role = normalizeRoleValue(candidate) || extractRoleFromObject(candidate);
    if (role) collected.push(role);
  };

  collect(root.role);
  collect(source.role);
  collect(nestedEmployee?.role);
  collect(root.role_name);
  collect(root.roleName);
  collect(source.role_name);
  collect(source.roleName);

  const collectRoleArray = (value: unknown) => {
    if (!Array.isArray(value)) return;
    for (const item of value) collect(item);
  };

  collectRoleArray(root.roles);
  collectRoleArray(source.roles);
  collectRoleArray(nestedEmployee?.roles);

  return pickMostPrivilegedRole(collected);
}

export function getSession(): AuthSession | null {
  if (!isBrowser()) return null;
  return safeParse<AuthSession>(localStorage.getItem(SESSION_STORAGE_KEY));
}

export function setSession(session: AuthSession): void {
  if (!isBrowser()) return;

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

  if (session.accessToken) {
    writeCookie(ACCESS_TOKEN_COOKIE, session.accessToken);
  } else {
    clearCookie(ACCESS_TOKEN_COOKIE);
  }

  if (session.refreshToken) {
    writeCookie(REFRESH_TOKEN_COOKIE, session.refreshToken);
  } else {
    clearCookie(REFRESH_TOKEN_COOKIE);
  }
}

export function mergeSession(partial: Partial<AuthSession>): AuthSession | null {
  const current = getSession();
  if (!current) return null;

  const merged: AuthSession = {
    ...current,
    ...partial,
    user: partial.user ?? current.user,
  };

  setSession(merged);
  return merged;
}

export function clearSession(): void {
  if (!isBrowser()) return;

  localStorage.removeItem(SESSION_STORAGE_KEY);
  clearCookie(ACCESS_TOKEN_COOKIE);
  clearCookie(REFRESH_TOKEN_COOKIE);
}

export function extractTokens(payload: unknown): {
  accessToken?: string;
  refreshToken?: string;
} {
  if (!payload || typeof payload !== "object") return {};

  const visited = new Set<unknown>();
  let accessToken: string | undefined;
  let refreshToken: string | undefined;

  const walk = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    if (visited.has(value)) return;
    visited.add(value);

    const body = value as Record<string, unknown>;

    if (!accessToken) {
      accessToken =
        (typeof body.access_token === "string" && body.access_token) ||
        (typeof body.accessToken === "string" && body.accessToken) ||
        (typeof body.token === "string" && body.token) ||
        (typeof body.jwt === "string" && body.jwt) ||
        accessToken;
    }

    if (!refreshToken) {
      refreshToken =
        (typeof body.refresh_token === "string" && body.refresh_token) ||
        (typeof body.refreshToken === "string" && body.refreshToken) ||
        refreshToken;
    }

    for (const next of Object.values(body)) {
      if (accessToken && refreshToken) return;
      if (next && typeof next === "object") walk(next);
    }
  };

  walk(payload);
  return { accessToken, refreshToken };
}

export function normalizeSessionUser(payload: unknown): SessionUser | null {
  if (!payload || typeof payload !== "object") return null;

  const toStringId = (value: unknown): string | undefined => {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return undefined;
  };

  const root = payload as Record<string, unknown>;
  const source = (
    root.user && typeof root.user === "object"
      ? root.user
      : root
  ) as Record<string, unknown>;

  const nestedCompany =
    source.company && typeof source.company === "object"
      ? (source.company as Record<string, unknown>)
      : undefined;
  const nestedEmployee =
    source.employee && typeof source.employee === "object"
      ? (source.employee as Record<string, unknown>)
      : undefined;

  const id =
    toStringId(source.id) ||
    toStringId(source.user_id) ||
    toStringId(source.userId) ||
    "";

  const email =
    (typeof source.email === "string" && source.email) ||
    (typeof source.username === "string" && source.username) ||
    "";
  const name =
    (typeof source.name === "string" && source.name) ||
    (typeof source.full_name === "string" && source.full_name) ||
    (typeof source.fullName === "string" && source.fullName) ||
    "";

  if (!id || !email) return null;

  return {
    id,
    email,
    name: name || email,
    company_id: (
      toStringId(source.company_id) ||
      toStringId(source.companyId) ||
      toStringId(source.companyID) ||
      toStringId(source.company) ||
      toStringId(nestedCompany?.id) ||
      toStringId(nestedCompany?.company_id)
    ),
    employee_id: (
      toStringId(source.employee_id) ||
      toStringId(source.employeeId) ||
      toStringId(source.employeeID) ||
      toStringId(source.employee) ||
      toStringId(nestedEmployee?.id) ||
      toStringId(nestedEmployee?.employee_id)
    ),
    role: resolveRole(payload),
  };
}
