import { NextRequest, NextResponse } from "next/server";

const DEFAULT_TARGET =
  process.env.API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:3000";

function buildUpstreamUrl(path: string[], search: string) {
  const base = DEFAULT_TARGET.replace(/\/$/, "");

  let normalizedPath = path;
  if (path[0] === "v1") {
    normalizedPath = ["api", ...path];
  } else if (
    path.length > 0 &&
    path[0] !== "api" &&
    path[0] !== "rbac"
  ) {
    normalizedPath = ["api", "v1", ...path];
  }

  const suffix = normalizedPath.length ? `/${normalizedPath.join("/")}` : "";
  return `${base}${suffix}${search}`;
}

async function forward(request: NextRequest, path: string[]) {
  const targetUrl = buildUpstreamUrl(path, request.nextUrl.search);

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const method = request.method;
  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : Buffer.from(await request.arrayBuffer());

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: "manual",
      credentials: "include",
    });

    console.log("✅ Upstream response:", {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
    });

    const response = new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
    });

    const headersWithSetCookie = upstreamResponse.headers as Headers & {
      getSetCookie?: () => string[];
    };

    const setCookies =
      typeof headersWithSetCookie.getSetCookie === "function"
        ? headersWithSetCookie.getSetCookie()
        : [];

    if (setCookies.length > 0) {
      for (const cookie of setCookies) {
        response.headers.append("set-cookie", cookie);
      }
    } else {
      const setCookie = upstreamResponse.headers.get("set-cookie");
      if (setCookie) {
        response.headers.append("set-cookie", setCookie);
      }
    }

    return response;
  } catch (error) {
    console.error("❌ Fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch from backend",
        details: error instanceof Error ? error.message : "Unknown error",
        targetUrl,
      },
      { status: 500 }
    );
  }
}

async function handler(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const resolved = await context.params;
  const path = resolved.path || [];
  return forward(request, path);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
