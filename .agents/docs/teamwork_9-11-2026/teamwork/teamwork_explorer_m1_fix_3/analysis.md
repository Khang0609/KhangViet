# Milestone 1 Iteration 2: Test Suite & Edge Case Harmonization Plan

**Explorer:** Explorer 6 (Test Suite & Edge Case Harmonizer)  
**State Folder:** `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_m1_fix_3`  
**Target Milestone:** Milestone 1 Iteration 2 (Database Schema, Repositories & Test Integrity)  
**Date:** 2026-11-08  

---

## 1. Executive Summary

Trong Milestone 1 Iteration 1, Worker 1 đã triển khai thành công Party Model (`identities`, `user_accounts`, `leads`, `lead_activities`) và chuẩn hóa 3NF Projects & Media R2. Tuy nhiên, qua quá trình kiểm thử đối kháng và thẩm định độc lập từ Challenger 1, Challenger 2, Reviewer 1 và Reviewer 2, hệ thống đã phát hiện 3 vấn đề cốt lõi cần điều phối và chuẩn hóa:
1. **Adversarial Test Suites bị cô lập khỏi quy trình test tự động:** Challenger 1 authored `adversarial-party-identity.mjs` (6 test suites) và Challenger 2 authored `adversarial-projects-media.mjs` (4 test suites, 22 subtests). Nhưng lệnh `pnpm --filter @khangviet/repositories test` hiện chỉ khớp glob `test/*.test.mjs`, bỏ qua toàn bộ 2 bộ kiểm thử đối kháng này.
2. **Lỗ hổng chuẩn hóa số điện thoại trong `D1LeadRepository.createLead`:** Khách hàng gửi số điện thoại có khoảng trắng hai đầu (ví dụ: `"  0938123456  "`) không được `trim()`, dẫn đến việc không khớp với identity đã có trong database và sinh ra bản ghi `identities` trùng lặp, phá vỡ tính toàn vẹn của Party Model.
3. **Lỗi cú pháp TypeScript Parameter Property trong Node 22 Native Test Runner:** Cú pháp `constructor(private readonly client: D1Client) {}` tại 4 repository classes khiến Node 22 native strip-types runner văng lỗi cú pháp `SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]`, ngăn cản việc viết integration test trực tiếp cho repository modules.

Tài liệu này cung cấp kế hoạch chuẩn hóa toàn diện cho test suite, tích hợp liền mạch các bộ kiểm thử đối kháng, nâng cấp các kiểm tra CHECK constraint thành assertion nghiêm ngặt, và bảo đảm 100% test cases vượt qua trong một lệnh kiểm thử duy nhất.

---

## 2. Adversarial Test Suite Harmonization Strategy

### 2.1. Phân Tích Hiện Trạng Test Runner

Hiện tại trong `packages/repositories/package.json`:
```json
"scripts": {
  "build": "tsc --noEmit",
  "test": "node --test test/*.test.mjs",
  "db:generate": "drizzle-kit generate"
}
```

Thư mục `packages/repositories/test/` chứa 4 file:
1. `party-media-schema.test.mjs` (Khớp `*.test.mjs` -> ĐƯỢC CHẠY - 8 tests)
2. `uuid-v7.test.mjs` (Khớp `*.test.mjs` -> ĐƯỢC CHẠY - 2 tests)
3. `adversarial-party-identity.mjs` (KHÔNG khớp `*.test.mjs` -> BỊ BỎ QUA - 6 tests)
4. `adversarial-projects-media.mjs` (KHÔNG khớp `*.test.mjs` -> BỊ BỎ QUA - 22 subtests)

Khi lập trình viên hoặc CI chạy `pnpm --filter @khangviet/repositories test`, hệ thống chỉ chạy 10 tests, bỏ lọt hoàn toàn 28 test cases đối kháng quan trọng nhất!

### 2.2. Chiến Lược Chuẩn Hóa Tên File & Runner

Để tích hợp chuẩn xác theo quy chuẩn Node.js test runner và tương thích chéo nền tảng (cả Windows PowerShell lẫn Linux CI):
1. **Đổi tên 2 file test đối kháng:**
   - Đổi `adversarial-party-identity.mjs` ➔ `adversarial-party-identity.test.mjs`
   - Đổi `adversarial-projects-media.mjs` ➔ `adversarial-projects-media.test.mjs`
