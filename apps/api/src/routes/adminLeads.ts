import { Hono } from "hono";
import { getRepositories } from "@khangviet/repositories";
import type { LeadFilter, LeadStatus } from "@khangviet/types";

export const adminLeadsRouter = new Hono();

// GET /api/v1/admin/leads - Danh sách leads CRM
adminLeadsRouter.get("/", async (c) => {
  const status = c.req.query("status") as LeadStatus | undefined;
  const search = c.req.query("search");
  const repos = getRepositories();
  const leads = await repos.lead.getLeads({ status, search });
  return c.json({ success: true, data: leads });
});

// GET /api/v1/admin/leads/:id - Chi tiết lead
adminLeadsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const repos = getRepositories();
  const lead = await repos.lead.getLeadById(id);
  if (!lead) {
    return c.json({ success: false, error: "Lead not found" }, 404);
  }
  return c.json({ success: true, data: lead });
});

// PATCH /api/v1/admin/leads/:id/status - Cập nhật trạng thái xử lý lead
adminLeadsRouter.patch("/:id/status", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ status: LeadStatus; notes?: string }>();
  if (!body.status) {
    return c.json({ success: false, error: "Status is required" }, 400);
  }
  const repos = getRepositories();
  const updated = await repos.lead.updateLeadStatus(id, body.status, body.notes);
  return c.json({ success: true, data: updated });
});

// DELETE /api/v1/admin/leads/:id - Xóa lead
adminLeadsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const repos = getRepositories();
  const deleted = await repos.lead.deleteLead(id);
  return c.json({ success: deleted });
});

