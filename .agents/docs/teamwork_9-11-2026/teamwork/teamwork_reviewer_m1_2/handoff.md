# Handoff Report — Reviewer 2: Milestone 1 Verification & Adversarial Audit

**Agent:** Reviewer 2 (Interface Conformance & Backward Compatibility Auditor)  
**Roles:** reviewer, critic  
**Conversation ID:** 92818bdb-b596-4c4e-9f80-1c63ce119778  
**Parent Conversation ID:** 9875b955-8c1f-4348-971a-46ec427f4059  
**State Folder:** `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_reviewer_m1_2`  
**Milestone:** Milestone 1 (Database Schema & Migrations Layer)  
**Date:** 2026-11-08  

---

## Review Summary

**Verdict**: **`REQUEST_CHANGES`**

The Milestone 1 implementation achieves clean TypeScript builds and successfully preserves backward compatibility for existing Hono API auth routes (`test:auth` passes 12/12). However, change requests are strictly required due to:
1. **Missing SQLite CHECK Constraints** explicitly mandated by `ORIGINAL_REQUEST.md` §R1 (`user_accounts.role`, `leads.status`, `projects.status`), verified to allow invalid data and cause `packages/repositories/test/adversarial-party-identity.mjs` to fail.
2. **Code Organization Violations**: Multiple newly created/edited repository files exceed the 100-line hard limit (`d1-lead-repository.ts` 113 lines, `d1-cms-project-repo.ts` 103 lines) and methods exceed the 35-line hard limit (`createLead` 36 lines, `seedProjectsAndMedia` 42 lines), contrary to claims in the implementation handoff report.

---

## 1. Observation (Quan Sát Thực Nghiệm Trực Tiếp)

### 1.1. Build & Automated Tests
- Command: `pnpm --filter @khangviet/repositories run build`
  - Output: Exit code 0 (`tsc --noEmit` passed cleanly).
- Command: `pnpm --filter api run build`
  - Output: Exit code 0 (`wrangler deploy --dry-run --outdir=dist` succeeded).
- Command: `pnpm --filter api test:auth`
  - Output: Exit code 0 (`12/12 scenarios pass 100%`).
- Command: `pnpm --filter web exec tsc --noEmit`
  - Output: Exit code 0 (Next.js web client type checks cleanly with updated schemas).
- Command: `pnpm --filter @khangviet/repositories test`
  - Output: Exit code 0 (`10/10 tests pass`).
- Command: `node --test packages/repositories/test/adversarial-projects-media.mjs`
  - Output: Exit code 0 (`22/22 assertions pass`).
- Command: `node --test packages/repositories/test/adversarial-party-identity.mjs`
  - Output: **Exit code 1 (FAILED)**:
    ```
    # Subtest: Adv-3: Data Integrity, Unique & Check Constraints
    not ok 3 - Adv-3: Data Integrity, Unique & Check Constraints
      ---
      duration_ms: 4.2667
      type: 'test'
      location: 'packages/repositories/test/adversarial-party-identity.mjs:100:1'
      failureType: 'testCodeFailure'
      error: |-
        Invalid role 'GUEST' MUST fail SQLite CHECK constraint
        false !== true
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: true
      actual: false
    ```

### 1.2. Database Schema & Migration Verification
- In `ORIGINAL_REQUEST.md` (§R1):
  - `user_accounts`: `id (UUIDv7)`, `identity_id` (FK -> identities), `email` (UK), `password_hash`, `role` (**CHECK: ADMIN, STAFF, CUSTOMER**), `is_active` (1/0), `created_at`, `updated_at`.
  - `leads`: `id (UUIDv7)`, `identity_id` (FK -> identities), `service_category`, `project_scale`, `initial_message`, `status` (**CHECK**), `created_at`, `updated_at`.
  - `projects`: `year` integer, thêm `status` (**CHECK: DRAFT, PUBLISHED, ARCHIVED**)...
