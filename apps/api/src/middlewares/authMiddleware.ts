import { Context, Next } from "hono";
import { AccessTokenPayload } from "@khangviet/types";
import { TokenService } from "../services/tokenService";

export type AuthVariables = {
  authUser: AccessTokenPayload;
};

export type AppEnv = {
  Variables: AuthVariables;
  Bindings?: {
    JWT_SECRET?: string;
    ENVIRONMENT?: string;
    NODE_ENV?: string;
    WEB_APP_URL?: string;
  };
};

const DEFAULT_SECRET = "khangviet-dev-jwt-secret-2026";

export const getJwtSecret = (c: Context<AppEnv>): string => {
  const secret = c.env?.JWT_SECRET;
  if (!secret) {
    const isProduction =
      c.env?.NODE_ENV === "production" || c.env?.ENVIRONMENT === "production";
    if (isProduction) {
      throw new Error(
        "FATAL: JWT_SECRET environment variable is missing in production!"
      );
    }
    return DEFAULT_SECRET;
  }
  return secret;
};

export const authMiddleware = async (c: Context<AppEnv>, next: Next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { success: false as const, error: "Unauthorized: Missing Bearer token" },
      401
    );
  }

  const token = authHeader.substring(7).trim();
  const secret = getJwtSecret(c);
  const verifyResult = await TokenService.verifyAccessToken(token, secret);

  if (!verifyResult.success) {
    return c.json(
      { success: false as const, error: "Unauthorized: Token invalid or expired" },
      401
    );
  }

  c.set("authUser", verifyResult.data);
  return await next();
};

export const requireAdmin = async (c: Context<AppEnv>, next: Next) => {
  const user = c.get("authUser");
  if (!user || user.role !== "ADMIN") {
    return c.json(
      { success: false as const, error: "Forbidden: Admin access required" },
      403
    );
  }
  return await next();
};
