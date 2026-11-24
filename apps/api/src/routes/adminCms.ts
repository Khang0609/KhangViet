import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  CreateProjectMediaDtoSchema,
  ProjectComparisonSchema,
  ProjectMediaSchema,
  ProjectSchema,
} from "@khangviet/types";
import { defaultValidationHook } from "../middlewares/validationHook";
import { AppEnv } from "../middlewares/authMiddleware";
import { getContextRepos } from "../helpers/repoResolver";
import { ErrorResponseSchema } from "../schemas/apiResponse";
import {
  createProjectRoute,
  updateProjectRoute,
  deleteProjectRoute,
} from "../contracts/adminCmsProjectContracts";
import {
  updateHeroRoute,
  updateLegalRoute,
  updateGalleryClustersRoute,
} from "../contracts/adminCmsMetaContracts";

export const adminCmsRouter = new OpenAPIHono<AppEnv>({
  defaultHook: defaultValidationHook,
});

const getAdminProjectsRoute = createRoute({
  method: "get",
  path: "/projects",
  summary: "Lấy toàn bộ dự án (bao gồm DRAFT/ARCHIVED) cho Admin",
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
      description: "Danh sách dự án Admin",
    },
  },
});

const addProjectMediaRoute = createRoute({
  method: "post",
  path: "/projects/{id}/media",
  summary: "Thêm ảnh/media cho dự án",
  request: {
    params: z.object({ id: z.string().trim().min(1) }),
    body: {
      content: {
        "application/json": { schema: CreateProjectMediaDtoSchema },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: ProjectMediaSchema,
          }),
        },
      },
      description: "Thêm media thành công",
    },
    404: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Không tìm thấy dự án",
    },
  },
});

const deleteProjectMediaRoute = createRoute({
  method: "delete",
  path: "/media/{mediaId}",
  summary: "Xóa media khỏi dự án",
  request: {
    params: z.object({ mediaId: z.string().trim().min(1) }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.object({ deleted: z.literal(true), mediaId: z.string() }),
          }),
        },
      },
      description: "Xóa media thành công",
    },
    404: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Không tìm thấy media",
    },
  },
});

const setProjectComparisonRoute = createRoute({
  method: "put",
  path: "/projects/{id}/comparison",
  summary: "Gán cặp ảnh 3D vs Thực tế cho dự án",
  request: {
    params: z.object({ id: z.string().trim().min(1) }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            renderMediaId: z.string().min(1),
            actualMediaId: z.string().min(1),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: ProjectComparisonSchema,
          }),
        },
      },
      description: "Cập nhật cặp so sánh thành công",
    },
  },
});

adminCmsRouter.openapi(getAdminProjectsRoute, async (c) => {
  const data = await getContextRepos(c).cms.getProjects({ includeDrafts: true });
  return c.json({ success: true as const, data }, 200);
});

adminCmsRouter.openapi(createProjectRoute, async (c) => {
  const body = c.req.valid("json");
  try {
    const data = await getContextRepos(c).cms.createProject(body);
    return c.json({ success: true as const, data }, 200);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("UNIQUE")) {
      return c.json(
        { success: false as const, error: "Đường dẫn (slug) dự án đã tồn tại" },
        409
      );
    }
    throw err;
  }
});

adminCmsRouter.openapi(updateProjectRoute, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  try {
    const data = await getContextRepos(c).cms.updateProject(id, body);
    if (!data) {
      return c.json(
        { success: false as const, error: `Project with id '${id}' not found` },
        404
      );
    }
    return c.json({ success: true as const, data }, 200);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("UNIQUE")) {
      return c.json(
        { success: false as const, error: "Đường dẫn (slug) dự án bị trùng" },
        409
      );
    }
    throw err;
  }
});

adminCmsRouter.openapi(deleteProjectRoute, async (c) => {
  const { id } = c.req.valid("param");
  const deleted = await getContextRepos(c).cms.deleteProject(id);
  if (!deleted) {
    return c.json(
      { success: false as const, error: `Project with id '${id}' not found` },
      404
    );
  }
  return c.json({ success: true as const, data: { deleted: true as const, id } }, 200);
});

adminCmsRouter.openapi(addProjectMediaRoute, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const cms = getContextRepos(c).cms;
  const project = await cms.getProjectById(id);
  if (!project) {
    return c.json(
      { success: false as const, error: `Project with id '${id}' not found` },
      404
    );
  }
  const data = await cms.addProjectMedia(id, body);
  return c.json({ success: true as const, data }, 200);
});

adminCmsRouter.openapi(deleteProjectMediaRoute, async (c) => {
  const { mediaId } = c.req.valid("param");
  const deleted = await getContextRepos(c).cms.deleteProjectMedia(mediaId);
  if (!deleted) {
    return c.json(
      { success: false as const, error: `Media '${mediaId}' not found` },
      404
    );
  }
  return c.json(
    { success: true as const, data: { deleted: true as const, mediaId } },
    200
  );
});

adminCmsRouter.openapi(setProjectComparisonRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { renderMediaId, actualMediaId } = c.req.valid("json");
  const data = await getContextRepos(c).cms.setProjectComparison(
    id,
    renderMediaId,
    actualMediaId
  );
  return c.json({ success: true as const, data }, 200);
});

adminCmsRouter.openapi(updateHeroRoute, async (c) => {
  const body = c.req.valid("json");
  const data = await getContextRepos(c).cms.updateHeroSlides(body.slides);
  return c.json({ success: true as const, pending: false, data }, 200);
});

adminCmsRouter.openapi(updateLegalRoute, async (c) => {
  const body = c.req.valid("json");
  const data = await getContextRepos(c).cms.updateLegalInfo(body);
  return c.json({ success: true as const, pending: false, data }, 200);
});

adminCmsRouter.openapi(updateGalleryClustersRoute, async (c) => {
  const { clusters } = c.req.valid("json");
  const data = await getContextRepos(c).cms.updateGalleryClusters(clusters);
  return c.json({ success: true as const, pending: false, data }, 200);
});
