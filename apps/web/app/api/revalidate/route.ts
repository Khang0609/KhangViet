import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

const EXPECTED_SECRET =
  process.env.REVALIDATE_SECRET || "kv-revalidate-secret-2026";

function handleRevalidate(
  secret: string | null,
  tag: string | null,
  path: string | null
) {
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev && secret && secret !== EXPECTED_SECRET) {
    return NextResponse.json(
      { success: false, message: "Invalid revalidation secret token" },
      { status: 401 }
    );
  }

  const targetTag = tag || "cms-landing";
  try {
    revalidateTag(targetTag, "max");
    if (path) {
      revalidatePath(path);
    } else {
      revalidatePath("/", "page");
    }

    return NextResponse.json({
      revalidated: true,
      tag: targetTag,
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

export async function POST(request: NextRequest) {
  const secret =
    request.nextUrl.searchParams.get("secret") ||
    request.headers.get("x-revalidate-secret");
  const tag = request.nextUrl.searchParams.get("tag");
  const path = request.nextUrl.searchParams.get("path");

  return handleRevalidate(secret, tag, path);
}

export async function GET(request: NextRequest) {
  const secret =
    request.nextUrl.searchParams.get("secret") ||
    request.headers.get("x-revalidate-secret");
  const tag = request.nextUrl.searchParams.get("tag");
  const path = request.nextUrl.searchParams.get("path");

  return handleRevalidate(secret, tag, path);
}

