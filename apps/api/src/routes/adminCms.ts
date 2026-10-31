import { OpenAPIHono } from "@hono/zod-openapi";
import { getRepositories } from "@khangviet/repositories";
import { defaultValidationHook } from "../middlewares/validationHook";
import { handleCmsChange } from "./adminCmsHelper";
import {
  getSyncStatusRoute,
  getPendingChangesRoute,
  applyPendingChangesRoute,
  discardPendingChangeRoute,
} from "../contracts/adminCmsSyncContracts";
import {
  createProjectRoute,
  updateProjectRoute,
  deleteProjectRoute,
} from "../contracts/adminCmsProjectContracts";
import {
  updateHeroRoute,
  updateLegalRoute,
} from "../contracts/adminCmsMetaContracts";

export const adminCmsRouter = new OpenAPIHono({
  defaultHook: defaultValidationHook,
});

adminCmsRouter.openapi(getSyncStatusRoute, async (c) => {
  const status = await getRepositories().cms.getSyncStatus();
  return c.json({ success: true as const, data: status }, 200);
});

adminCmsRouter.openapi(getPendingChangesRoute, async (c) => {
  const list = await getRepositories().cms.getPendingChanges();
  return c.json({ success: true as const, data: list }, 200);
});

adminCmsRouter.openapi(applyPendingChangesRoute, async (c) => {
  const result = await getRepositories().cms.applyPendingChanges();
  if (result.appliedCount > 0) {
    const { triggerWebRevalidation } =
      await import("../services/revalidateNotifier");
    await triggerWebRevalidation({ tag: "cms-landing" });
  }
  const message =
    result.appliedCount > 0
      ? `Đã phát hành thành công ${result.appliedCount} thay đổi!`
      : "Không có thay đổi nào đang chờ (No pending changes).";
  return c.json({ success: true as const, data: result, message }, 200);
});

adminCmsRouter.openapi(discardPendingChangeRoute, async (c) => {
  const { id } = c.req.valid("param");
  const success = await getRepositories().cms.discardPendingChange(id);
  return c.json({ success }, 200);
});

adminCmsRouter.openapi(createProjectRoute, async (c) => {
  const body = c.req.valid("json");
  const res = await handleCmsChange(c, "CREATE_PROJECT", body);
  return c.json(
    { success: true as const, pending: res.isPending, data: res.result },
    200,
  );
});

adminCmsRouter.openapi(updateProjectRoute, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const res = await handleCmsChange(c, "UPDATE_PROJECT", body, id);
  if (!res) {
    return c.json({ success: false as const, error: "Project not found" }, 404);
  }
  return c.json(
    { success: true as const, pending: res.isPending, data: res.result },
    200,
  );
});

adminCmsRouter.openapi(deleteProjectRoute, async (c) => {
  const { id } = c.req.valid("param");
  const res = await handleCmsChange(c, "DELETE_PROJECT", {}, id);
  return c.json(
    { success: true as const, pending: res.isPending, data: res.result },
    200,
  );
});

adminCmsRouter.openapi(updateHeroRoute, async (c) => {
  const body = c.req.valid("json");
  const res = await handleCmsChange(c, "UPDATE_HERO", body.slides);
  return c.json(
    { success: true as const, pending: res.isPending, data: res.result },
    200,
  );
});

adminCmsRouter.openapi(updateLegalRoute, async (c) => {
  const body = c.req.valid("json");
  const res = await handleCmsChange(c, "UPDATE_LEGAL", body);
  return c.json(
    { success: true as const, pending: res.isPending, data: res.result },
    200,
  );
});
