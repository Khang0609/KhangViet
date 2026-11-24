import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  LandingContentSchema,
  OrganizationSchema,
  ProjectGalleryResponseSchema,
  ProjectSchema,
  ServiceSchema,
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

const getGalleryRoute = createRoute({
  method: "get",
  path: "/gallery",
  summary: "Lấy dữ liệu Project Gallery kèm bộ lọc theo dịch vụ / đối tác",
  request: {
    query: z.object({
      serviceSlug: z.string().optional(),
      organizationSlug: z.string().optional(),
      search: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: ProjectGalleryResponseSchema,
          }),
        },
      },
      description: "Thành công lấy dữ liệu Project Gallery",
    },
  },
});

const getProjectsRoute = createRoute({
  method: "get",
  path: "/projects",
  summary: "Lấy danh sách dự án đã xuất bản",
  request: {
    query: z.object({
      organizationId: z.string().optional(),
      serviceId: z.string().optional(),
      search: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.array(ProjectSchema),
          }),
        },
      },
      description: "Danh sách dự án",
    },
  },
});

const getProjectBySlugRoute = createRoute({
  method: "get",
  path: "/projects/{slug}",
  summary: "Lấy chi tiết dự án theo slug hoặc ID",
  request: {
    params: z.object({
      slug: z.string().trim().min(1),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: ProjectSchema,
          }),
        },
      },
      description: "Chi tiết dự án",
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

const getServicesRoute = createRoute({
  method: "get",
  path: "/services",
  summary: "Lấy danh sách dịch vụ",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.array(ServiceSchema),
          }),
        },
      },
      description: "Danh sách dịch vụ",
    },
  },
});

const getOrganizationsRoute = createRoute({
  method: "get",
  path: "/organizations",
  summary: "Lấy danh sách đối tác",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.array(OrganizationSchema),
          }),
        },
      },
      description: "Danh sách đối tác",
    },
  },
});

publicContentRouter.openapi(getLandingRoute, async (c) => {
  const data = await getContextRepos(c).cms.getLandingData();
  return c.json({ success: true as const, data }, 200);
});

publicContentRouter.openapi(getGalleryRoute, async (c) => {
  const query = c.req.valid("query");
  const data = await getContextRepos(c).cms.getGalleryData(query);
  return c.json({ success: true as const, data }, 200);
});

publicContentRouter.openapi(getProjectsRoute, async (c) => {
  const query = c.req.valid("query");
  const data = await getContextRepos(c).cms.getProjects({
    includeDrafts: false,
    ...query,
  });
  return c.json({ success: true as const, data }, 200);
});

publicContentRouter.openapi(getProjectBySlugRoute, async (c) => {
  const { slug } = c.req.valid("param");
  const cms = getContextRepos(c).cms;
  const project =
    (await cms.getProjectBySlug(slug, false)) ?? (await cms.getProjectById(slug));

  if (!project || project.publishStatus !== "PUBLISHED") {
    return c.json(
      { success: false as const, error: `Project '${slug}' not found` },
      404
    );
  }

  return c.json({ success: true as const, data: project }, 200);
});

publicContentRouter.openapi(getServicesRoute, async (c) => {
  const data = await getContextRepos(c).cms.getServices();
  return c.json({ success: true as const, data }, 200);
});

publicContentRouter.openapi(getOrganizationsRoute, async (c) => {
  const data = await getContextRepos(c).cms.getOrganizations();
  return c.json({ success: true as const, data }, 200);
});