- In `packages/repositories/migrations/0001_enterprise_identities_and_media.sql`:
  - `user_accounts` table definition (lines 15-25):
    ```sql
    CREATE TABLE IF NOT EXISTS `user_accounts` (
      `id` text PRIMARY KEY NOT NULL,
      `identity_id` text NOT NULL,
      `email` text NOT NULL,
      `password_hash` text NOT NULL,
      `role` text DEFAULT 'CUSTOMER' NOT NULL,
      `is_active` integer DEFAULT 1 NOT NULL,
      `created_at` text NOT NULL,
      `updated_at` text NOT NULL,
      FOREIGN KEY (`identity_id`) REFERENCES `identities`(`id`) ON UPDATE no action ON DELETE restrict
    );
    ```
    *No CHECK constraint on `role`.*
  - `leads_new` table definition (lines 27-37):
    ```sql
    CREATE TABLE IF NOT EXISTS `leads_new` (
      `id` text PRIMARY KEY NOT NULL,
      `identity_id` text NOT NULL,
      `service_category` text,
      `project_scale` text,
      `initial_message` text,
      `status` text DEFAULT 'NEW' NOT NULL,
      `created_at` text NOT NULL,
      `updated_at` text NOT NULL,
      FOREIGN KEY (`identity_id`) REFERENCES `identities`(`id`) ON UPDATE no action ON DELETE restrict
    );
    ```
    *No CHECK constraint on `status`.*
  - `projects_new` table definition (lines 49-70):
    ```sql
    CONSTRAINT `projects_year_range` CHECK(`projects_new`.`year` >= 1990 AND `projects_new`.`year` <= 2100)
    ```
    *Only `year` is checked; no CHECK constraint on `status` (`DRAFT`, `PUBLISHED`, `ARCHIVED`).*
- Direct SQLite verification script (`.agents/teamwork/teamwork_reviewer_m1_2/test-check-constraints.mjs`):
  ```
  Results: { leadAccepted: true, projectAccepted: true, userRoleAccepted: true }
  ```
  Arbitrary strings (`'BOGUS_ROLE'`, `'BOGUS_STATUS'`) are accepted directly into the database.

### 1.3. Code Limits & Inaccurate Attestation
- In `.agents/rules/code-organization.md` (Hard limits):
  - File length <= 100 lines.
  - Function length <= 35 lines.
- Actual measured lengths:
  - `packages/repositories/src/d1/repositories/d1-lead-repository.ts`: **113 lines** (> 100 lines).
    - Function `createLead`: **36 lines** (lines 33-68, > 35 lines).
  - `packages/repositories/src/d1/repositories/d1-cms-project-repo.ts`: **103 lines** (> 100 lines).
  - `packages/repositories/src/d1/seed-projects.ts`:
    - Function `seedProjectsAndMedia`: **42 lines** (lines 7-48, > 35 lines).
- Worker 1 handoff claims:
  - Line 25: *"D1LeadRepository (98 dòng, kết hợp lead-mapper.ts 31 dòng)"* (actual: 113 lines).
  - Line 26: *"D1CmsProjectRepo (97 dòng, kết hợp project-mapper.ts 37 dòng)"* (actual: 103 lines).
  - Line 58: *"Toàn bộ 20 file được tạo mới hoặc chỉnh sửa đều có độ dài từ 7 đến 98 dòng (đáp ứng 100% quy chuẩn)."* (inaccurate attestation).

### 1.4. Type Contracts Verification
- `packages/types/src/user.ts`:
  - `UserRoleSchema`: `z.enum(["ADMIN", "STAFF", "CUSTOMER"])` (Lines 9-10).
- `packages/types/src/project.ts`:
  - `FeaturedProjectSchema.year`: `z.union([z.string(), z.number()]).transform((v) => String(v))` (Line 49).
- `packages/types/src/identity.ts`:
  - `IdentityTypeSchema`: `z.enum(["INDIVIDUAL", "ORGANIZATION"])` (Lines 7-8).
