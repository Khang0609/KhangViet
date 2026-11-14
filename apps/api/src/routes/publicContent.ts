import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  LandingContentSchema,
  FeaturedProjectSchema,
  ProjectDetailSchema,
  ProjectListQuerySchema,
  PaginationMetaSchema,
  GalleryApiResponseSchema,
} from "@khangviet/types";
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
  summary: "Lấy dữ liệu Landing Page từ Curated Placements",
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

const getGalleryRoute = createRoute({
  method: "get",
  path: "/gallery",
  summary: "Lấy dữ liệu trang Project Gallery kèm bộ lọc đa chiều và phân trang",
  request: {
    query: ProjectListQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: GalleryApiResponseSchema,
          }),
        },
      },
      description: "Thành công lấy dữ liệu Project Gallery",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Tham số truy vấn lọc/phân trang không hợp lệ",
    },
  },
});

const getProjectsRoute = createRoute({
  method: "get",
  path: "/projects",
  summary: "Lấy danh sách các dự án có lọc và phân trang",
  request: {
    query: ProjectListQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              items: z.array(FeaturedProjectSchema),
              pagination: PaginationMetaSchema,
            }),
          }),
        },
      },
      description: "Thành công lấy danh sách dự án",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Tham số truy vấn không hợp lệ",
    },
  },
});

const getProjectByIdRoute = createRoute({
  method: "get",
  path: "/projects/{id}",
  summary: "Lấy chi tiết dự án theo ID kèm media và comparisonPairs",
  request: {
    params: z.object({
      id: z.string().trim().min(1, "ID dự án không được để trống"),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: ProjectDetailSchema,
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
      description: "Tham số ID không hợp lệ",
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

publicContentRouter.openapi(getGalleryRoute, async (c) => {
  const repos = getContextRepos(c);
  const query = c.req.valid("query");
  const data = await repos.cms.getGalleryData(query);
  return c.json({ success: true as const, data }, 200);
});

publicContentRouter.openapi(getProjectsRoute, async (c) => {
  const repos = getContextRepos(c);
  const query = c.req.valid("query");
  const data = await repos.cms.queryProjects(query);
  return c.json({ success: true as const, data }, 200);
});

publicContentRouter.openapi(getProjectByIdRoute, async (c) => {
  const repos = getContextRepos(c);
  const { id } = c.req.valid("param");
  const project = await repos.cms.getProjectDetailById(id);

  if (!project) {
    return c.json(
      { success: false as const, error: `Project with id '${id}' not found` },
      404
    );
  }

  return c.json({ success: true as const, data: project }, 200);
});
