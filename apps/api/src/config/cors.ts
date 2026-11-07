import { Context } from "hono";
import { AppEnv } from "../middlewares/authMiddleware";

const PRODUCTION_ORIGINS = [
  "https://khangviet.vn",
  "https://www.khangviet.vn",
  "https://admin.khangviet.vn",
];

const DEV_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:8787",
  "http://127.0.0.1:8787",
];

/**
 * Xử lý Whitelist Origin động theo ngữ cảnh môi trường.
 * Chặn hoàn toàn hành vi phản xạ wildcard khi có credentials: true (SEC-01).
 */
export const resolveAllowedOrigin = (
  origin: string | undefined,
  c: Context<AppEnv>
): string | null => {
  if (!origin) return null;

  const allowed = [...PRODUCTION_ORIGINS];
  const webAppUrl = c.env?.WEB_APP_URL;
  if (webAppUrl) allowed.push(webAppUrl);

  const isProduction =
    c.env?.NODE_ENV === "production" || c.env?.ENVIRONMENT === "production";
  if (!isProduction) {
    allowed.push(...DEV_ORIGINS);
  }

  return allowed.includes(origin) ? origin : null;
};
