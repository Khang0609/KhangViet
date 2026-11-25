# Handoff Report — Explorer 6: Test Suite & Edge Case Harmonizer

**Explorer:** Explorer 6 (Test Suite & Edge Case Harmonizer)  
**Role:** investigator, synthesizer  
**Conversation ID:** 252a87e7-b35e-4719-83a3-0b0888af30ce  
**State Folder:** `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_m1_fix_3`  
**Milestone:** Milestone 1 Iteration 2 (Database Schema, Repositories & Test Integrity)  
**Target Recipient:** Orchestrator (`9875b955-8c1f-4348-971a-46ec427f4059`)  
**Date:** 2026-11-08  

---

## 1. Observation (Quan Sát Thực Nghiệm Trực Tiếp)

Tôi đã tiến hành thanh tra toàn diện các bộ kiểm thử tự động, mã nguồn repository và cấu hình package trong `packages/repositories`. Dưới đây là các quan sát thực nghiệm có dẫn chứng trực tiếp:

### 1.1. Sự Cô Lập Của Bộ Kiểm Thử Đối Kháng
- Tại `packages/repositories/package.json` (dòng 9):
  ```json
  "test": "node --test test/*.test.mjs"
  ```
- Danh sách file thực tế trong `packages/repositories/test/`:
  - `party-media-schema.test.mjs` (khớp glob `*.test.mjs`)
  - `uuid-v7.test.mjs` (khớp glob `*.test.mjs`)
  - `adversarial-party-identity.mjs` (do Challenger 1 viết, **KHÔNG KHỚP** glob `*.test.mjs`)
  - `adversarial-projects-media.mjs` (do Challenger 2 viết, **KHÔNG KHỚP** glob `*.test.mjs`)
- Khi thực thi lệnh `pnpm --filter @khangviet/repositories test`:
  - Terminal chạy: `node --test test/*.test.mjs`
  - Kết quả: Chỉ có **10 tests** (`party-media-schema` + `uuid-v7`) được thực thi.
  - Toàn bộ 2 bộ kiểm thử đối kháng (`adversarial-party-identity.mjs` với 6 tests và `adversarial-projects-media.mjs` với 22 subtests) **bị bỏ qua 100%**.

### 1.2. Khiếm Khuyết Chuẩn Hóa Số Điện Thoại Trong `D1LeadRepository.createLead`
- Tại `packages/repositories/src/d1/repositories/d1-lead-repository.ts` (dòng 35-47):
  ```ts
  const existing = await this.client
    .select()
    .from(identitiesTable)
    .where(eq(identitiesTable.phone, data.phone))
    .limit(1);

  let identityId = existing[0]?.id;
  if (!identityId) {
    identityId = generateUuidV7();
    await this.client.insert(identitiesTable).values({
      id: identityId,
      fullName: data.fullName,
      phone: data.phone,
      ...
  ```
- Quan sát thực nghiệm: Khi input `data.phone` chứa khoảng trắng hai đầu (ví dụ: `"  0938123456  "`), hàm `createLead` không gọi `.trim()`. Biểu thức `eq(identitiesTable.phone, data.phone)` so sánh chuỗi thô thất bại với bản ghi `"0938123456"` đã tồn tại, dẫn đến việc SQLite chèn thêm một bản ghi `identities` mới trùng lặp thực thể.

### 1.3. Lỗi Cú Pháp Parameter Property Với Node 22 Strip-Types Mode
- Khi thực thi kiểm tra import trực tiếp bằng Node.js v22.18.0:
  ```bash
  node --input-type=module -e "import('./packages/repositories/src/d1/repositories/d1-user-repository.ts')"
  ```
- Lỗi văng ra verbatim:
  ```text
  SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript parameter property is not supported in strip-only mode
      at parseTypeScript (node:internal/modules/typescript:63:40)
      at processTypeScriptCode (node:internal/modules/typescript:133:42)
  ```
