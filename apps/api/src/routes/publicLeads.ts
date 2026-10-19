import { Hono } from "hono";
import { getRepositories } from "@khangviet/repositories";
import type { CreateLeadDto } from "@khangviet/types";

export const publicLeadsRouter = new Hono();

// POST /api/v1/leads - Nhận form liên hệ từ Landing Page
publicLeadsRouter.post("/", async (c) => {
  const body = await c.req.json<CreateLeadDto>();

  if (!body.fullName || !body.phone) {
    return c.json(
      {
        success: false,
        error: "Họ tên và số điện thoại là bắt buộc",
      },
      400
    );
  }

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
      success: true,
      data: newLead,
      message: "Cảm ơn bạn đã liên hệ! Khang Việt sẽ phản hồi sớm nhất.",
    },
    201
  );
});

