// =====================
// Configuration
// =====================

import { ApiEnvelope } from "@/types/api";

const DEFAULT_HEADERS: HeadersInit = {
  Accept: "application/json, text/plain, */*",
  "Content-Type": "application/json",
};

export type ApiRequestInit = RequestInit & {
  raw?: boolean;
};

const NO_REFRESH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/reset-password",
];

function shouldSkipRefresh(path: string) {
  return NO_REFRESH_PATHS.some((p) => path.startsWith(p));
}

// =====================
// Error
// =====================

export class ApiError<TBody = unknown> extends Error {
  status: number;
  body?: TBody;

  constructor(status: number, message: string, body?: TBody) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function extractMessage(body: unknown): string {
  if (!body) return "";
  if (typeof body === "string") return body;

  if (typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (
      record.error &&
      typeof record.error === "object" &&
      typeof (record.error as any).message === "string"
    ) {
      return (record.error as any).message;
    }
  }

  return "";
}

// =====================
// Low-level fetch
// =====================

async function apiFetch(
  path: string,
  options: ApiRequestInit & { __retry?: boolean } = {},
) {
  const isRefreshPath = path === "/auth/refresh";
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    cache: "no-store",
    ...options,
    headers: {
      "X-Client-Type": "web-admin",
      ...(options.headers || {}), // ⬅️ HANYA dari caller
    },
  });

  if (res.status === 401 && !options.__retry && !shouldSkipRefresh(path)) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return apiFetch(path, {
        ...options,
        __retry: true, // ⛔ prevent infinite loop
      });
    } else {
      throw new ApiError(401, "Session expired", {
        shouldLogout: true,
        isSessionExpired: true,
      });
    }
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }

    const message = extractMessage(body) || res.statusText || "Request failed";

    throw new ApiError(res.status, message, body);
  }

  if (options.raw) return res;
  return res.json();
}

// =====================
// MAIN FETCHER (🔥)
// =====================

export async function apiRequest<T>(
  path: string,
  bodyOrOptions?: unknown,
  maybeOptions: ApiRequestInit = {},
): Promise<ApiEnvelope<T>> {
  const isOptionsOnly =
    bodyOrOptions &&
    typeof bodyOrOptions === "object" &&
    ("method" in bodyOrOptions || "headers" in bodyOrOptions);

  const body = isOptionsOnly ? undefined : bodyOrOptions;
  const options = isOptionsOnly
    ? (bodyOrOptions as ApiRequestInit)
    : maybeOptions;

  const isFormData = body instanceof FormData;

  const method = options.method ?? (body ? "POST" : "GET");

  const res = await apiFetch(path, {
    ...options,
    method,
    body: body
      ? isFormData
        ? body
        : typeof body === "string"
          ? body
          : JSON.stringify(body)
      : undefined,
    headers: {
      ...(isFormData ? {} : DEFAULT_HEADERS),
      ...(options.headers || {}),
    },
  });

  return res as ApiEnvelope<T>;
}

// =====================
// Helpers
// =====================

export function unwrapEnvelope<T>(
  envelope: ApiEnvelope<T>,
  fallback = "Request failed",
): T {
  if (envelope.success) return envelope.data;

  const message =
    typeof envelope.error?.message === "string"
      ? envelope.error.message
      : fallback;

  throw new ApiError(400, message, envelope.error);
}

export function buildQueryString(params?: Record<string, unknown>) {
  if (!params) return "";

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    search.set(key, String(value));
  }

  return search.toString();
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });

    return res.ok;
  } catch {
    return false;
  }
}
