import worker, { PasswordService } from "./dist/index.js";

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

  // 9. Kiểm tra Security Headers (SEC-08)
  const healthRes = await app.request("/");
  const nosniff = healthRes.headers.get("x-content-type-options");
  console.log("9. Security Headers nosniff -> Header:", nosniff);
  if (nosniff !== "nosniff") throw new Error("Test 9 Failed: Missing X-Content-Type-Options");

  // 10. CORS Whitelist & Chặn Wildcard Reflection (SEC-01)
  const evilCorsRes = await app.request("/api/v1/content/landing", {
    headers: { Origin: "https://evil-attacker.com" },
  });
  const evilAllowOrigin = evilCorsRes.headers.get("access-control-allow-origin");
  console.log("10a. CORS Evil Origin bị từ chối -> Allow-Origin:", evilAllowOrigin);
  if (evilAllowOrigin !== null) throw new Error("Test 10a Failed: CORS reflected evil origin");

  const validCorsRes = await app.request("/api/v1/content/landing", {
    headers: { Origin: "http://localhost:3000" },
  });
  const validAllowOrigin = validCorsRes.headers.get("access-control-allow-origin");
  console.log("10b. CORS Valid Origin được cấp phép -> Allow-Origin:", validAllowOrigin);
  if (validAllowOrigin !== "http://localhost:3000") throw new Error("Test 10b Failed: Valid origin denied");

  // 11. Rate Limiting trên Public Leads Endpoint (SEC-05)
  console.log("11. Bắt đầu gửi requests kiểm tra Rate Limiting...");
  let rateLimited = false;
  for (let i = 0; i < 22; i++) {
    const leadRes = await app.request("/api/v1/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "cf-connecting-ip": "203.0.113.195",
      },
      body: JSON.stringify({ fullName: "Spam Bot", phone: "0999999999" }),
    });
    if (leadRes.status === 429) {
      rateLimited = true;
      console.log(`   - Request #${i + 1} bị chặn chuẩn xác với HTTP 429 Too Many Requests`);
      break;
    }
  }
  if (!rateLimited) throw new Error("Test 11 Failed: Rate limiter did not trigger 429");

  // 12. Kiểm tra PBKDF2 Password Hashing & Constant-Time Verification (SEC-03)
  const plainPassword = "TestSecurityPass@2026";
  const newHash = await PasswordService.hashPassword(plainPassword);
  console.log("12a. Hash PBKDF2 mới tạo:", newHash);
  if (!newHash.startsWith("pbkdf2:100000:")) {
    throw new Error("Test 12a Failed: Password hash is not using PBKDF2 100k rounds");
  }
  const isMatchValid = await PasswordService.verifyPassword(plainPassword, newHash);
  const isMatchWrong = await PasswordService.verifyPassword("WrongPassword@123", newHash);
  console.log("12b. Verify PBKDF2 đúng pass:", isMatchValid);
  console.log("12c. Verify PBKDF2 sai pass:", !isMatchWrong);
  if (!isMatchValid || isMatchWrong) {
    throw new Error("Test 12b/c Failed: PBKDF2 verification logic error");
  }

  console.log("\n=======================================================");
  console.log(">>> TẤT CẢ TEST CASES ĐÃ PASS 100% HOÀN HẢO! <<<");
  console.log("=======================================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
