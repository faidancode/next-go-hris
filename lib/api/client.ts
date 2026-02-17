import {
  clearSession,
  extractTokens,
  getSession,
  mergeSession,
} from "@/lib/auth/session";

type ErrorPayload = {
  message?: string;
  error?: string | { message?: string; code?: string };
  code?: string;
  errors?: Record<string, string[]>;
};

export class AppError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: unknown) {
    super(message, 401, "UNAUTHORIZED", details);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: unknown) {
    super(message, 403, "FORBIDDEN", details);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends AppError {
  fieldErrors?: Record<string, string[]>;

  constructor(message = "Validation Error", details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";

    if (details && typeof details === "object") {
      const payload = details as ErrorPayload;
      if (payload.errors && typeof payload.errors === "object") {
        this.fieldErrors = payload.errors;
      }
    }
  }
}

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  skipAuthRetry?: boolean;
};

const AUTH_BYPASS_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
]);

function normalizePath(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/api/")) return path;
  if (path.startsWith("/rbac/")) return `/api${path}`;
  if (path.startsWith("/")) return `/api/v1${path}`;
  return `/api/v1/${path}`;
}

function inferMessage(payload: unknown, fallback: string): string {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  if (typeof payload !== "object") return fallback;

  const body = payload as ErrorPayload;
  if (typeof body.message === "string") return body.message;
  if (typeof body.error === "string") return body.error;
  if (body.error && typeof body.error === "object" && typeof body.error.message === "string") {
    return body.error.message;
  }
  return fallback;
}

function inferCode(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const body = payload as ErrorPayload;
  if (typeof body.code === "string") return body.code;
  if (body.error && typeof body.error === "object" && typeof body.error.code === "string") {
    return body.error.code;
  }
  return undefined;
}

function mapError(status: number, payload: unknown, fallback: string) {
  const message = inferMessage(payload, fallback);
  const code = inferCode(payload);

  if (status === 401) return new UnauthorizedError(message, payload);
  if (status === 403) return new ForbiddenError(message, payload);
  if (status === 400) return new ValidationError(message, payload);
  return new AppError(message, status, code, payload);
}

function parseResponseBody(text: string): unknown {
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function unwrapPayload<T>(status: number, payload: unknown): T {
  if (!payload || typeof payload !== "object") {
    return payload as T;
  }

  const body = payload as Record<string, unknown>;

  if ("ok" in body && typeof body.ok === "boolean") {
    if (!body.ok) {
      throw mapError(status, body.error ?? body, "Request failed");
    }
    return ("data" in body ? body.data : body) as T;
  }

  if ("success" in body && typeof body.success === "boolean") {
    if (!body.success) {
      throw mapError(status, body.error ?? body, "Request failed");
    }
    return ("data" in body ? body.data : body) as T;
  }

  if ("error" in body && !("data" in body) && typeof body.error === "string") {
    throw mapError(status, body, body.error);
  }

  return payload as T;
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const pathname = window.location.pathname;
  if (pathname === "/login") return;

  const next = encodeURIComponent(`${pathname}${window.location.search}`);
  window.location.replace(`/login?next=${next}`);
}

async function refreshToken(): Promise<boolean> {
  const session = getSession();

  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  if (session?.refreshToken) {
    headers.set("Authorization", `Bearer ${session.refreshToken}`);
  }

  const refreshBody = session?.refreshToken
    ? JSON.stringify({
        refresh_token: session.refreshToken,
        refreshToken: session.refreshToken,
      })
    : undefined;

  const response = await fetch("/api/v1/auth/refresh", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers,
    body: refreshBody,
  });

  if (!response.ok) return false;

  const text = await response.text();
  const payload = parseResponseBody(text);
  const unwrapped = unwrapPayload<Record<string, unknown>>(response.status, payload);
  const tokens = extractTokens(unwrapped);

  if (!session) {
    return Boolean(tokens.accessToken);
  }

  if (tokens.accessToken || tokens.refreshToken) {
    mergeSession({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? session.refreshToken,
    });
  } else {
    // Refresh succeeded but backend did not return token payload.
    // Drop potentially stale bearer token and let cookie-based auth proceed.
    mergeSession({
      accessToken: undefined,
      refreshToken: session.refreshToken,
    });
  }

  return true;
}

export async function request<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const url = normalizePath(path);
  const method = options.method ?? "GET";
  const isAuthBypass = AUTH_BYPASS_PATHS.has(path);
  const session = getSession();

  const headers = new Headers(options.headers ?? {});
  headers.set("Accept", "application/json");

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (session?.accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const response = await fetch(url, {
    ...options,
    method,
    credentials: "include",
    cache: "no-store",
    headers,
    body:
      options.body === undefined
        ? undefined
        : isFormData
          ? (options.body as FormData)
          : JSON.stringify(options.body),
  });

  if (response.status === 401 && !options.skipAuthRetry && !isAuthBypass) {
    const refreshed = await refreshToken().catch(() => false);
    if (refreshed) {
      return request<T>(path, { ...options, skipAuthRetry: true });
    }

    clearSession();
    redirectToLogin();
    throw new UnauthorizedError("Session expired");
  }

  const text = await response.text();
  const payload = parseResponseBody(text);

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
      redirectToLogin();
    }
    throw mapError(response.status, payload, response.statusText || "Request failed");
  }

  return unwrapPayload<T>(response.status, payload);
}

export const apiClient = {
  request,
  get: <T>(path: string, options: Omit<ApiRequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options: Omit<ApiRequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options: Omit<ApiRequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options: Omit<ApiRequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options: Omit<ApiRequestOptions, "method" | "body"> = {}) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

export const __internal = {
  mapError,
  normalizePath,
  unwrapPayload,
};
