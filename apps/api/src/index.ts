import { Hono } from "hono";
import { cors } from "hono/cors";
import { errorHandler } from "./middlewares/errorHandler";
import { adminAuthMiddleware } from "./middlewares/adminAuth";
import { publicContentRouter } from "./routes/publicContent";
import { publicLeadsRouter } from "./routes/publicLeads";
import { adminCmsRouter } from "./routes/adminCms";
import { adminLeadsRouter } from "./routes/adminLeads";

const app = new Hono();

// Global Middlewares
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.onError(errorHandler);

// Health check & Info
app.get("/", (c) => {
  return c.json({
    name: "Khang Viet Design API",
    version: "1.0.0",
    status: "healthy",
    docs: "/api/v1",
  });
});

// Mount Public API
app.route("/api/v1/content", publicContentRouter);
app.route("/api/v1/leads", publicLeadsRouter);

// Mount Admin API (Protected with Bearer Token)
app.use("/api/v1/admin/*", adminAuthMiddleware);
app.route("/api/v1/admin/cms", adminCmsRouter);
app.route("/api/v1/admin/leads", adminLeadsRouter);

export default app;
