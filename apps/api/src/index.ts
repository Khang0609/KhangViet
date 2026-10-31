import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { Scalar } from "@scalar/hono-api-reference";
import { errorHandler } from "./middlewares/errorHandler";
import { defaultValidationHook } from "./middlewares/validationHook";
import { adminAuthMiddleware } from "./middlewares/adminAuth";
import { publicContentRouter } from "./routes/publicContent";
import { publicLeadsRouter } from "./routes/publicLeads";
import { adminCmsRouter } from "./routes/adminCms";
import { adminLeadsRouter } from "./routes/adminLeads";

const app = new OpenAPIHono({
  defaultHook: defaultValidationHook,
});

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

// Custom 404 Handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: "Đường dẫn không tồn tại (Not Found)",
    },
    404
  );
});

// Health check & Info
app.get("/", (c) => {
  return c.json({
    name: "Khang Viet Design API",
    version: "1.0.0",
    status: "healthy",
    docs: "/reference",
    openapi: "/doc",
  });
});

// Mount Public API
app.route("/api/v1/content", publicContentRouter);
app.route("/api/v1/leads", publicLeadsRouter);

// Mount Admin API (Protected with Bearer Token)
app.use("/api/v1/admin/*", adminAuthMiddleware);
app.route("/api/v1/admin/cms", adminCmsRouter);
app.route("/api/v1/admin/leads", adminLeadsRouter);

// OpenAPI Spec & Documentation UI
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "Khang Viet Design API",
    version: "1.0.0",
    description: "API hệ thống Khang Việt Architecture & Construction",
  },
});

app.get(
  "/reference",
  Scalar({
    theme: "purple",
    url: "/doc",
  })
);

export default app;