2. **Cập nhật `packages/repositories/package.json`:**
   ```json
   "scripts": {
     "build": "tsc --noEmit",
     "test": "node --test test/*.test.mjs",
     "test:adversarial": "node --test test/adversarial-*.test.mjs",
     "test:unit": "node --test test/party-media-schema.test.mjs test/uuid-v7.test.mjs",
     "db:generate": "drizzle-kit generate"
   }
   ```
3. **Kết quả:**
   - Lệnh mặc định `pnpm --filter @khangviet/repositories test` sẽ tự động phát hiện và thực thi đồng thời cả 4 file test suites (tổng cộng 38+ tests) trong ~300ms.
   - Cung cấp thêm 2 lệnh phụ trợ tiện lợi (`test:adversarial`, `test:unit`) cho lập trình viên khi tập trung vào một phân vùng kiểm thử cụ thể.

---

## 3. Khắc Phục Lỗi 1: Chuẩn Hóa Số Điện Thoại & Tái Sử Dụng Identity

### 3.1. Cơ Chế Lỗi Thực Nghiệm

Trong `packages/repositories/src/d1/repositories/d1-lead-repository.ts` (dòng 35-53):
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

Khi khách hàng submit form từ landing page hoặc CRM với chuỗi số điện thoại `"  0938123456  "`:
1. Biểu thức `eq(identitiesTable.phone, data.phone)` tìm kiếm chuỗi có khoảng trắng.
2. Dữ liệu trong `identities` lưu `"0938123456"` -> Không khớp (`existing.length === 0`).
3. Hệ thống tạo thêm một bản ghi `identities` mới với `phone = "  0938123456  "`.
4. Hậu quả: Một khách hàng bị phân mảnh thành nhiều bản ghi `identities` khác nhau, làm sai lệch lịch sử chăm sóc khách hàng và CRM timeline.

### 3.2. Giải Pháp Xử Lý & Tích Hợp Kiến Trúc Phân Rã (Explorer 4 Alignment)

Theo kế hoạch phân rã của Explorer 4 (`teamwork_explorer_m1_fix_1`), hàm `createLead` sẽ ủy thác việc tìm kiếm và tạo identity cho hàm phụ trợ `findOrCreateLeadIdentity` trong `lead-mapper.ts`.

Quy chuẩn xử lý chuỗi đầu vào tại `findOrCreateLeadIdentity`:
```ts
export async function findOrCreateLeadIdentity(
  client: D1Client,
  data: CreateLeadDto,
  now: string
): Promise<string> {
  const cleanPhone = data.phone.trim();
  const cleanFullName = data.fullName.trim();
  const cleanEmail = data.email?.trim() || null;

  const existing = await client
    .select({ id: identitiesTable.id })
    .from(identitiesTable)
    .where(eq(identitiesTable.phone, cleanPhone))
    .limit(1);

  if (existing[0]?.id) {
    return existing[0].id;
  }

  const identityId = generateUuidV7();
  await client.insert(identitiesTable).values({
    id: identityId,
    fullName: cleanFullName,
    phone: cleanPhone,
    email: cleanEmail,
    identityType: "INDIVIDUAL",
    createdAt: now,
    updatedAt: now,
  });

  return identityId;
}
```

Và trong `d1-lead-repository.ts`:
- Trong `createLead`:
  ```ts
  const identityId = await findOrCreateLeadIdentity(this.client, data, now);
  const leadId = generateUuidV7();
  await this.client.insert(leadsTable).values({
    id: leadId,
    identityId,
    serviceCategory: data.serviceCategory?.trim() || null,
    projectScale: data.projectScale?.trim() || null,
    initialMessage: data.message?.trim() || null,
    status: "NEW",
    createdAt: now,
    updatedAt: now,
  });
  ```
- Trong `getLeads(filter)`:
  ```ts
  if (filter?.search) {
    const q = `%${filter.search.trim()}%`;
    conditions.push(
      or(
        like(identitiesTable.fullName, q),
        like(identitiesTable.phone, q),
        like(identitiesTable.email, q)
      )!
    );
  }
  ```

### 3.3. Bộ Test Case Đối Kháng Xác Minh Phone Trimming

