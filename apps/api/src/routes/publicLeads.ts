import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getRepositories } from "@khangviet/repositories";
import { CreateLeadDtoSchema, ContactLeadSchema } from "@khangviet/types";
import { ErrorResponseSchema } from "../schemas/apiResponse";
import { defaultValidationHook } from "../middlewares/validationHook";

export const publicLeadsRouter = new OpenAPIHono({
  defaultHook: defaultValidationHook,
});

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
            data: ContactLeadSchema,
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
  if (!body || !body.fullName || !body.phone) {
    return c.json(
      { success: false as const, error: "Họ tên và số điện thoại là bắt buộc" },
      400
    );
  }

  const repos = getRepositories();
  const newLead = await repos.lead.createLead({
    fullName: body.fullName.trim(),
    phone: body.phone.trim(),
    email: body.email?.trim() || undefined,
    serviceCategory: body.serviceCategory?.trim() || undefined,
    projectScale: body.projectScale?.trim() || undefined,
    message: body.message?.trim() || undefined,
  });

  return c.json(
    {
      success: true as const,
      data: newLead,
      message: "Cảm ơn bạn! Thông tin liên hệ đã được ghi nhận.",
    },
    201
  );
});
