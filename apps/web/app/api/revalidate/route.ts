import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

const isDev = process.env.NODE_ENV !== "production";
const EXPECTED_SECRET =
  process.env.REVALIDATE_SECRET || (isDev ? "kv-revalidate-secret-2026" : undefined);

export async function POST(request: NextRequest) {
  if (!EXPECTED_SECRET) {
    return NextResponse.json(
      { success: false, message: "REVALIDATE_SECRET is not configured on server" },
      { status: 500 }
    );
  }

  const secret =
    request.nextUrl.searchParams.get("secret") ||
    request.headers.get("x-revalidate-secret");

  if (!secret || secret !== EXPECTED_SECRET) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Invalid or missing revalidation secret token" },
      { status: 401 }
    );
  }

  const tag = request.nextUrl.searchParams.get("tag") || "cms-landing";
  const path = request.nextUrl.searchParams.get("path");

  try {
    revalidateTag(tag, { expire: 0 });
    if (path) {
      revalidatePath(path);
    } else {
      revalidatePath("/", "layout");
      revalidatePath("/", "page");
    }

    return NextResponse.json({
      revalidated: true,
      tag,
      path: path || "/",
      now: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method Not Allowed. Use POST for revalidation" },
    { status: 405 }
  );
}
