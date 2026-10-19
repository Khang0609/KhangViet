import { Hono } from "hono";
import { getRepositories } from "@khangviet/repositories";

export const publicContentRouter = new Hono();

// GET /api/v1/content/landing - Trả về toàn bộ nội dung landing page
publicContentRouter.get("/landing", async (c) => {
  const repos = getRepositories();
  const data = await repos.cms.getLandingData();
  return c.json({
    success: true,
    data,
  });
});

// GET /api/v1/content/projects - Trả về danh sách dự án
publicContentRouter.get("/projects", async (c) => {
  const repos = getRepositories();
  const projects = await repos.cms.getProjects();
  return c.json({
    success: true,
    data: projects,
  });
});

// GET /api/v1/content/projects/:id - Trả về chi tiết 1 dự án
publicContentRouter.get("/projects/:id", async (c) => {
  const repos = getRepositories();
  const id = c.req.param("id");
  const project = await repos.cms.getProjectById(id);

  if (!project) {
    return c.json(
      {
        success: false,
        error: `Project with id '${id}' not found`,
      },
      404
    );
  }

  return c.json({
    success: true,
    data: project,
  });
});

