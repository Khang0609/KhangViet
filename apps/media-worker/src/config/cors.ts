import type { Context, MiddlewareHandler } from "hono";
import type { MediaWorkerEnv } from "../services/types";

const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://khangviet.vn",
]);

function getCorsOrigin(c: Context<{ Bindings: MediaWorkerEnv }>): string {
  const origin = c.req.header("Origin");
  if (!origin) return "*";
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  if (c.env?.WEB_APP_URL && origin === c.env.WEB_APP_URL) return origin;
  return "*";
}

export const corsMiddleware: MiddlewareHandler<{ Bindings: MediaWorkerEnv }> = async (c, next) => {
  const allowOrigin = getCorsOrigin(c);
  c.header("Access-Control-Allow-Origin", allowOrigin);
  if (allowOrigin !== "*") {
    c.header("Access-Control-Allow-Credentials", "true");
  }
  c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With");
  c.header("Access-Control-Max-Age", "86400");

  if (c.req.method === "OPTIONS") {
    return c.body(null, 204);
  }

  await next();
};