- Quét toàn bộ mã nguồn xác định 4 vị trí vi phạm:
  1. `packages/repositories/src/d1/repositories/d1-user-repository.ts:43`: `constructor(private readonly client: D1Client) {}`
  2. `packages/repositories/src/d1/repositories/d1-lead-repository.ts:11`: `constructor(private readonly client: D1Client) {}`
  3. `packages/repositories/src/d1/repositories/d1-cms-project-repo.ts:10`: `constructor(private readonly client: D1Client) {}`
  4. `packages/repositories/src/d1/repositories/d1-cms-meta-repo.ts:18`: `constructor(private readonly client: D1Client) {}`

### 1.4. Bộ Kiểm Thử Đối Kháng Task 3.3 Chưa Chuyển Thành Hard Assertion
- Tại `packages/repositories/test/adversarial-party-identity.mjs` (dòng 173-178):
  ```js
  if (!roleCheckEnforced) {
    console.warn("⚠️ DEFECT DETECTED: user_accounts table lacks a SQLite CHECK constraint for role (ADMIN, STAFF, CUSTOMER)!");
  }
  ```
  Challenger 1 chỉ đặt câu lệnh cảnh báo `console.warn` để phát hiện lỗi mà không ngắt quá trình test (`assert.throws`). Do đó, test suite vẫn trả về exit code 0 dù cơ sở dữ liệu hoàn toàn thiếu ràng buộc CHECK.

---

## 2. Logic Chain (Chuỗi Lập Luận)

1. **Từ Quan sát 1.1:** Glob `test/*.test.mjs` trong `package.json` quy định chặt chẽ mẫu tên file mà Node test runner tìm kiếm. Việc 2 file đối kháng thiếu hậu tố `.test.` khiến chúng trở thành "dead test code" không bao giờ được CI hay lệnh `pnpm test` triệu gọi. Đổi tên thành `*.test.mjs` lập tức kích hoạt cả 4 suites (38+ tests) chạy tự động, tương thích hoàn toàn trên cả Windows lẫn Linux.
2. **Từ Quan sát 1.2:** Bản chất của Party Model là gom cụm danh tính khách hàng qua số điện thoại duy nhất. Việc người dùng hoặc form web vô tình gửi khoảng trắng hai đầu là tình huống phổ biến trong thực tế. Chuẩn hóa `data.phone.trim()` trước khi truy vấn và lưu trữ là điều kiện tiên quyết để bảo vệ tính toàn vẹn của dữ liệu quan hệ (relational integrity).
3. **Từ Quan sát 1.3:** Node 22 hỗ trợ native TypeScript thông qua Type Stripping (`--experimental-strip-types`, bật mặc định cho ESM). Type Stripping loại bỏ các chú thích kiểu mà không biên dịch mã nguồn. Parameter property là cú pháp TypeScript đòi hỏi sinh mã JavaScript (`this.client = client;`), nên bị Node 22 từ chối. Chuyển sang khai báo trường tường minh (`private readonly client: D1Client; constructor(client: D1Client) { this.client = client; }`) là chuẩn ECMAScript thuần túy, giải quyết triệt để lỗi và đồng nhất với `d1-cms-repository.ts`.
4. **Từ Quan sát 1.4:** Khi Explorer 5 và Worker 1 bổ sung CHECK constraints vào schema và migration SQL, Task 3.3 trong `adversarial-party-identity.test.mjs` bắt buộc phải được nâng cấp thành strict assertion (`assert.throws(..., /CHECK constraint failed/i)`). Điều này bảo đảm nếu bất kỳ ai vô tình xóa bỏ CHECK constraint trong tương lai, CI sẽ lập tức thất bại (fail-closed).
5. **Tổng hợp:** Kế hoạch chuẩn hóa test suite này kết nối chặt chẽ kết quả của Explorer 4 (tách file modularization dưới 100 dòng) và Explorer 5 (bổ sung SQLite CHECK constraints), hoàn thiện toàn bộ chốt chặn an toàn cho Milestone 1 Iteration 2.

---

## 3. Caveats (Điểm Lưu Ý & Ràng Buộc Kỹ Thuật)

