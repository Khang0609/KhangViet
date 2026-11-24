import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { Scalar } from "@scalar/hono-api-reference";
import { errorHandler } from "./middlewares/errorHandler";
import { defaultValidationHook } from "./middlewares/validationHook";
import { adminAuthMiddleware } from "./middlewares/adminAuth";
import { publicContentRouter } from "./routes/publicContent";
import { publicLeadsRouter } from "./routes/publicLeads";
import { adminCmsRouter } from "./routes/adminCms";
import { adminLeadsRouter } from "./routes/adminLeads";
import { adminOrganizationsRouter } from "./routes/adminOrganizations";
import { protectedRouter } from "./routes/protected";
import { AppEnv } from "./middlewares/authMiddleware";
import { resolveAllowedOrigin } from "./config/cors";

const app = new OpenAPIHono<AppEnv>({
  defaultHook: defaultValidationHook,
});

// Global Security & Defense-in-depth Middlewares
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: (origin, c) => resolveAllowedOrigin(origin, c),
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Cf-Access-Jwt-Assertion", "X-Dev-User-Email"],
  })
);

app.onError(errorHandler);

// Health check & Info
app.get("/api/health", (c) => {
  return c.json({
    name: "Khang Viet Design API",
    version: "2.0.0",
    status: "healthy",
  });
});

// Mount Routes
app.route("/api", protectedRouter);
app.route("/api/v1/content", publicContentRouter);
app.route("/api/v1/leads", publicLeadsRouter);

app.use("/api/v1/admin/*", adminAuthMiddleware);
app.route("/api/v1/admin/cms", adminCmsRouter);
app.route("/api/v1/admin/organizations", adminOrganizationsRouter);
app.route("/api/v1/admin/leads", adminLeadsRouter);

// Fallback phục vụ Static Assets của Frontend cho tất cả các đường dẫn giao diện
app.notFound(async (c) => {
  const pathname = new URL(c.req.url).pathname;
  if (c.env?.ASSETS && !pathname.startsWith("/api/")) {
    return await c.env.ASSETS.fetch(c.req.raw);
  }

  return c.json(
    { success: false as const, error: "Đường dẫn không tồn tại (Not Found)" },
    404
  );
});

// OpenAPI Spec & Documentation UI - Dev only
if (process.env.NODE_ENV !== "production") {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      title: "Khang Viet Design API",
      version: "2.0.0",
      description: "API hệ thống Khang Việt Architecture & Construction",
    },
  });

  app.get("/reference", Scalar({ theme: "purple", url: "/doc" }));
}

export default app;