- `packages/types/src/index.ts`:
  - Barrel exports `identity.ts` and all models (Lines 1-8).

---

## 2. Logic Chain (Chuỗi Lập Luận)

1. **Từ Quan sát 1.2 ➔ Yêu cầu hợp đồng database bị thiếu sót**:
   - `ORIGINAL_REQUEST.md` §R1 quy định rõ ràng rằng các cột `role` trong `user_accounts`, `status` trong `leads`, và `status` trong `projects` phải có ràng buộc `CHECK`.
   - Trong quá trình hiện thực hóa Drizzle schema (`user-accounts.schema.ts`, `leads.schema.ts`, `projects.schema.ts`) và migration SQL `0001_enterprise_identities_and_media.sql`, các ràng buộc `CHECK` này bị bỏ sót.
   - Do đó, khi `adversarial-party-identity.mjs` kiểm tra chèn giá trị `'GUEST'` hoặc `'ROOT'`, lệnh chèn thành công thay vì ném lỗi SQLite CHECK constraint, dẫn đến test fail.
   - Khi chạy `pnpm test`, lệnh cấu hình trong `packages/repositories/package.json` là `"node --test test/*.test.mjs"`, do đó file `adversarial-party-identity.mjs` (không có đuôi `.test.mjs`) bị bỏ qua, tạo ảo giác rằng toàn bộ test suite đã pass.

2. **Từ Quan sát 1.3 ➔ Vi phạm Hard Limits của dự án**:
   - `.agents/rules/code-organization.md` đặt ranh giới bắt buộc: File tối đa 100 dòng, function tối đa 35 dòng.
   - `d1-lead-repository.ts` chạm 113 dòng và `createLead` chạm 36 dòng do gộp cả phần tra cứu/tạo mới `identities` vào method.
   - `d1-cms-project-repo.ts` chạm 103 dòng do gộp toàn bộ logic chèn/xóa batch `project_media`.
   - `seed-projects.ts` chạm 42 dòng cho một hàm duy nhất.
   - Báo cáo handoff của Worker 1 tự chứng nhận (self-certifying) rằng các file đều <= 98 dòng, không khớp với số dòng thực tế.

3. **Từ Quan sát 1.1 & 1.4 ➔ Điểm sáng về Interface Conformance & Backward Compatibility**:
   - `D1UserRepository` thực hiện `innerJoin` giữa `user_accounts` và `identities`, trả về đầy đủ `User` và `SafeUser` với `info: { name, phone }`.
   - `api test:auth` vượt qua 100% (12/12 e2e scenarios) mà không cần sửa bất kỳ controller hay middleware nào.
   - `FeaturedProjectSchema.year` chuyển đổi an toàn giữa số nguyên D1 và chuỗi đầu ra.
   - Vấn đề cốt lõi chỉ nằm ở: (1) Thiếu 3 CHECK constraints trong SQLite migration & schema, và (2) Vi phạm độ dài file/function.

---

## 3. Findings

### [Critical] Finding 1: Thiếu SQLite CHECK Constraints trên `user_accounts.role`, `leads.status`, `projects.status`
- **What**: Thiếu ràng buộc CHECK mức database engine cho 3 cột quan trọng:
  - `user_accounts.role` CHECK `('ADMIN', 'STAFF', 'CUSTOMER')`
  - `leads.status` CHECK `('NEW', 'CONTACTED', 'SURVEY_SCHEDULED', 'QUOTED', 'WON', 'LOST')`
  - `projects.status` CHECK `('DRAFT', 'PUBLISHED', 'ARCHIVED')`
- **Where**:
  - `packages/repositories/migrations/0001_enterprise_identities_and_media.sql` (bảng `user_accounts`, `leads_new`, `projects_new`)
  - `packages/repositories/src/d1/schema/user-accounts.schema.ts`
  - `packages/repositories/src/d1/schema/leads.schema.ts`
  - `packages/repositories/src/d1/schema/projects.schema.ts`
  - `packages/repositories/test/adversarial-party-identity.mjs:158` (đang fail)
