import { Context, Next } from "hono";

export const errorHandler = async (err: Error, c: Context) => {
  console.error(`[API ERROR] ${c.req.method} ${c.req.url}:`, err);
  return c.json(
    {
      success: false,
      error: err.message || "Internal Server Error",
    },
    500,
  );
};
