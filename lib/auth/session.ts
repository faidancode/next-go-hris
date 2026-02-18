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
    role: (typeof source.role === "string" && source.role) || undefined,
  };
}