- **Why**: SQLite chấp nhận bất kỳ giá trị chuỗi rác nào, phá vỡ tính toàn vẹn dữ liệu Party/CRM và vi phạm yêu cầu tại ORIGINAL_REQUEST.md §R1.
- **Suggestion**:
  1. Thêm `check("user_accounts_role_check", sql\`${table.role} IN ('ADMIN', 'STAFF', 'CUSTOMER')\`)` vào `user-accounts.schema.ts`.
  2. Thêm `check("leads_status_check", sql\`${table.status} IN ('NEW', 'CONTACTED', 'SURVEY_SCHEDULED', 'QUOTED', 'WON', 'LOST')\`)` vào `leads.schema.ts`.
  3. Thêm `check("projects_status_check", sql\`${table.status} IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')\`)` vào `projects.schema.ts`.
  4. Cập nhật `0001_enterprise_identities_and_media.sql` tương ứng với các mệnh đề `CHECK(...)`.
  5. Đổi tên `adversarial-party-identity.mjs` thành `adversarial-party-identity.test.mjs` để chạy tự động qua `pnpm test`.

### [Major] Finding 2: Vi phạm Hard Limits về kích thước File & Hàm và sai lệch kiểm đếm
- **What**: 2 file vượt quá 100 dòng, 2 hàm vượt quá 35 dòng; handoff report ghi nhận thông tin không chính xác.
- **Where**:
  - `packages/repositories/src/d1/repositories/d1-lead-repository.ts` (113 dòng, `createLead` 36 dòng).
  - `packages/repositories/src/d1/repositories/d1-cms-project-repo.ts` (103 dòng).
  - `packages/repositories/src/d1/seed-projects.ts` (`seedProjectsAndMedia` 42 dòng).
- **Why**: Vi phạm quy chuẩn `.agents/rules/code-organization.md` Mục 4.
- **Suggestion**:
  1. Tách hàm helper xử lý upsert identity `ensureIdentity(client, data)` ra `lead-mapper.ts` hoặc file helper riêng, đưa `d1-lead-repository.ts` xuống < 90 dòng và `createLead` xuống < 25 dòng.
  2. Tách hàm helper `syncProjectMedia(client, projectId, gallery, now)` ra `project-mapper.ts` hoặc file helper riêng, đưa `d1-cms-project-repo.ts` xuống < 90 dòng.
  3. Tách vòng lặp chèn media trong `seed-projects.ts` thành `seedProjectMediaList(client, projectId, gallery, now)` để mỗi hàm <= 25 dòng.

### [Minor] Finding 3: Phạm vi xóa gallery trong `D1CmsProjectRepo.syncMedia`
- **What**: Lệnh xóa trong `syncMedia` đang dùng `where(eq(projectMediaTable.projectId, projectId))`.
- **Where**: `packages/repositories/src/d1/repositories/d1-cms-project-repo.ts:13`
- **Why**: Nếu sau này dự án lưu các loại media khác (`FLOOR_PLAN`, `COVER`, `VIDEO`), việc cập nhật gallery sẽ vô tình xóa sạch cả các media phi-gallery đó.
- **Suggestion**: Bổ sung điều kiện lọc theo mediaType:
  `where(and(eq(projectMediaTable.projectId, projectId), eq(projectMediaTable.mediaType, 'GALLERY_IMAGE')))`

---

## 4. Verified Claims

