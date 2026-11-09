import { Hono } from "hono";
import { corsMiddleware } from "./config/cors";
import { registerRoutes } from "./routes";
import type { MediaWorkerEnv } from "./services/types";

const app = new Hono<{ Bindings: MediaWorkerEnv }>();

// 1. Áp dụng CORS Middleware
app.use("*", corsMiddleware);

// 2. Bảo mật HTTP Headers (SEC-08 nosniff)
app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
});

// 3. Đăng ký các endpoints
registerRoutes(app);

// 4. Xử lý 404 Not Found mặc định
app.notFound((c) => {
  return c.json({ success: false, error: { code: "NOT_FOUND", message: "Endpoint không tồn tại" } }, 404);
});

// 5. Xử lý lỗi ngoại lệ không mong muốn
app.onError((err, c) => {
  console.error("Unhandled Worker Error:", err);
  return c.json({ success: false, error: { code: "INTERNAL_ERROR", message: err.message || "Lỗi hệ thống" } }, 500);
});

export default app;
