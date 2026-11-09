import { NextResponse } from "next/server";

/**
 * Route Handler BFF cho /api/auth/logout.
 * Xóa First-Party Cookie trên domain Next.js.
 */
export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.delete("refreshToken");
  return response;
}
