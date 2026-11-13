import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { AccessTokenPayload } from "@khangviet/types";
import { D1DatabaseBinding } from "@khangviet/repositories";
import { getContextRepos } from "../helpers/repoResolver";

export type AuthVariables = {
  authUser: {
    userId: string;
    email: AccessTokenPayload["email"];
    role: AccessTokenPayload["role"];
  };
};

export type AppEnv = {
  Variables: AuthVariables;
  Bindings?: {
    DB?: D1DatabaseBinding;
    ASSETS?: Fetcher;
    JWT_SECRET?: string;
    ENVIRONMENT?: string;
    NODE_ENV?: string;
    WEB_APP_URL?: string;
    TELEGRAM_BOT_TOKEN?: string;
    TELEGRAM_CHAT_ID?: string | null;
  };
};

const DEFAULT_SECRET = "khangviet-dev-jwt-secret-2026";

export const getJwtSecret = (c: Context<AppEnv>): string => {
  return c.env?.JWT_SECRET || DEFAULT_SECRET;
};

export const authMiddleware = async (c: Context<AppEnv>, next: Next) => {
  const sessionId = getCookie(c, "session_id");

  // Kiểm tra nếu có request cũ gửi Bearer Token -> Chặn thẳng tay và cảnh báo theo yêu cầu bảo mật
  const authHeader = c.req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    console.warn(
      `[SECURITY-ALERT] Rejected deprecated Bearer token from IP: ${c.req.header("cf-connecting-ip") || "unknown"}`,
    );
  }

  if (!sessionId) {
    return c.json(
      {
        success: false as const,
        error: "Unauthorized: Missing session cookie",
      },
      401,
    );
  }

  const sessionRepo = getContextRepos(c).session;
  if (!sessionRepo) {
    return c.json(
      {
        success: false as const,
        error: "Internal Server Error: Session store unavailable",
      },
      500,
    );
  }

  const user = await sessionRepo.findUserBySessionId(sessionId);
  if (!user) {
    return c.json(
      {
        success: false as const,
        error: "Unauthorized: Session invalid or expired",
      },
      401,
    );
  }

  c.set("authUser", {
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return await next();
};

export const requireAdmin = async (c: Context<AppEnv>, next: Next) => {
  const user = c.get("authUser");
  if (!user || user.role !== "ADMIN") {
    return c.json(
      { success: false as const, error: "Forbidden: Admin access required" },
      403,
    );
  }
  return await next();
};
