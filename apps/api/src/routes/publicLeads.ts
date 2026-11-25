import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { CreateLeadDtoSchema, LeadSchema } from "@khangviet/types";
import { ErrorResponseSchema } from "../schemas/apiResponse";
import { defaultValidationHook } from "../middlewares/validationHook";
import { createRateLimiter } from "../middlewares/rateLimiter";
import { AppEnv } from "../middlewares/authMiddleware";
import { getContextRepos } from "../helpers/repoResolver";
import { notifyNewLead } from "../services/leadNotifier";

export const publicLeadsRouter = new OpenAPIHono<AppEnv>({
  defaultHook: defaultValidationHook,
});

publicLeadsRouter.use(
  "*",
  createRateLimiter({
    max: 20,
    windowMs: 60 * 1000,
    message: "Quá nhiều yêu cầu đăng ký tư vấn. Vui lòng thử lại sau.",
  })
);

const createLeadRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Gửi thông tin liên hệ / đăng ký tư vấn",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateLeadDtoSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: LeadSchema,
            message: z.string(),
          }),
        },
      },
      description: "Tạo lead thành công",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Dữ liệu không hợp lệ",
    },
  },
});

publicLeadsRouter.openapi(createLeadRoute, async (c) => {
  const body = c.req.valid("json");
  const repos = getContextRepos(c);
  const newLead = await repos.lead.createLead(body);

  await notifyNewLead(newLead, c.env);

  return c.json(
    {
      success: true as const,
      data: newLead,
      message: "Cảm ơn bạn! Thông tin liên hệ đã được ghi nhận.",
    },
    201
  );
});
