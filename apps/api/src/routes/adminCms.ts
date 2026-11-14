import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultValidationHook } from "../middlewares/validationHook";
import { handleCmsChange } from "./adminCmsHelper";
import { AppEnv } from "../middlewares/authMiddleware";
import { getContextRepos } from "../helpers/repoResolver";
import {
  createProjectRoute,
  updateProjectRoute,
  deleteProjectRoute,
} from "../contracts/adminCmsProjectContracts";
import {
  updateHeroRoute,
  updateLegalRoute,
} from "../contracts/adminCmsMetaContracts";
import {
  getPlacementsRoute,
  upsertPlacementRoute,
  deletePlacementRoute,
} from "../contracts/adminCmsPlacementContracts";

export const adminCmsRouter = new OpenAPIHono<AppEnv>({
  defaultHook: defaultValidationHook,
});

adminCmsRouter.openapi(createProjectRoute, async (c) => {
  const body = c.req.valid("json");
  const res = await handleCmsChange(c, "CREATE_PROJECT", body);
  return c.json({ success: true as const, pending: res.isPending, data: res.result }, 200);
});

adminCmsRouter.openapi(updateProjectRoute, async (c) => {
  const { id } = c.req.valid("param");
  const res = await handleCmsChange(c, "UPDATE_PROJECT", c.req.valid("json"), id);
  if (!res) {
    return c.json({ success: false as const, error: `Project with id '${id}' not found` }, 404);
  }
  return c.json({ success: true as const, pending: res.isPending, data: res.result }, 200);
});

adminCmsRouter.openapi(deleteProjectRoute, async (c) => {
  const { id } = c.req.valid("param");
  const res = await handleCmsChange(c, "DELETE_PROJECT", {}, id);
  if (!res.result) {
    return c.json({ success: false as const, error: `Project with id '${id}' not found` }, 404);
  }
  return c.json({ success: true as const, pending: res.isPending, data: res.result }, 200);
});

adminCmsRouter.openapi(getPlacementsRoute, async (c) => {
  const { slotType } = c.req.valid("query");
  const data = await getContextRepos(c).cms.getPlacements(slotType);
  return c.json({ success: true as const, data }, 200);
});

adminCmsRouter.openapi(upsertPlacementRoute, async (c) => {
  const body = c.req.valid("json");
  const data = await getContextRepos(c).cms.upsertPlacement(body);
  return c.json({ success: true as const, data }, 200);
});

adminCmsRouter.openapi(deletePlacementRoute, async (c) => {
  const { id } = c.req.valid("param");
  const deleted = await getContextRepos(c).cms.deletePlacement(id);
  if (!deleted) {
    return c.json({ success: false as const, error: `Placement with id '${id}' not found` }, 404);
  }
  return c.json({ success: true as const, data: { deleted: true as const, id } }, 200);
});

adminCmsRouter.openapi(updateHeroRoute, async (c) => {
  const body = c.req.valid("json");
  const res = await handleCmsChange(c, "UPDATE_HERO", body.slides);
  return c.json({ success: true as const, pending: res.isPending, data: res.result }, 200);
});

adminCmsRouter.openapi(updateLegalRoute, async (c) => {
  const res = await handleCmsChange(c, "UPDATE_LEGAL", c.req.valid("json"));
  return c.json({ success: true as const, pending: res.isPending, data: res.result }, 200);
});
