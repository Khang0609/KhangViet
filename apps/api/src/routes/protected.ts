import { OpenAPIHono } from "@hono/zod-openapi";
import { protectedRoute } from "../contracts/protectedContracts";
import { authMiddleware, AppEnv } from "../middlewares/authMiddleware";

export const protectedRouter = new OpenAPIHono<AppEnv>();

protectedRouter.use("/protected", authMiddleware);

protectedRouter.openapi(protectedRoute, async (c) => {
  const authUser = c.get("authUser");

  return c.json(
    {
      success: true as const,
      data: {
        message: `Xin chào ${authUser.name}, bạn đã xác thực qua Cloudflare Access!`,
        user: {
          id: authUser.userId,
          email: authUser.email,
          name: authUser.name,
          role: authUser.role,
          isActive: true,
          createdAt: Math.floor(Date.now() / 1000),
        },
      },
    },
    200
  );
});
