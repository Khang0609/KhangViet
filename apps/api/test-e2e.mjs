import worker from "./dist/index.js";

const app = worker;

async function runTests() {
  console.log("=== BẮT ĐẦU TEST LUỒNG AUTH TỪ ĐẦU ĐẾN CUỐI ===");

  // 1a. Đăng nhập với mật khẩu < 6 ký tự -> 400 (Zod schema validation)
  const zodRes = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@khangviet.vn", password: "short" }),
  });
  console.log("1a. Input < 6 ký tự bị Zod chặn -> Status:", zodRes.status);
  if (zodRes.status !== 400) throw new Error("Test 1a Failed");

  // 1b. Đăng nhập sai mật khẩu (hợp lệ schema nhưng sai mật khẩu) -> 401
  const failRes = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@khangviet.vn", password: "WrongPassword@123" }),
  });
  console.log("1b. Login sai mật khẩu -> Status:", failRes.status);
  if (failRes.status !== 401) throw new Error("Test 1b Failed");

  // 2. Đăng nhập đúng với Admin -> 200 + Cookie HttpOnly
  const loginRes = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@khangviet.vn", password: "Admin@123" }),
  });
  console.log("2. Login Admin đúng -> Status:", loginRes.status);
  const loginBody = await loginRes.json();
  const setCookie = loginRes.headers.get("set-cookie") || "";
  console.log("   - Nhận AccessToken:", !!loginBody.data?.accessToken);
  console.log("   - User email:", loginBody.data?.user?.email);
  console.log("   - User role:", loginBody.data?.user?.role);
  console.log("   - Không lộ trường password:", loginBody.data?.user?.password === undefined);
  console.log("   - Set-Cookie có HttpOnly:", setCookie.includes("HttpOnly"));
  if (loginRes.status !== 200 || !loginBody.data?.accessToken) {
    throw new Error("Test 2 Failed");
  }
  const adminToken = loginBody.data.accessToken;
  const refreshCookie = setCookie.split(";")[0];

  // 3. GET /api/protected không có Bearer token -> 401
  const unauthRes = await app.request("/api/protected");
  console.log("3. Protected không Token -> Status:", unauthRes.status);
  if (unauthRes.status !== 401) throw new Error("Test 3 Failed");

  // 4. GET /api/protected có Bearer token -> 200
  const authRes = await app.request("/api/protected", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const authBody = await authRes.json();
  console.log("4. Protected có Token -> Status:", authRes.status);
  console.log("   - Message:", authBody.data?.message);
  if (authRes.status !== 200) throw new Error("Test 4 Failed");

  // 5. Admin gọi /api/v1/admin/leads -> 200 (Đúng quyền ADMIN)
  const leadsRes = await app.request("/api/v1/admin/leads", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log("5. Admin gọi Admin API -> Status:", leadsRes.status);
  if (leadsRes.status !== 200) throw new Error("Test 5 Failed");

  // 6. Login Customer & gọi Admin API -> 403 Forbidden (RBAC chặn)
  const custLogin = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "customer@khangviet.vn", password: "Customer@123" }),
  });
  const custBody = await custLogin.json();
  const custLeads = await app.request("/api/v1/admin/leads", {
    headers: { Authorization: `Bearer ${custBody.data?.accessToken}` },
  });
  console.log("6. Customer gọi Admin API (RBAC) -> Status:", custLeads.status);
  if (custLeads.status !== 403) throw new Error("Test 6 Failed");

  // 7. Refresh token bằng Cookie -> 200 + AccessToken mới + Set-Cookie mới rotated
  const refreshRes = await app.request("/api/auth/refresh", {
    method: "POST",
    headers: { Cookie: refreshCookie },
  });
  const refreshBody = await refreshRes.json();
  const newSetCookie = refreshRes.headers.get("set-cookie") || "";
  console.log("7. Refresh Token qua Cookie -> Status:", refreshRes.status);
  console.log("   - Nhận New AccessToken:", !!refreshBody.data?.accessToken);
  console.log("   - Nhận Rotated RefreshToken Cookie:", newSetCookie.includes("HttpOnly"));
  if (refreshRes.status !== 200 || !refreshBody.data?.accessToken) {
    throw new Error("Test 7 Failed");
  }

  // 8. Dùng token mới gọi /api/protected -> 200
  const verifyNew = await app.request("/api/protected", {
    headers: { Authorization: `Bearer ${refreshBody.data.accessToken}` },
  });
  console.log("8. Token mới xác thực thành công -> Status:", verifyNew.status);
  if (verifyNew.status !== 200) throw new Error("Test 8 Failed");

  console.log("\n=======================================================");
  console.log(">>> TẤT CẢ TEST CASES ĐÃ PASS 100% HOÀN HẢO! <<<");
  console.log("=======================================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
