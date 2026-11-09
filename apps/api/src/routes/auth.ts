import { OpenAPIHono } from "@hono/zod-openapi";
import { setCookie, getCookie } from "hono/cookie";
import { loginRoute, refreshRoute } from "../contracts/authContracts";
import { AuthService } from "../services/authService";
import { getJwtSecret, AppEnv } from "../middlewares/authMiddleware";
import { createRateLimiter } from "../middlewares/rateLimiter";
import { getContextRepos } from "../helpers/repoResolver";

export const authRouter = new OpenAPIHono<AppEnv>();

authRouter.use(
  "/login",
  createRateLimiter({
    max: 20,
    windowMs: 15 * 60 * 1000,
    message: "Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.",
  })
);

authRouter.openapi(loginRoute, async (c) => {
  const credentials = c.req.valid("json");
  const secret = getJwtSecret(c);
  const userRepo = getContextRepos(c).user;
  const result = await AuthService.login(credentials, secret, userRepo);

  if (!result.success) {
    return c.json({ success: false as const, error: result.error }, 401);
  }

  const isProduction =
    c.env?.NODE_ENV === "production" || c.env?.ENVIRONMENT === "production";

  setCookie(c, "refreshToken", result.data.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return c.json(
    {
      success: true as const,
      data: {
        accessToken: result.data.accessToken,
        user: result.data.user,
      },
    },
    200
  );
});

authRouter.openapi(refreshRoute, async (c) => {
  const refreshToken = getCookie(c, "refreshToken");
  if (!refreshToken) {
    return c.json(
      {
        success: false as const,
        error: "Missing refresh token in cookie",
      },
      401
    );
  }

  const secret = getJwtSecret(c);
  const userRepo = getContextRepos(c).user;
  const result = await AuthService.refresh(refreshToken, secret, userRepo);

  if (!result.success) {
    return c.json({ success: false as const, error: result.error }, 401);
  }

  const isProduction =
    c.env?.NODE_ENV === "production" || c.env?.ENVIRONMENT === "production";

  setCookie(c, "refreshToken", result.data.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return c.json(
    {
      success: true as const,
      data: {
        accessToken: result.data.accessToken,
      },
    },
    200
  );
});
