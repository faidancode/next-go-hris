import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register-company"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function hasSessionCookie(req: NextRequest) {
  return Boolean(
    req.cookies.get("access_token")?.value ||
    req.cookies.get("refresh_token")?.value,
  );
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const authenticated = hasSessionCookie(req);
  const isPublic = isPublicPath(pathname);
  console.log({ pathname });
  console.log({ isPublic });
  if (!authenticated && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
