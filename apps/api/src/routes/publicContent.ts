import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { LandingContentSchema, FeaturedProjectSchema } from "@khangviet/types";
import { ErrorResponseSchema } from "../schemas/apiResponse";
import { defaultValidationHook } from "../middlewares/validationHook";
import { AppEnv } from "../middlewares/authMiddleware";
import { getContextRepos } from "../helpers/repoResolver";

export const publicContentRouter = new OpenAPIHono<AppEnv>({
  defaultHook: defaultValidationHook,
});

const getLandingRoute = createRoute({
  method: "get",
  path: "/landing",
  summary: "Lấy dữ liệu Landing Page",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: LandingContentSchema,
          }),
        },
      },
      description: "Thành công lấy nội dung landing page",
    },
  },
});

const getProjectsRoute = createRoute({
  method: "get",
  path: "/projects",
  summary: "Lấy danh sách các dự án tiêu biểu",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.array(FeaturedProjectSchema),
          }),
        },
      },
      description: "Thành công lấy danh sách dự án",
    },
  },
});

const getProjectByIdRoute = createRoute({
  method: "get",
  path: "/projects/{id}",
  summary: "Lấy chi tiết dự án theo ID",
  request: {
    params: z.object({
      id: z.string().min(1),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: FeaturedProjectSchema,
          }),
        },
      },
      description: "Chi tiết dự án tìm thấy",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Tham số không hợp lệ",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Không tìm thấy dự án",
    },
  },
});

publicContentRouter.openapi(getLandingRoute, async (c) => {
  const repos = getContextRepos(c);
  const data = await repos.cms.getLandingData();
  return c.json({ success: true as const, data }, 200);
});

publicContentRouter.openapi(getProjectsRoute, async (c) => {
  const repos = getContextRepos(c);
  const projects = await repos.cms.getProjects();
  return c.json({ success: true as const, data: projects }, 200);
});

publicContentRouter.openapi(getProjectByIdRoute, async (c) => {
  const repos = getContextRepos(c);
  const { id } = c.req.valid("param");
  const project = await repos.cms.getProjectById(id);

  if (!project) {
    return c.json(
      { success: false as const, error: `Project with id '${id}' not found` },
      404
    );
  }

  return c.json({ success: true as const, data: project }, 200);
});