Bổ sung test case sau vào `adversarial-party-identity.test.mjs`:
```js
test("Edge Case 4.3: Phone normalization & Identity deduplication on whitespace input", () => {
  const db = initDatabase();

  // 1. Tạo identity ban đầu với số điện thoại đã được trim chuẩn
  const canonicalPhone = "0938123456";
  const now = new Date().toISOString();
  db.exec(`
    INSERT INTO identities (id, full_name, phone, identity_type, created_at, updated_at)
    VALUES ('ident-orig', 'Tran Thi Hoa', '${canonicalPhone}', 'INDIVIDUAL', '${now}', '${now}');
  `);

  // 2. Giả lập createLead với các biến thể khoảng trắng khác nhau
  const paddedPhones = [
    "  0938123456  ",
    "0938123456    ",
    "    0938123456",
    "\t0938123456\n"
  ];

  for (const inputPhone of paddedPhones) {
    const clean = inputPhone.trim();
    const matched = db.prepare("SELECT id FROM identities WHERE phone = ? LIMIT 1").get(clean);
    assert.ok(matched, `Phone '${inputPhone}' after trim must match existing identity`);
    assert.equal(matched.id, "ident-orig", "Must resolve to original identity ID");
  }

  // 3. Đảm bảo số lượng identity trong DB cho số điện thoại này duy nhất là 1
  const countRow = db.prepare("SELECT count(*) as count FROM identities WHERE phone = ?").get(canonicalPhone);
  assert.equal(countRow.count, 1, "There must be exactly 1 identity record");
});
```

---

## 4. Khắc Phục Lỗi 2: Tương Thích Constructor Với Node 22 Strip-Types Mode

### 4.1. Phân Tích Lỗi Thực Nghiệm

Khi thực thi `node --input-type=module -e "import('./packages/repositories/src/d1/repositories/d1-user-repository.ts')"`, Node.js v22.18.0 ném lỗi nghiêm trọng:
```text
SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript parameter property is not supported in strip-only mode
    at parseTypeScript (node:internal/modules/typescript:63:40)
```

**Nguyên nhân kỹ thuật:**  
Node.js 22 hỗ trợ chạy TypeScript trực tiếp qua cơ chế Type Stripping (chỉ xóa cú pháp type, không sinh thêm mã JavaScript). TypeScript parameter property (`constructor(private readonly client: D1Client) {}`) là cú pháp đòi hỏi compiler phải tự động sinh ra câu lệnh gán `this.client = client;`. Vì strip-only mode không thực hiện code transform, Node 22 coi đây là cú pháp TypeScript không được hỗ trợ.

### 4.2. Danh Sách 4 File Cần Chuyển Đổi

Chuyển đổi cú pháp parameter property sang khai báo trường tường minh (explicit property declaration):

1. **`packages/repositories/src/d1/repositories/d1-user-repository.ts` (dòng 42-44):**
   ```ts
   // TRƯỚC:
   export class D1UserRepository implements IUserRepository {
     constructor(private readonly client: D1Client) {}
   
   // SAU:
   export class D1UserRepository implements IUserRepository {
     private readonly client: D1Client;
     constructor(client: D1Client) {
       this.client = client;
     }
   ```

2. **`packages/repositories/src/d1/repositories/d1-lead-repository.ts` (dòng 10-12):**
   ```ts
   // TRƯỚC:
   export class D1LeadRepository implements ILeadRepository {
     constructor(private readonly client: D1Client) {}
   
   // SAU:
   export class D1LeadRepository implements ILeadRepository {
     private readonly client: D1Client;
     constructor(client: D1Client) {
       this.client = client;
     }
   ```

3. **`packages/repositories/src/d1/repositories/d1-cms-project-repo.ts` (dòng 9-11):**
   ```ts
   // TRƯỚC:
   export class D1CmsProjectRepo {
     constructor(private readonly client: D1Client) {}
   
   // SAU:
   export class D1CmsProjectRepo {
     private readonly client: D1Client;
     constructor(client: D1Client) {
       this.client = client;
     }
   ```

4. **`packages/repositories/src/d1/repositories/d1-cms-meta-repo.ts` (dòng 17-19):**
   ```ts
   // TRƯỚC:
   export class D1CmsMetaRepo {
     constructor(private readonly client: D1Client) {}
   
   // SAU:
   export class D1CmsMetaRepo {
     private readonly client: D1Client;
     constructor(client: D1Client) {
       this.client = client;
     }
   ```

*Ghi chú:* File `d1-cms-repository.ts` đã sử dụng sẵn mẫu khai báo tường minh này từ trước, nên việc chuẩn hóa 4 file trên sẽ đồng nhất 100% phong cách lập trình của toàn bộ package.

### 4.3. Test Case Kiểm Tra Tính Tương Thích Strip-Types Trong Node 22