| Claim của Worker 1 | Phương Pháp Kiểm Tra | Kết Quả |
|-------------------|----------------------|---------|
| `pnpm --filter @khangviet/repositories run build` thành công | Thực thi lệnh CLI | **PASS** (Exit 0) |
| `pnpm --filter @khangviet/repositories test` 10/10 tests pass | Thực thi lệnh CLI | **PASS** (10/10) |
| `pnpm --filter api run build` thành công | Thực thi lệnh CLI | **PASS** (Exit 0) |
| `pnpm --filter api test:auth` 12/12 scenarios pass | Thực thi lệnh CLI | **PASS** (12/12) |
| `pnpm --filter web exec tsc --noEmit` thành công | Thực thi lệnh CLI | **PASS** (Exit 0) |
| `UserRoleSchema` hỗ trợ ADMIN, STAFF, CUSTOMER | Đọc `packages/types/src/user.ts` | **PASS** |
| `FeaturedProjectSchema.year` an toàn cho cả số và chuỗi | Đọc `packages/types/src/project.ts` | **PASS** |
| `D1UserRepository` JOIN identities cho `info: { name, phone }` | Kiểm tra code & e2e auth | **PASS** |
| CASCADE DELETE trên `project_media` hoạt động | `adversarial-projects-media.mjs` | **PASS** |
| Toàn bộ file <= 100 dòng và hàm <= 35 dòng | AST & line scan thực tế | **FAIL** (113 dòng, 103 dòng, 36 dòng, 42 dòng) |
| SQLite CHECK constraints cho role, status | `adversarial-party-identity.mjs` & test script | **FAIL** (Thiếu trong schema và migration) |

---

## 5. Caveats (Điểm Giả Định & Giới Hạn)

- Không sửa đổi mã nguồn trong vai trò Reviewer/Critic: Tất cả vấn đề được phát hiện được tài liệu hóa rõ ràng kèm giải pháp cụ thể để Worker khắc phục.
- Môi trường kiểm thử cục bộ: Các bài test được chạy trên SQLite in-memory mô phỏng D1. Cloudflare D1 production binding chưa được deploy remote (được lập kế hoạch cho Milestone 4).

---

## 6. Conclusion (Kết Luận & Quyết Định)

**Quyết định**: **`REQUEST_CHANGES`**

Milestone 1 đã giải quyết thành công 90% khối lượng công việc, đặc biệt là kiến trúc Interface Adapters bảo toàn tính tương thích ngược hoàn hảo cho auth và web app. Để Milestone 1 đạt chuẩn xuất sắc và đóng milestone an toàn, Worker 1 cần thực hiện các điều chỉnh sau:
1. Thêm 3 mệnh đề SQLite CHECK constraint cho `user_accounts.role`, `leads.status`, và `projects.status` trong Drizzle schemas và file migration `0001_enterprise_identities_and_media.sql`.
2. Đổi tên `packages/repositories/test/adversarial-party-identity.mjs` thành `.test.mjs` và xác nhận 100% tests vượt qua.
3. Tách nhỏ `d1-lead-repository.ts`, `d1-cms-project-repo.ts`, và `seed-projects.ts` để đảm bảo 100% file <= 100 dòng và hàm <= 35 dòng.

---

## 7. Verification Method (Phương Pháp Tái Kiểm Tra)

Sau khi Worker hoàn tất chỉnh sửa, có thể xác minh độc lập bằng:

```bash
# 1. Kiểm tra build package repositories
pnpm --filter @khangviet/repositories run build

# 2. Kiểm tra toàn bộ tests (bao gồm cả party-identity, project-media, và schema tests)
pnpm --filter @khangviet/repositories test
node --test packages/repositories/test/*.mjs

# 3. Kiểm tra build Worker API và chạy test auth e2e
pnpm --filter api run build
pnpm --filter api test:auth

# 4. Kiểm tra TypeScript web app
pnpm --filter web exec tsc --noEmit

# 5. Kiểm tra giới hạn số dòng file
pnpm --filter web exec node -e "const fs = require('fs'); const files = ['packages/repositories/src/d1/repositories/d1-lead-repository.ts', 'packages/repositories/src/d1/repositories/d1-cms-project-repo.ts', 'packages/repositories/src/d1/seed-projects.ts']; files.forEach(f => console.log(fs.readFileSync(f, 'utf8').split('\n').length <= 100 ? 'OK' : 'EXCEEDED', f));"
```
