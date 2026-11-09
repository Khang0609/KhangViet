import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/apiClient";

/**
 * Route Handler BFF cho /api/auth/login trên Next.js (Vercel).
 * Đóng vai trò proxy gọi Cloudflare Worker, sau đó tự tay set First-Party Cookie
 * lên domain của Next.js để middleware.ts đọc được trơn tru trên mọi domain (Preview/Prod).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const targetUrl = `${getApiBaseUrl()}/api/auth/login`;

    const apiRes = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await apiRes.json().catch(() => null);

    if (!apiRes.ok || !data?.success) {
      return NextResponse.json(
        data || { success: false, error: "Đăng nhập thất bại" },
        { status: apiRes.status || 401 }
      );
    }

    // Lấy cookie refreshToken được backend trả về từ header set-cookie (nếu có)
    const rawSetCookie = apiRes.headers.get("set-cookie") || "";
    let refreshTokenVal = "";

    const match = rawSetCookie.match(/refreshToken=([^;]+)/);
    if (match && match[1]) {
      refreshTokenVal = match[1];
    }

    const response = NextResponse.json(data, { status: 200 });

    // Set First-Party Cookie trực tiếp lên domain của Web App
    if (refreshTokenVal) {
      const isHttps = request.nextUrl.protocol === "https:";
      response.cookies.set("refreshToken", refreshTokenVal, {
        httpOnly: true,
        secure: isHttps,
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 ngày
      });
    }

    return response;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Lỗi kết nối máy chủ";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
