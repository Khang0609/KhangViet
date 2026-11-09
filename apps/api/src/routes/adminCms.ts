import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultValidationHook } from "../middlewares/validationHook";
import { handleCmsChange } from "./adminCmsHelper";
import { AppEnv } from "../middlewares/authMiddleware";
import { getContextRepos } from "../helpers/repoResolver";
import {
  getSyncStatusRoute, getPendingChangesRoute,
  applyPendingChangesRoute, discardPendingChangeRoute,
} from "../contracts/adminCmsSyncContracts";
import {
  createProjectRoute, updateProjectRoute, deleteProjectRoute,
} from "../contracts/adminCmsProjectContracts";
import { updateHeroRoute, updateLegalRoute } from "../contracts/adminCmsMetaContracts";

export const adminCmsRouter = new OpenAPIHono<AppEnv>({
  defaultHook: defaultValidationHook,
});

adminCmsRouter.openapi(getSyncStatusRoute, async (c) => {
  return c.json({ success: true as const, data: await getContextRepos(c).cms.getSyncStatus() }, 200);
});

adminCmsRouter.openapi(getPendingChangesRoute, async (c) => {
  return c.json({ success: true as const, data: await getContextRepos(c).cms.getPendingChanges() }, 200);
});

adminCmsRouter.openapi(applyPendingChangesRoute, async (c) => {
  const result = await getContextRepos(c).cms.applyPendingChanges();
  if (result.appliedCount > 0) {
    const { triggerWebRevalidation } = await import("../services/revalidateNotifier");
    await triggerWebRevalidation({ tag: "cms-landing" }, c.env);
  }
  const message = result.appliedCount > 0
    ? `Đã phát hành thành công ${result.appliedCount} thay đổi!`
    : "Không có thay đổi nào đang chờ (No pending changes).";
  return c.json({ success: true as const, data: result, message }, 200);
});

adminCmsRouter.openapi(discardPendingChangeRoute, async (c) => {
  const { id } = c.req.valid("param");
  return c.json({ success: await getContextRepos(c).cms.discardPendingChange(id) }, 200);
});

adminCmsRouter.openapi(createProjectRoute, async (c) => {
  const body = c.req.valid("json");
  const res = await handleCmsChange(c, "CREATE_PROJECT", body);
  return c.json({ success: true as const, pending: res.isPending, data: res.result }, 200);
});

adminCmsRouter.openapi(updateProjectRoute, async (c) => {
  const { id } = c.req.valid("param");
  const res = await handleCmsChange(c, "UPDATE_PROJECT", c.req.valid("json"), id);
  if (!res) return c.json({ success: false as const, error: "Project not found" }, 404);
  return c.json({ success: true as const, pending: res.isPending, data: res.result }, 200);
});

adminCmsRouter.openapi(deleteProjectRoute, async (c) => {
  const { id } = c.req.valid("param");
  const res = await handleCmsChange(c, "DELETE_PROJECT", {}, id);
  return c.json({ success: true as const, pending: res.isPending, data: res.result }, 200);
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