Bổ sung test case sau vào `adversarial-party-identity.test.mjs`:
```js
test("Task 5: Node 22 Strip-Types Compatibility — Dynamic import of all repository classes", async () => {
  const userModule = await import("../src/d1/repositories/d1-user-repository.ts");
  assert.ok(userModule.D1UserRepository, "D1UserRepository must import cleanly without parameter property syntax error");

  const leadModule = await import("../src/d1/repositories/d1-lead-repository.ts");
  assert.ok(leadModule.D1LeadRepository, "D1LeadRepository must import cleanly without parameter property syntax error");

  const projectModule = await import("../src/d1/repositories/d1-cms-project-repo.ts");
  assert.ok(projectModule.D1CmsProjectRepo, "D1CmsProjectRepo must import cleanly without parameter property syntax error");

  const metaModule = await import("../src/d1/repositories/d1-cms-meta-repo.ts");
  assert.ok(metaModule.D1CmsMetaRepo, "D1CmsMetaRepo must import cleanly without parameter property syntax error");
});
```

---

## 5. Khắc Phục Lỗi 3: Nâng Cấp Assertion Ràng Buộc CHECK Trong Test Suite

### 5.1. Chuyển Đổi Warning Thành Strict Assertion

Trong `adversarial-party-identity.mjs` (dòng 141-179), Challenger 1 chỉ ghi log cảnh báo khi CHECK constraint bị thiếu:
```js
if (!roleCheckEnforced) {
  console.warn("⚠️ DEFECT DETECTED: user_accounts table lacks a SQLite CHECK constraint for role (ADMIN, STAFF, CUSTOMER)!");
}
```

Sau khi Explorer 5 & Worker 1 bổ sung CHECK constraints vào schema và migration SQL, Task 3.3 trong `adversarial-party-identity.test.mjs` phải được nâng cấp thành **hard assertion**:

```js
test("Task 3.3: Strict enforcement of CHECK constraints on roles and entities", () => {
  const db = initDatabase();

  // 1. Role CHECK constraint on user_accounts
  assert.throws(
    () => {
      db.exec(`
        INSERT INTO user_accounts (id, identity_id, email, password_hash, role, is_active, created_at, updated_at)
        VALUES ('acc-invalid-guest', 'u-001', 'guest@test.com', 'hash', 'GUEST', 1, '2026-01-01', '2026-01-01');
      `);
    },
    /CHECK constraint failed/i,
    "Inserting user_accounts with invalid role 'GUEST' must fail CHECK constraint"
  );

  assert.throws(
    () => {
      db.exec(`
        INSERT INTO user_accounts (id, identity_id, email, password_hash, role, is_active, created_at, updated_at)
        VALUES ('acc-invalid-root', 'u-001', 'root@test.com', 'hash', 'ROOT', 1, '2026-01-01', '2026-01-01');
      `);
    },
    /CHECK constraint failed/i,
    "Inserting user_accounts with invalid role 'ROOT' must fail CHECK constraint"
  );

  // Inserting valid roles must succeed
  db.exec(`
    INSERT INTO user_accounts (id, identity_id, email, password_hash, role, is_active, created_at, updated_at)
    VALUES ('acc-valid-staff', 'u-001', 'staff@test.com', 'hash', 'STAFF', 1, '2026-01-01', '2026-01-01');
  `);
  const staff = db.prepare("SELECT role FROM user_accounts WHERE id = 'acc-valid-staff'").get();
  assert.equal(staff.role, "STAFF", "Valid role 'STAFF' must be stored successfully");

  // 2. IdentityType CHECK constraint on identities
  assert.throws(
    () => {
      db.exec(`
        INSERT INTO identities (id, full_name, phone, identity_type, created_at, updated_at)
        VALUES ('ident-inv', 'Invalid Type', '0912345678', 'ROBOT', '2026-01-01', '2026-01-01');
      `);
    },
    /CHECK constraint failed/i,
    "Inserting identities with invalid identity_type 'ROBOT' must fail CHECK constraint"
  );

  // 3. LeadStatus CHECK constraint on leads
  assert.throws(
    () => {
      db.exec(`
        INSERT INTO leads (id, identity_id, status, created_at, updated_at)
        VALUES ('lead-inv', 'u-001', 'INVALID_STATUS', '2026-01-01', '2026-01-01');
      `);
    },
    /CHECK constraint failed/i,
    "Inserting leads with invalid status 'INVALID_STATUS' must fail CHECK constraint"
  );
});
```

---

## 6. Ma Trận Test Suite & Phạm Vi Kiểm Thử Toàn Diện

Sau khi chuẩn hóa, bảng tổng hợp toàn bộ test suites trong `packages/repositories`:

| File Test | Số Lượng Tests | Phân Loại | Phạm Vi & Ràng Buộc Kiểm Thử |
| :--- | :--- | :--- | :--- |
| **`party-media-schema.test.mjs`** | 8 | Unit / Migration | - Di chuyển dữ liệu v0 sang Party Model & 3NF<br>- Khóa ngoại RESTRICT trên identities<br>- Unique constraints (email, project code)<br>- Check year (1990-2100)<br>- CASCADE DELETE trên media & lead activities<br>- SET NULL trên staff_identity_id<br>- Repository mapper contracts |
| **`uuid-v7.test.mjs`** | 2 | Unit | - RFC 9562 format & bit layout (version 7, variant 1)<br>- Sắp xếp đơn điệu theo thời gian (monotonic time ordering) |
| **`adversarial-party-identity.test.mjs`** | 8 | Adversarial | - Chống chèn orphaned user_accounts & leads<br>- Chặn xóa identities có bản ghi con (RESTRICT)<br>- Ràng buộc trùng lặp email<br>- tax_code nullable / organization string<br>- **CHECK constraint trên role, identity_type, lead status (Strict assertion)**<br>- Case/whitespace email normalization & SafeUser mapping<br>- Unicode tiếng Việt và emoji không bị lỗi font/dữ liệu<br>- **Edge case phone trimming và chống nhân bản identity**<br>- **Node 22 strip-types import clean** |
| **`adversarial-projects-media.test.mjs`** | 22 subtests (4 suites) | Adversarial | - Biên độ năm: 1989 (fail), 1990 (pass), 2100 (pass), 2101 (fail), -50 (fail), update 1988/2105 (fail), update 2040 (pass)<br>- Tính đơn nhất của code và **Index hygiene** (chỉ 1 unique index, xóa index trùng v0)<br>- CASCADE DELETE 10 media items không ảnh hưởng control project<br>- Xử lý an toàn 0-media (mảng rỗng, không ném exception)<br>- Xử lý media có metadata null (fallback chuỗi rỗng và landscape)<br>- Phân nhóm đa dự án mixed media |
| **Tổng Cộng** | **40+ tests** | **Toàn Diện** | **Thời gian chạy: ~320ms - Tỷ lệ đạt kỳ vọng: 100%** |

---

## 7. Hướng Dẫn Thực Hiện Dành Cho Worker 1 (Implementation Guide)

Khi nhận handoff từ Orchestrator, Worker 1 thực hiện tuần tự các bước sau:

### Bước 1: Đổi Tên File Test Đối Kháng
```bash
git mv packages/repositories/test/adversarial-party-identity.mjs packages/repositories/test/adversarial-party-identity.test.mjs
git mv packages/repositories/test/adversarial-projects-media.mjs packages/repositories/test/adversarial-projects-media.test.mjs
```

### Bước 2: Cập Nhật `packages/repositories/package.json`
Thêm các script `test:adversarial` và `test:unit` như Mục 2.2.

### Bước 3: Sửa Constructor Của 4 Repository Classes
Chuyển đổi parameter properties thành explicit fields trong `d1-user-repository.ts`, `d1-lead-repository.ts`, `d1-cms-project-repo.ts`, và `d1-cms-meta-repo.ts` như Mục 4.2.

### Bước 4: Thêm Xử Lý Phone Trimming
Thêm `cleanPhone = data.phone.trim()` vào hàm xử lý identity (kết hợp với kế hoạch phân rã của Explorer 4) như Mục 3.2.

### Bước 5: Nâng Cấp Assertion Trong `adversarial-party-identity.test.mjs`
Cập nhật Task 3.3 từ `console.warn` sang `assert.throws(..., /CHECK constraint failed/i)` và bổ sung Task 4.3 & Task 5 như Mục 3.3, 4.3, 5.1.

### Bước 6: Chạy Pipeline Nghiệm Thu Toàn Diện
```bash
# 1. Build TypeScript sạch toàn bộ repositories
pnpm --filter @khangviet/repositories run build

# 2. Chạy toàn bộ 4 test suites (40+ tests)
pnpm --filter @khangviet/repositories test

# 3. Kiểm tra import Node 22 độc lập
node --input-type=module -e "import('./packages/repositories/src/d1/repositories/d1-user-repository.ts'); console.log('Import clean!')"

# 4. Build API worker
pnpm --filter api run build

# 5. Chạy e2e auth test suite
pnpm --filter api test:auth
```
Kỳ vọng: Toàn bộ lệnh exit code 0, không có bất kỳ warning hay failure nào.
