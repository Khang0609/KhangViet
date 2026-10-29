import { Hono } from "hono";
import { getRepositories } from "@khangviet/repositories";
import { handleCmsChange } from "./adminCmsHelper";

export const adminCmsRouter = new Hono();

// Status: Kiểm tra giờ và các thay đổi đang pending
adminCmsRouter.get("/sync-status", async (c) => {
  const repos = getRepositories();
  const status = await repos.cms.getSyncStatus();
  return c.json({ success: true, data: status });
});

// Danh sách các thay đổi đang pending
adminCmsRouter.get("/pending", async (c) => {
  const repos = getRepositories();
  const list = await repos.cms.getPendingChanges();
  return c.json({ success: true, data: list });
});

// Thực thi áp dụng các pending changes (chỉ chạy khi có thay đổi)
adminCmsRouter.post("/apply-pending", async (c) => {
  const repos = getRepositories();
  const result = await repos.cms.applyPendingChanges();
  if (result.appliedCount > 0) {
    const { triggerWebRevalidation } = await import("../services/revalidateNotifier");
    await triggerWebRevalidation({ tag: "cms-landing" });
  }
  return c.json({
    success: true,
    data: result,
    message: result.appliedCount > 0 
      ? `Đã phát hành thành công ${result.appliedCount} thay đổi!` 
      : "Không có thay đổi nào đang chờ (No pending changes).",
  });
});

// Hủy một pending change
adminCmsRouter.delete("/pending/:id", async (c) => {
  const repos = getRepositories();
  const id = c.req.param("id");
  const success = await repos.cms.discardPendingChange(id);
  return c.json({ success });
});

// Thêm dự án
adminCmsRouter.post("/projects", async (c) => {
  const body = await c.req.json();
  const res = await handleCmsChange(c, "CREATE_PROJECT", body);
  return c.json({ success: true, pending: res.isPending, data: res.result });
});

// Sửa dự án
adminCmsRouter.put("/projects/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const res = await handleCmsChange(c, "UPDATE_PROJECT", body, id);
  return c.json({ success: true, pending: res.isPending, data: res.result });
});

// Xóa dự án
adminCmsRouter.delete("/projects/:id", async (c) => {
  const id = c.req.param("id");
  const res = await handleCmsChange(c, "DELETE_PROJECT", {}, id);
  return c.json({ success: true, pending: res.isPending, data: res.result });
});

// Sửa hero slides
adminCmsRouter.put("/hero", async (c) => {
  const body = await c.req.json();
  const res = await handleCmsChange(c, "UPDATE_HERO", body.slides);
  return c.json({ success: true, pending: res.isPending, data: res.result });
});

// Sửa legal
adminCmsRouter.put("/legal", async (c) => {
  const body = await c.req.json();
  const res = await handleCmsChange(c, "UPDATE_LEGAL", body);
  return c.json({ success: true, pending: res.isPending, data: res.result });
});
