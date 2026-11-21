import { OpenAPIHono } from "@hono/zod-openapi";
import { protectedRoute } from "../contracts/protectedContracts";
import { authMiddleware, AppEnv } from "../middlewares/authMiddleware";
import { getContextRepos } from "../helpers/repoResolver";

export const protectedRouter = new OpenAPIHono<AppEnv>();

protectedRouter.use("/protected", authMiddleware);

protectedRouter.openapi(protectedRoute, async (c) => {
  const authPayload = c.get("authUser");
  const userRepo = getContextRepos(c).user;
  const user = await userRepo.findSafeById(authPayload.userId);

  if (!user) {
    return c.json(
      { success: false as const, error: "Tài khoản không tồn tại" },
      401
    );
  }

  return c.json(
    {
      success: true as const,
      data: {
        message: `Xin chào ${user.info.name}, bạn đã xác thực thành công!`,
        user,
      },
    },
    200
  );
});
