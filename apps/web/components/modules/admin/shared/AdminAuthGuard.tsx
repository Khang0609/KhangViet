"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getApiBaseUrl } from "@/lib/apiClient";

/**
 * Client-side Auth Guard (Phòng vệ chuyên sâu).
 * Xác thực phiên làm việc trực tiếp với Cloudflare D1 qua /api/auth/me.
 * Nếu phiên hết hạn hoặc không có quyền Admin, tự động chuyển hướng về /login.
 */
export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const data = await res.json();
        if (data?.success && data?.data?.role === "ADMIN") {
          if (isMounted) {
            setIsAuthorized(true);
            setChecking(false);
          }
        } else {
          throw new Error("Forbidden");
        }
      } catch {
        if (isMounted) {
          router.replace("/login?redirect=/admin");
        }
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg-obsidian)">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-6 animate-spin text-(--accent-bronze)" />
          <span className="font-mono-tech text-xs tracking-wider text-white/50 uppercase">
            Xác thực phiên làm việc...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
