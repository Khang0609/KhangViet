import test from "node:test";
import assert from "node:assert/strict";
import { getRepositories } from "../src/factory";
import { resetStore } from "../src/json/store";

test("Schema v2 Repositories: Organizations, Projects, Services, Media, Comparisons", async () => {
  resetStore();
  const repos = getRepositories("json");

  const org = await repos.cms.createOrganization({
    name: "The Coffee House",
    description: "Chuỗi F&B",
    isFeatured: true,
    featuredOrder: 1,
  });
  assert.ok(org.id);
  assert.ok(org.slug.startsWith("the-coffee-house"));

  const services = await repos.cms.getServices();
  assert.ok(services.length > 0);

  const project = await repos.cms.createProject({
    title: "Showroom Quận 1",
    summary: "Thiết kế và thi công trọn gói",
    organizationId: org.id,
    year: 2026,
    publishStatus: "PUBLISHED",
    isFeatured: true,
    featuredOrder: 0,
    serviceIds: [services[0].id],
  });
  assert.equal(project.organization?.id, org.id);
  assert.equal(project.services?.length, 1);

  const renderMedia = await repos.cms.addProjectMedia(project.id, {
    kind: "RENDER",
    storageKey: "https://example.com/render.jpg",
    sortOrder: 0,
    isCover: false,
  });
  const actualMedia = await repos.cms.addProjectMedia(project.id, {
    kind: "ACTUAL",
    storageKey: "https://example.com/actual.jpg",
    sortOrder: 1,
    isCover: true,
  });

  await repos.cms.setProjectComparison(project.id, renderMedia.id, actualMedia.id);

  const fetched = await repos.cms.getProjectBySlug(project.slug);
  assert.ok(fetched);
  assert.equal(fetched.media?.length, 2);
  assert.equal(fetched.comparisons?.length, 1);
  assert.equal(fetched.comparisons?.[0].renderMediaId, renderMedia.id);

  const gallery = await repos.cms.getGalleryData({ organizationSlug: org.slug });
  assert.equal(gallery.projects.length, 1);
  assert.equal(gallery.projects[0].coverMedia?.id, actualMedia.id);
});

test("Schema v2 Repositories: Leads, LeadActivities, Users", async () => {
  resetStore();
  const repos = getRepositories("json");

  const user = await repos.user.createUser({
    email: "staff@khangviet.vn",
    name: "Nhân viên Tư vấn",
    role: "STAFF",
    isActive: true,
  });
  const foundUser = await repos.user.findByEmail("STAFF@khangviet.vn");
  assert.equal(foundUser?.id, user.id);

  const lead = await repos.lead.createLead({
    name: "Nguyễn Văn A",
    phone: "0901234567",
    email: "a@example.com",
    companyName: "Công ty A",
  });
  assert.equal(lead.status, "NEW");

  const updated = await repos.lead.updateLeadStatus(
    lead.id,
    "CONTACTED",
    "Đã gọi tư vấn",
    user.id
  );
  assert.equal(updated?.status, "CONTACTED");

  const detail = await repos.lead.getLeadById(lead.id);
  assert.equal(detail?.activities.length, 1);
  assert.equal(detail?.activities[0].userId, user.id);
});
