import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultValidationHook } from "../middlewares/validationHook";
import { AppEnv } from "../middlewares/authMiddleware";
import { getContextRepos } from "../helpers/repoResolver";
import {
  createAdminOrganizationRoute,
  deleteAdminOrganizationRoute,
  getAdminOrganizationByIdRoute,
  getAdminOrganizationsRoute,
  updateAdminOrganizationRoute,
} from "../contracts/adminOrganizationContracts";

export const adminOrganizationsRouter = new OpenAPIHono<AppEnv>({
  defaultHook: defaultValidationHook,
});

adminOrganizationsRouter.openapi(getAdminOrganizationsRoute, async (c) => {
  const data = await getContextRepos(c).cms.getOrganizations();
  return c.json({ success: true as const, data }, 200);
});

adminOrganizationsRouter.openapi(getAdminOrganizationByIdRoute, async (c) => {
  const { id } = c.req.valid("param");
  const org = await getContextRepos(c).cms.getOrganizationById(id);
  if (!org) {
    return c.json(
      { success: false as const, error: `Organization '${id}' not found` },
      404
    );
  }
  return c.json({ success: true as const, data: org }, 200);
});

adminOrganizationsRouter.openapi(createAdminOrganizationRoute, async (c) => {
  const body = c.req.valid("json");
  try {
    const data = await getContextRepos(c).cms.createOrganization(body);
    return c.json({ success: true as const, data }, 200);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("UNIQUE")) {
      return c.json(
        { success: false as const, error: "Slug đối tác đã tồn tại" },
        409
      );
    }
    throw err;
  }
});

adminOrganizationsRouter.openapi(updateAdminOrganizationRoute, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  try {
    const data = await getContextRepos(c).cms.updateOrganization(id, body);
    if (!data) {
      return c.json(
        { success: false as const, error: `Organization '${id}' not found` },
        404
      );
    }
    return c.json({ success: true as const, data }, 200);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("UNIQUE")) {
      return c.json(
        { success: false as const, error: "Slug đối tác bị trùng" },
        409
      );
    }
    throw err;
  }
});

adminOrganizationsRouter.openapi(deleteAdminOrganizationRoute, async (c) => {
  const { id } = c.req.valid("param");
  const deleted = await getContextRepos(c).cms.deleteOrganization(id);
  if (!deleted) {
    return c.json(
      { success: false as const, error: `Organization '${id}' not found` },
      404
    );
  }
  return c.json(
    { success: true as const, data: { deleted: true as const, id } },
    200
  );
});
