import assert from "node:assert/strict";
import worker from "./dist/index.js";

const app = worker;

async function json(res) {
  return await res.json();
}

async function loginAdmin() {
  const res = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@khangviet.vn", password: "Admin@123" }),
  });
  assert.equal(res.status, 200, "Admin login must succeed");
  const setCookie = res.headers.get("set-cookie") || "";
  const match = setCookie.match(/session_id=[^;]+/);
  assert.ok(match, "session_id cookie must be returned");
  return match[0];
}

async function runTests() {
  console.log("=== BẮT ĐẦU TEST ĐỘC LẬP ENDPOINTS (JSON REPOSITORY) ===");

  // 1. Public Landing
  const landingRes = await app.request("/api/v1/content/landing");
  assert.equal(landingRes.status, 200);
  const landingBody = await json(landingRes);
  assert.equal(landingBody.success, true);
  assert.ok(Array.isArray(landingBody.data.heroSlides) && landingBody.data.heroSlides.length > 0);
  assert.ok(Array.isArray(landingBody.data.featuredProjects) && landingBody.data.featuredProjects.length > 0);
  console.log("✓ 1. GET /api/v1/content/landing (200 OK)");

  // 2. Public Gallery (happy path + filter + pagination)
  const galleryRes = await app.request("/api/v1/content/gallery?segment=B2B&stage=COMPLETED&page=1&limit=2");
  assert.equal(galleryRes.status, 200);
  const galleryBody = await json(galleryRes);
  assert.equal(galleryBody.success, true);
  assert.ok(Array.isArray(galleryBody.data.items));
  assert.ok(galleryBody.data.items.length <= 2);
  assert.equal(galleryBody.data.pagination.page, 1);
  assert.equal(galleryBody.data.pagination.limit, 2);
  assert.ok(Array.isArray(galleryBody.data.keyAccounts) && galleryBody.data.keyAccounts.length > 0);
  assert.ok(Array.isArray(galleryBody.data.categories) && galleryBody.data.categories.length > 0);
  for (const item of galleryBody.data.items) {
    assert.equal(item.segment, "B2B");
    assert.equal(item.stage, "COMPLETED");
  }
  console.log("✓ 2. GET /api/v1/content/gallery filter & pagination (200 OK)");

  // 3. Public Projects list + pagination
  const projectsRes = await app.request("/api/v1/content/projects?page=1&limit=2");
  assert.equal(projectsRes.status, 200);
  const projectsBody = await json(projectsRes);
  assert.ok(Array.isArray(projectsBody.data.items) && projectsBody.data.items.length <= 2);
  assert.ok(projectsBody.data.pagination.total >= projectsBody.data.items.length);
  const firstProject = projectsBody.data.items[0];
  assert.ok(firstProject?.id);
  console.log("✓ 3. GET /api/v1/content/projects pagination (200 OK)");

  // 4. Public Project Detail (media + comparisonPairs)
  const detailRes = await app.request(`/api/v1/content/projects/${firstProject.id}`);
  assert.equal(detailRes.status, 200);
  const detailBody = await json(detailRes);
  assert.equal(detailBody.data.id, firstProject.id);
  assert.ok(Array.isArray(detailBody.data.media));
  assert.ok(Array.isArray(detailBody.data.comparisonPairs));
  if (detailBody.data.comparisonPairs.length > 0) {
    assert.ok(detailBody.data.comparisonPairs[0].renderUrl);
    assert.ok(detailBody.data.comparisonPairs[0].actualUrl);
  }
  console.log("✓ 4. GET /api/v1/content/projects/:id kèm media & comparisonPairs (200 OK)");

  // 5. Error Handling - Public (400 / 404, tuyệt đối không trả 500)
  const badSegment = await app.request("/api/v1/content/gallery?segment=INVALID");
  assert.equal(badSegment.status, 400, "Invalid segment must return 400");

  const badPage = await app.request("/api/v1/content/gallery?page=0");
  assert.equal(badPage.status, 400, "page=0 must return 400");

  const badLimit = await app.request("/api/v1/content/gallery?limit=999");
  assert.equal(badLimit.status, 400, "limit=999 must return 400");

  const notFoundProject = await app.request("/api/v1/content/projects/non-existent-id-999");
  assert.equal(notFoundProject.status, 404, "Unknown project id must return 404");
  console.log("✓ 5. Public error responses (400 Bad Request, 404 Not Found)");

  // 6. Admin Auth + Error Handling (400 / 404 / 409)
  const sessionCookie = await loginAdmin();
  const authHeaders = {
    "Content-Type": "application/json",
    Cookie: sessionCookie,
  };
  const cookieOnly = { Cookie: sessionCookie };

  const malformedJson = await app.request("/api/v1/admin/cms/projects", {
    method: "POST",
    headers: authHeaders,
    body: "{ invalid-json",
  });
  assert.equal(malformedJson.status, 400, "Malformed JSON must return 400");

  const missingFields = await app.request("/api/v1/admin/cms/projects", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ title: "Thiếu field" }),
  });
  assert.equal(missingFields.status, 400, "Missing fields must return 400");

  const duplicateCode = await app.request("/api/v1/admin/cms/projects", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      ...firstProject,
      id: "kv-dup-test",
    }),
  });
  assert.equal(duplicateCode.status, 409, "Duplicate project code must return 409");

  const updateMissing = await app.request("/api/v1/admin/cms/projects/non-existent-999", {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ title: "Updated" }),
  });
  assert.equal(updateMissing.status, 404, "Update missing project must return 404");

  const deleteMissing = await app.request("/api/v1/admin/cms/projects/non-existent-999", {
    method: "DELETE",
    headers: cookieOnly,
  });
  assert.equal(deleteMissing.status, 404, "Delete missing project must return 404");

  const badPlacement = await app.request("/api/v1/admin/cms/placements", {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      slotType: "FEATURED_SHOWCASE",
      projectId: "non-existent-project",
      sortOrder: 0,
    }),
  });
  assert.equal(badPlacement.status, 400, "Placement with non-existent projectId must return 400");

  const deleteMissingPlacement = await app.request("/api/v1/admin/cms/placements/non-existent-pl", {
    method: "DELETE",
    headers: cookieOnly,
  });
  assert.equal(deleteMissingPlacement.status, 404, "Delete missing placement must return 404");
  console.log("✓ 6. Admin error responses (400, 404, 409 - không rơi xuống 500)");

  // 7. Admin CRUD + Curated Placement End-to-End
  const createdRes = await app.request("/api/v1/admin/cms/projects", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      code: "KV-TEST-999",
      title: "Dự án Test Độc Lập",
      subtitle: "JSON Fixture Verification",
      client: "Khang Việt QA",
      locations: ["TP.HCM"],
      year: 2026,
      categoryTag: "Showroom",
      scaleMetric: "500 m2",
      materials: ["Alu", "Inox"],
      engineeringNotes: ["CNC Precision"],
      summary: "Dự án kiểm thử API endpoints.",
      coverImage: "/images/test-cover.jpg",
      segment: "B2B",
      stage: "COMPLETED",
      gallery: [],
    }),
  });
  assert.equal(createdRes.status, 200);
  const createdBody = await json(createdRes);
  const createdId = createdBody.data?.id;
  assert.ok(createdId, "Created project must have id");

  const placementRes = await app.request("/api/v1/admin/cms/placements", {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      slotType: "FEATURED_SHOWCASE",
      projectId: createdId,
      sortOrder: 0,
    }),
  });
  assert.equal(placementRes.status, 200);
  const placementBody = await json(placementRes);
  const placementId = placementBody.data?.id;
  assert.ok(placementId);

  const landingAfterRes = await app.request("/api/v1/content/landing");
  const landingAfterBody = await json(landingAfterRes);
  assert.ok(
    landingAfterBody.data.featuredProjects.some((p) => p.id === createdId),
    "Created project placed in FEATURED_SHOWCASE must appear in /landing"
  );

  const updatedRes = await app.request(`/api/v1/admin/cms/projects/${createdId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ title: "Dự án Test Độc Lập (Updated)" }),
  });
  assert.equal(updatedRes.status, 200);

  const delPlacementRes = await app.request(`/api/v1/admin/cms/placements/${placementId}`, {
    method: "DELETE",
    headers: cookieOnly,
  });
  assert.equal(delPlacementRes.status, 200);

  const delProjectRes = await app.request(`/api/v1/admin/cms/projects/${createdId}`, {
    method: "DELETE",
    headers: cookieOnly,
  });
  assert.equal(delProjectRes.status, 200);

  const afterDelDetail = await app.request(`/api/v1/content/projects/${createdId}`);
  assert.equal(afterDelDetail.status, 404);

  console.log("✓ 7. Admin CRUD & Curated Placements phản ánh trực tiếp lên /landing & /projects");
  console.log("\n✅ TẤT CẢ BÀI TEST ENDPOINTS ĐỘC LẬP ĐÃ PASS!");
}

runTests().catch((err) => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