- **Foreign Keys trong SQLite In-Memory:** Trong môi trường Node test runner, mỗi kết nối `new DatabaseSync(":memory:")` bắt buộc phải chạy `PRAGMA foreign_keys = ON;` ngay sau khi khởi tạo vì SQLite tắt FK mặc định. Trên Cloudflare D1 Production, Cloudflare Workers bật FK sẵn.
- **Tương Tác Với Kế Hoạch Modularization Của Explorer 4:** Explorer 4 đề xuất tách hàm `createLead` và trích xuất `findOrCreateLeadIdentity` sang `lead-mapper.ts`. Lập trình viên Worker 1 cần đưa logic `cleanPhone = data.phone.trim()` vào bên trong `findOrCreateLeadIdentity` để vừa bảo đảm xử lý khoảng trắng vừa tuân thủ hard limit file <= 100 dòng và hàm <= 35 dòng.

---

## 4. Conclusion (Kết Luận & Kế Hoạch Bàn Giao)

Hệ thống đã có đầy đủ 4 bộ kiểm thử xuất sắc và cực kỳ sâu sắc, nhưng đang bị phân mảnh do quy ước đặt tên và cấu hình runner. 

**Kế hoạch hành động 5 bước cho Worker 1:**
1. **Đổi tên file:**
   - `packages/repositories/test/adversarial-party-identity.mjs` ➔ `adversarial-party-identity.test.mjs`
   - `packages/repositories/test/adversarial-projects-media.mjs` ➔ `adversarial-projects-media.test.mjs`
2. **Cập nhật `packages/repositories/package.json`:** Thêm `test:adversarial` và `test:unit` bên cạnh lệnh `test` mặc định.
3. **Chuẩn hóa Constructor:** Thay thế parameter properties bằng explicit field declarations trong `d1-user-repository.ts`, `d1-lead-repository.ts`, `d1-cms-project-repo.ts`, và `d1-cms-meta-repo.ts`.
4. **Chuẩn hóa Số Điện Thoại:** Áp dụng `data.phone.trim()` trong `findOrCreateLeadIdentity` / `D1LeadRepository.createLead`.
5. **Nâng cấp Test Assertion:** Cập nhật Task 3.3 sang `assert.throws` và bổ sung Task 4.3 (phone trimming deduplication) & Task 5 (Node 22 strip-types import test).

Kế hoạch kỹ thuật chi tiết cùng toàn bộ mã nguồn mẫu đã được lưu tại:
`e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_m1_fix_3\analysis.md`.

---

## 5. Verification Method (Phương Pháp Xác Minh Độc Lập)

Sau khi Worker 1 áp dụng các sửa đổi trên, bất kỳ kiểm toán viên hoặc CI nào cũng có thể kiểm chứng lại toàn bộ hệ thống bằng các lệnh sau:

```bash
# 1. Kiểm tra build package repositories:
pnpm --filter @khangviet/repositories run build
# Kỳ vọng: Exit code 0, không có lỗi TypeScript.

# 2. Chạy toàn bộ 4 test suites (bao gồm cả 2 bộ test đối kháng vừa tích hợp):
pnpm --filter @khangviet/repositories test
# Kỳ vọng: 4 test suites (party-media-schema, uuid-v7, adversarial-party-identity, adversarial-projects-media) chạy thành công, 40+ tests PASS 100%, exit code 0.

# 3. Kiểm tra tính tương thích Node 22 native strip-types import:
node --input-type=module -e "import('./packages/repositories/src/d1/repositories/d1-user-repository.ts'); console.log('✅ Import clean!')"
# Kỳ vọng: In ra "✅ Import clean!", không còn văng ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX.

# 4. Kiểm tra build Worker API:
pnpm --filter api run build
# Kỳ vọng: Exit code 0 (wrangler dry-run thành công).

# 5. Chạy kiểm thử e2e luồng xác thực API:
pnpm --filter api test:auth
# Kỳ vọng: 12/12 scenarios pass 100%.
```
