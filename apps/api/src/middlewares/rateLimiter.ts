import { Context, Next } from "hono";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitOptions {
  max: number;
  windowMs: number;
  message?: string;
}

const memoryStore = new Map<string, RateLimitEntry>();

const cleanupExpired = (now: number) => {
  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetTime) {
      memoryStore.delete(key);
    }
  }
};

const resolveClientIp = (c: Context): string => {
  return (
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    "direct-client"
  );
};

export const createRateLimiter = (options: RateLimitOptions) => {
  return async (c: Context, next: Next) => {
    const now = Date.now();
    if (memoryStore.size > 200) cleanupExpired(now);

    const ip = resolveClientIp(c);
    const key = `${c.req.path}:${ip}`;
    const entry = memoryStore.get(key);

    if (!entry || now > entry.resetTime) {
      memoryStore.set(key, { count: 1, resetTime: now + options.windowMs });
      return await next();
    }

    entry.count++;
    if (entry.count > options.max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      c.header("Retry-After", retryAfter.toString());
      return c.json(
        {
          success: false as const,
          error:
            options.message ||
            "Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau.",
        },
        429
      );
    }

    return await next();
  };
};
