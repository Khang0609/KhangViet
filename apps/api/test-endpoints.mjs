import assert from "node:assert/strict";
import worker from "./dist/index.js";

const app = worker;

async function json(res) {
  return await res.json();
}

async function runTests() {
  console.log("=== BẮT ĐẦU TEST ENDPOINTS SCHEMA V2 (JSON REPOSITORY) ===");

  // 1. Public Landing
  const landingRes = await app.request("/api/v1/content/landing");
  assert.equal(landingRes.status, 200);
  const landingBody = await json(landingRes);
  assert.equal(landingBody.success, true);
  assert.ok(Array.isArray(landingBody.data.heroSlides));
  assert.ok(Array.isArray(landingBody.data.featuredOrganizations));
  assert.ok(Array.isArray(landingBody.data.featuredProjects));
  console.log("✓ 1. GET /api/v1/content/landing (200 OK)");

  // 2. Public Gallery & Services & Organizations
  const galleryRes = await app.request("/api/v1/content/gallery");
  assert.equal(galleryRes.status, 200);
  const galleryBody = await json(galleryRes);
  assert.equal(galleryBody.success, true);
  assert.ok(Array.isArray(galleryBody.data.services) && galleryBody.data.services.length > 0);
  assert.ok(Array.isArray(galleryBody.data.organizations));
  assert.ok(Array.isArray(galleryBody.data.projects) && galleryBody.data.projects.length > 0);
  console.log("✓ 2. GET /api/v1/content/gallery (200 OK)");

  // 3. Public Project Detail by slug
  const firstSlug = galleryBody.data.projects[0].slug;
  const detailRes = await app.request(`/api/v1/content/projects/${firstSlug}`);
  assert.equal(detailRes.status, 200);
  const detailBody = await json(detailRes);
  assert.equal(detailBody.data.slug, firstSlug);
  assert.ok(Array.isArray(detailBody.data.media));
  console.log("✓ 3. GET /api/v1/content/projects/:slug (200 OK)");

  // 4. Not Found -> 404
  const notFoundRes = await app.request("/api/v1/content/projects/non-existent-slug-999");
  assert.equal(notFoundRes.status, 404);
  console.log("✓ 4. GET /api/v1/content/projects/:slug unknown -> 404");

  // 5. Public Lead Creation + Validation
  const badLeadRes = await app.request("/api/v1/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "", phone: "123" }),
  });
  assert.equal(badLeadRes.status, 400);

  const createLeadRes = await app.request("/api/v1/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Khách Hàng Test",
      phone: "0909123456",
      email: "khach@example.com",
      companyName: "Công ty Test",
      message: "Cần tư vấn bảng hiệu",
    }),
  });
  assert.equal(createLeadRes.status, 201);
  const leadBody = await json(createLeadRes);
  const leadId = leadBody.data.id;
  console.log("✓ 5. POST /api/v1/leads (201 Created & 400 Validation)");

  // 6. Admin Organizations CRUD (local dev bypass)
  const createOrgRes = await app.request("/api/v1/admin/organizations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Đối Tác Mới",
      slug: "doi-tac-moi",
      isFeatured: true,
      featuredOrder: 2,
    }),
  });
  assert.equal(createOrgRes.status, 200);
  const orgBody = await json(createOrgRes);
  const orgId = orgBody.data.id;

  const dupOrgRes = await app.request("/api/v1/admin/organizations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Đối Tác Trùng",
      slug: "doi-tac-moi",
    }),
  });
  assert.equal(dupOrgRes.status, 409);
  console.log("✓ 6. Admin Organizations CRUD + 409 slug conflict");

  // 7. Admin Projects + Media + Comparison CRUD
  const serviceId = galleryBody.data.services[0].id;
  const createProjRes = await app.request("/api/v1/admin/cms/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Dự án Test v2",
      slug: "du-an-test-v2",
      organizationId: orgId,
      year: 2026,
      publishStatus: "PUBLISHED",
      isFeatured: true,
      featuredOrder: 0,
      serviceIds: [serviceId],
    }),
  });
  assert.equal(createProjRes.status, 200);
  const projBody = await json(createProjRes);
  const projectId = projBody.data.id;

  const mediaRes = await app.request(`/api/v1/admin/cms/projects/${projectId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: "ACTUAL",
      storageKey: "https://example.com/photo.jpg",
      isCover: true,
    }),
  });
  assert.equal(mediaRes.status, 200);
  console.log("✓ 7. Admin Projects + Media CRUD (200 OK)");

  // 8. Admin Leads Status + Activities + Delete
  const statusRes = await app.request(`/api/v1/admin/leads/${leadId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "CONTACTED", note: "Đã gọi điện" }),
  });
  assert.equal(statusRes.status, 200);

  const leadDetailRes = await app.request(`/api/v1/admin/leads/${leadId}`);
  assert.equal(leadDetailRes.status, 200);
  const leadDetail = await json(leadDetailRes);
  assert.equal(leadDetail.data.activities.length, 1);

  const delLeadRes = await app.request(`/api/v1/admin/leads/${leadId}`, { method: "DELETE" });
  assert.equal(delLeadRes.status, 200);

  const delProjRes = await app.request(`/api/v1/admin/cms/projects/${projectId}`, { method: "DELETE" });
  assert.equal(delProjRes.status, 200);

  const delOrgRes = await app.request(`/api/v1/admin/organizations/${orgId}`, { method: "DELETE" });
  assert.equal(delOrgRes.status, 200);
  console.log("✓ 8. Admin Leads + Cleanup (200 OK)");

  console.log("\n=== TẤT CẢ ENDPOINT TESTS SCHEMA V2 ĐÃ PASS! ===");
}

runTests().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
