import { createRoute, z } from "@hono/zod-openapi";
import { HeroSlideSchema, CompanyLegalInfoSchema } from "@khangviet/types";

const MetaMutationResponse = z.object({
  success: z.literal(true),
  pending: z.boolean(),
  data: z.unknown(),
});

export const updateHeroRoute = createRoute({
  method: "put",
  path: "/hero",
  summary: "Cập nhật slide Hero",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ slides: z.array(HeroSlideSchema) }),
        },
      },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: MetaMutationResponse } },
      description: "Cập nhật hero slides thành công",
    },
  },
});

export const updateLegalRoute = createRoute({
  method: "put",
  path: "/legal",
  summary: "Cập nhật thông tin pháp lý công ty",
  request: {
    body: {
      content: { "application/json": { schema: CompanyLegalInfoSchema } },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: MetaMutationResponse } },
      description: "Cập nhật legal info thành công",
    },
  },
});

