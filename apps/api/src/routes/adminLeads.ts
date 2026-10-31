import { OpenAPIHono } from "@hono/zod-openapi";
import { getRepositories } from "@khangviet/repositories";
import { defaultValidationHook } from "../middlewares/validationHook";
import {
  getAdminLeadsRoute,
  getAdminLeadByIdRoute,
} from "../contracts/adminLeadsContracts";
import {
  updateAdminLeadStatusRoute,
  deleteAdminLeadRoute,
} from "../contracts/adminLeadsStatusContracts";

export const adminLeadsRouter = new OpenAPIHono({
  defaultHook: defaultValidationHook,
});

adminLeadsRouter.openapi(getAdminLeadsRoute, async (c) => {
  const { status, search } = c.req.valid("query");
  const repos = getRepositories();
  const leads = await repos.lead.getLeads({ status, search });
  return c.json({ success: true as const, data: leads }, 200);
});

adminLeadsRouter.openapi(getAdminLeadByIdRoute, async (c) => {
  const { id } = c.req.valid("param");
  const repos = getRepositories();
  const lead = await repos.lead.getLeadById(id);
  if (!lead) {
    return c.json({ success: false as const, error: "Lead not found" }, 404);
  }
  return c.json({ success: true as const, data: lead }, 200);
});

adminLeadsRouter.openapi(updateAdminLeadStatusRoute, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  if (!body || !body.status) {
    return c.json(
      { success: false as const, error: "Trường 'status' là bắt buộc" },
      400,
    );
  }

  const { status, notes } = body;
  const repos = getRepositories();
  const updated = await repos.lead.updateLeadStatus(id, status, notes);
  if (!updated) {
    return c.json({ success: false as const, error: "Lead not found" }, 404);
  }
  return c.json({ success: true as const, data: updated }, 200);
});

adminLeadsRouter.openapi(deleteAdminLeadRoute, async (c) => {
  const { id } = c.req.valid("param");
  const repos = getRepositories();
  const deleted = await repos.lead.deleteLead(id);
  return c.json({ success: deleted }, 200);
});
