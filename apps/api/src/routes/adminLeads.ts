import { OpenAPIHono } from "@hono/zod-openapi";
import { defaultValidationHook } from "../middlewares/validationHook";
import { AppEnv } from "../middlewares/authMiddleware";
import { getContextRepos } from "../helpers/repoResolver";
import {
  addAdminLeadActivityRoute,
  getAdminLeadByIdRoute,
  getAdminLeadsRoute,
} from "../contracts/adminLeadsContracts";
import {
  updateAdminLeadStatusRoute,
  deleteAdminLeadRoute,
} from "../contracts/adminLeadsStatusContracts";

export const adminLeadsRouter = new OpenAPIHono<AppEnv>({
  defaultHook: defaultValidationHook,
});

adminLeadsRouter.openapi(getAdminLeadsRoute, async (c) => {
  const { status, search } = c.req.valid("query");
  const leads = await getContextRepos(c).lead.getLeads({ status, search });
  return c.json({ success: true as const, data: leads }, 200);
});

adminLeadsRouter.openapi(getAdminLeadByIdRoute, async (c) => {
  const { id } = c.req.valid("param");
  const lead = await getContextRepos(c).lead.getLeadById(id);
  if (!lead) {
    return c.json({ success: false as const, error: "Lead not found" }, 404);
  }
  return c.json({ success: true as const, data: lead }, 200);
});

adminLeadsRouter.openapi(addAdminLeadActivityRoute, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const authUser = c.get("authUser");
  const activity = await getContextRepos(c).lead.addLeadActivity(
    id,
    body,
    authUser?.userId
  );
  if (!activity) {
    return c.json({ success: false as const, error: "Lead not found" }, 404);
  }
  return c.json({ success: true as const, data: activity }, 200);
});

adminLeadsRouter.openapi(updateAdminLeadStatusRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { status, note } = c.req.valid("json");
  const authUser = c.get("authUser");
  const updated = await getContextRepos(c).lead.updateLeadStatus(
    id,
    status,
    note,
    authUser?.userId
  );
  if (!updated) {
    return c.json({ success: false as const, error: "Lead not found" }, 404);
  }
  return c.json({ success: true as const, data: updated }, 200);
});

adminLeadsRouter.openapi(deleteAdminLeadRoute, async (c) => {
  const { id } = c.req.valid("param");
  const deleted = await getContextRepos(c).lead.deleteLead(id);
  return c.json({ success: deleted }, 200);
});
