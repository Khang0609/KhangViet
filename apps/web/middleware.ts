import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route Guard bảo vệ nhánh /admin phía Server (SEC-07).
 * Chặn người dùng chưa xác thực tải dashboard và redirect về trang /login.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
