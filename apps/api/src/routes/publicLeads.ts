import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { getRepositories } from "@khangviet/repositories";
import { CreateLeadDtoSchema, ContactLeadSchema } from "@khangviet/types";
import { ErrorResponseSchema } from "../schemas/apiResponse";

export const publicLeadsRouter = new OpenAPIHono();

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
  const repos = getRepositories();

  const newLead = await repos.lead.createLead({
    fullName: body.fullName.trim(),
    phone: body.phone.trim(),
    email: body.email?.trim(),
    serviceCategory: body.serviceCategory,
    projectScale: body.projectScale,
    message: body.message?.trim(),
  });

  return c.json(
    {
      success: true as const,
      data: newLead,
      message: "Cảm ơn bạn đã liên hệ! Khang Việt sẽ phản hồi sớm nhất.",
    },
    201
  );
});
