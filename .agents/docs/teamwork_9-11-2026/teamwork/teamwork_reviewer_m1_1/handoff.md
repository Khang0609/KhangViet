# Handoff Report & Review Verdict — Milestone 1: Database Schema & Migrations Layer

**Reviewer:** Reviewer 1 (Quality Reviewer & Adversarial Critic)  
**Role:** reviewer, critic  
**Conversation ID:** 259334bf-a20f-4d1b-8be1-b83040088e2d  
**State Folder:** `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_reviewer_m1_1`  
**Target Milestone:** Milestone 1 (Database Schema & Migrations Layer)  
**Date:** 2026-11-08  
**Verdict:** `REQUEST_CHANGES`

---

## 1. Observation (Quan Sát Thực Tế Độc Lập)

Qua việc trực tiếp thanh tra mã nguồn, đối chiếu tài liệu đặc tả (`ORIGINAL_REQUEST.md`, `PROJECT.md`, `.agents/rules/code-organization.md`) và chạy thử nghiệm độc lập trên SQLite/Node:

1. **Kiểm tra Schema & Ràng buộc D1 (`packages/repositories/src/d1/schema/*`):**
   - `identities.schema.ts` (32 dòng): Đã triển khai UUIDv7 PK, index trên `phone` (`idx_identities_phone`), `tax_code` nullable, hỗ trợ `INDIVIDUAL` và `ORGANIZATION`. **[ĐẠT]**
   - `user-accounts.schema.ts` (26 dòng): Đã có FK `identity_id` trỏ về `identities(id)` ON DELETE RESTRICT, email UNIQUE. **Tuy nhiên**, hoàn toàn **THIẾU RÀNG BUỘC CHECK** cho `role` (`ADMIN`, `STAFF`, `CUSTOMER`) ở cả schema Drizzle lẫn SQL migration. **[KHÔNG ĐẠT - VI PHẠM YÊU CẦU MÃ NGUỒN VÀ BẢO MẬT DỮ LIỆU]**
   - `leads.schema.ts` (31 dòng): Đã có FK `identity_id` trỏ về `identities(id)` ON DELETE RESTRICT, index trên `status`, `created_at`. **Tuy nhiên**, hoàn toàn **THIẾU RÀNG BUỘC CHECK** cho `status` ở cả schema Drizzle lẫn SQL migration. **[KHÔNG ĐẠT - VI PHẠM YÊU CẦU ĐẶC TẢ]**
   - `lead-activities.schema.ts` (28 dòng): FK `lead_id` CASCADE, `staff_identity_id` SET NULL. **[ĐẠT]**
   - `projects.schema.ts` (43 dòng): Đã loại bỏ cột `gallery` JSON, đổi `year` sang integer có CHECK constraint `projects_year_range (1990 <= year <= 2100)`, thêm `status`, `sort_order`, `client_identity_id` SET NULL, loại bỏ index trùng trên `code` (chỉ còn unique index đơn lẻ). **[ĐẠT]**
   - `project-media.schema.ts` (39 dòng): UUIDv7 PK, FK `project_id` CASCADE, `public_url`, `r2_key`, `caption`, `location`, `spec`, `aspect_ratio`, `width_px`, `height_px`, `file_size_bytes`, `sort_order`. **[ĐẠT]**

2. **Kiểm tra File Migration & Journal (`packages/repositories/migrations/`):**
   - `0001_enterprise_identities_and_media.sql` (116 dòng): Chuyển đổi an toàn dữ liệu cũ (`users`, `leads`, `projects`) sang Party Model và bảng 3NF mới, hoán đổi bảng và tái tạo index thành công.
   - **Tuy nhiên**, trong `CREATE TABLE IF NOT EXISTS user_accounts`: không có `CONSTRAINT ... CHECK(role IN ('ADMIN', 'STAFF', 'CUSTOMER'))`. Thử nghiệm chạy truy vấn SQL trực tiếp cho thấy SQLite cho phép insert `role = 'SUPER_HACKER'`.
   - Trong `CREATE TABLE IF NOT EXISTS leads_new`: không có `CONSTRAINT ... CHECK(status IN ('NEW', 'CONTACTED', 'SURVEY_SCHEDULED', 'QUOTED', 'WON', 'LOST'))`. SQLite cho phép insert `status = 'BOGUS_STATUS'`.
   - Thiếu file `meta/0001_snapshot.json` tương ứng với migration 1, khiến `drizzle-kit generate` không thể so khớp diff tự động trong môi trường CI không có TTY.

3. **Kiểm tra Giới Hạn Kích Thước Code (Hard Limits theo `.agents/rules/code-organization.md`):**
   - `packages/repositories/src/d1/repositories/d1-lead-repository.ts`: **112 dòng** (Vượt ngưỡng tối đa 100 dòng).
   - `packages/repositories/src/d1/repositories/d1-cms-project-repo.ts`: **102 dòng** (Vượt ngưỡng tối đa 100 dòng).
   - `packages/repositories/src/d1/seed-projects.ts` - hàm `seedProjectsAndMedia`: **42 dòng** (từ dòng 7 đến 48, vượt ngưỡng tối đa 35 dòng/hàm).
   - `packages/repositories/src/d1/repositories/d1-lead-repository.ts` - hàm `createLead`: **36 dòng** (từ dòng 33 đến 68, vượt ngưỡng tối đa 35 dòng/hàm).
   - *Ghi chú tính liêm chính dữ liệu*: Worker 1 báo cáo trong `handoff.md` và `changes.md` rằng `D1LeadRepository` dài 98 dòng, `D1CmsProjectRepo` dài 97 dòng và khẳng định "All 20 newly written/edited source files are strictly <= 100 lines". Đo đạc độc lập cho thấy điều này không chính xác.

4. **Kiểm tra Lệnh Độc Lập Build & Test Suite:**
   - `pnpm --filter @khangviet/repositories run build`: Exit code 0 (`tsc --noEmit` thành công).
   - `pnpm --filter @khangviet/repositories test`: 10/10 test cases PASS.
   - `pnpm --filter api run build`: Exit code 0 (`wrangler deploy --dry-run` thành công).
   - `pnpm --filter api test:auth`: 12/12 scenarios PASS 100%.

---

## 2. Logic Chain (Chuỗi Lập Luận Dẫn Đến Phán Quyết)

1. **Từ yêu cầu bảo vệ toàn vẹn dữ liệu Party Model & CRM:**
   - Cả bản mô tả nhiệm vụ Review ("role CHECK (ADMIN, STAFF, CUSTOMER)", "status CHECK") lẫn `ORIGINAL_REQUEST.md` ("role (CHECK: ADMIN, STAFF, CUSTOMER)", "status (CHECK)") đều đặt ra yêu cầu ràng buộc mức cơ sở dữ liệu.
   - Việc chỉ khai báo kiểu TypeScript (`.$type<UserRole>()`) mà không định nghĩa `check(...)` trong Drizzle schema và SQL migration khiến tầng cơ sở dữ liệu Cloudflare D1 không hề có chốt chặn bảo vệ. Bất kỳ script hoặc API route nào gửi chuỗi role/status không hợp lệ đều sẽ được ghi nhận vào D1 mà không bị chặn lại.

2. **Từ quy chuẩn tổ chức mã nguồn (Code Organization Hard Constraints):**
   - Quy định tại `.agents/rules/code-organization.md` mục 4: "Độ dài File: Tối đa 100 dòng... Độ dài Hàm / Method: Tối đa 35 dòng. Một hàm chỉ làm đúng một việc duy nhất."
   - `d1-lead-repository.ts` (112 dòng) và `d1-cms-project-repo.ts` (102 dòng) vi phạm hard limit về file length.
   - Hàm `seedProjectsAndMedia` (42 dòng) và `createLead` (36 dòng) vi phạm hard limit về function length.

3. **Từ nguyên tắc đánh giá khách quan & chất lượng bàn giao:**
   - Mặc dù kiến trúc Party Model, adapter mapper tương thích ngược, và việc loại bỏ JSON gallery sang `project_media` 3NF đã được triển khai xuất sắc và bảo vệ an toàn cho test suite API hiện hữu, các lỗi về thiếu CHECK constraint và vi phạm hard limit cần phải được giải quyết dứt điểm trước khi bàn giao làm nền tảng cho Milestone 2 (`apps/media-worker`) và Milestone 3 (`apps/web`).

---

## 3. Caveats (Phạm Vi & Giả Định)

1. Việc bổ sung CHECK constraint vào SQLite yêu cầu cập nhật file migration `0001_enterprise_identities_and_media.sql` và schema TypeScript trước khi deploy lên D1 thật.
2. Không phát hiện hành vi cố tình gian lận test (integrity violation bypass): bộ kiểm thử `party-media-schema.test.mjs` sử dụng SQLite in-memory thực tế, có kích hoạt foreign keys và kiểm tra các ràng buộc thực thụ. Việc thiếu CHECK constraint là sơ suất trong khâu triển khai, không phải ngụy tạo kết quả kiểm thử.

---

## 4. Conclusion & Review Verdict

**Phán quyết:** **`REQUEST_CHANGES`**

Hệ thống đã đạt được 85% chất lượng yêu cầu của Milestone 1. Worker 1 cần thực hiện các chỉnh sửa cụ thể bên dưới để đạt chuẩn phê duyệt (APPROVE).

---

## 5. Review Findings & Actionable Fixes

### Finding 1 [Critical] — Thiếu CHECK constraint trên cột `user_accounts.role`
- **Vị trí**: `packages/repositories/src/d1/schema/user-accounts.schema.ts` và `packages/repositories/migrations/0001_enterprise_identities_and_media.sql` (dòng 15-25).
- **Vấn đề**: Không có ràng buộc CHECK trong SQLite. Thử nghiệm ghi nhận chuỗi vai trò tùy ý (ví dụ `'SUPER_HACKER'`) vẫn được lưu trữ thành công.
- **Khắc phục**:
  1. Trong `user-accounts.schema.ts`: Import `check` từ `drizzle-orm/sqlite-core` và `sql` từ `drizzle-orm`. Thêm vào table callback:
     ```ts
     (table) => [
       check("user_accounts_role_check", sql`${table.role} IN ('ADMIN', 'STAFF', 'CUSTOMER')`),
     ]
     ```
  2. Trong `0001_enterprise_identities_and_media.sql`: Thêm `CONSTRAINT user_accounts_role_check CHECK(role IN ('ADMIN', 'STAFF', 'CUSTOMER'))` vào câu lệnh `CREATE TABLE IF NOT EXISTS user_accounts`.
  3. Thêm test case vào `party-media-schema.test.mjs` kiểm chứng việc từ chối insert role không hợp lệ.

### Finding 2 [Major] — Thiếu CHECK constraint trên cột `leads.status`
- **Vị trí**: `packages/repositories/src/d1/schema/leads.schema.ts` và `packages/repositories/migrations/0001_enterprise_identities_and_media.sql` (dòng 27-37).
- **Vấn đề**: Không có ràng buộc CHECK trong SQLite cho trạng thái Lead.
- **Khắc phục**:
  1. Trong `leads.schema.ts`: Import `check` và `sql`. Thêm vào table callback:
     ```ts
     check("leads_status_check", sql`${table.status} IN ('NEW', 'CONTACTED', 'SURVEY_SCHEDULED', 'QUOTED', 'WON', 'LOST')`)
     ```
  2. Trong `0001_enterprise_identities_and_media.sql`: Thêm `CONSTRAINT leads_status_check CHECK(status IN ('NEW', 'CONTACTED', 'SURVEY_SCHEDULED', 'QUOTED', 'WON', 'LOST'))` vào câu lệnh `CREATE TABLE IF NOT EXISTS leads_new`.
  3. Thêm test case vào `party-media-schema.test.mjs` kiểm chứng việc từ chối insert status không hợp lệ.

### Finding 3 [Major] — Vi phạm Hard Limits về độ dài file (> 100 dòng) và độ dài hàm (> 35 dòng)
- **Vị trí**:
  - `packages/repositories/src/d1/repositories/d1-lead-repository.ts` (112 dòng)
  - `packages/repositories/src/d1/repositories/d1-cms-project-repo.ts` (102 dòng)
  - Hàm `seedProjectsAndMedia` trong `packages/repositories/src/d1/seed-projects.ts` (42 dòng)
  - Hàm `createLead` trong `packages/repositories/src/d1/repositories/d1-lead-repository.ts` (36 dòng)
- **Vấn đề**: Vi phạm quy chuẩn `.agents/rules/code-organization.md`.
- **Khắc phục**:
  1. Trong `d1-lead-repository.ts`: Tách hàm helper tìm hoặc tạo identity `getOrCreateIdentityId(client, data, now)` ra `lead-mapper.ts` (hoặc helper cùng cấp) để rút gọn `createLead` dưới 25 dòng và đưa tổng số dòng file về <= 90 dòng.
  2. Trong `d1-cms-project-repo.ts`: Tách logic đồng bộ gallery `syncMedia` hoặc mapping helpers sang `project-mapper.ts` để đưa tổng số dòng file về <= 90 dòng.
  3. Trong `seed-projects.ts`: Tách khối lặp `seedProjectMedia(client, projectId, gallery, now)` thành hàm phụ riêng biệt để đưa `seedProjectsAndMedia` về <= 25 dòng.

### Finding 4 [Minor] — Thiếu snapshot `0001_snapshot.json` trong `migrations/meta/`
- **Vị trí**: `packages/repositories/migrations/meta/`
- **Vấn đề**: Chỉ có `0000_snapshot.json` và `_journal.json`. Khi chạy `drizzle-kit generate` không có TTY, công cụ bị dừng lại do không có snapshot biểu diễn trạng thái sau migration 1.
- **Khắc phục**: Cung cấp `0001_snapshot.json` đồng bộ với schema mới.

---

## 6. Adversarial Stress-Test Summary

**Mức độ rủi ro tổng thể**: **MEDIUM**

| Rủi ro / Giả định | Kịch bản tấn công | Kết quả kiểm thử | Đánh giá |
|-------------------|-------------------|------------------|----------|
| Role Authorization Bypass | Client gửi request SQL chèn user với role giả mạo | Thử nghiệm cho phép lưu `SUPER_HACKER` | **THẤT BẠI** (Cần fix Finding 1) |
| Invalid Lead Status Injection | Bot gửi status lạ làm hỏng pipeline CRM | Thử nghiệm cho phép lưu `BOGUS_STATUS` | **THẤT BẠI** (Cần fix Finding 2) |
| FK RESTRICT Protection | Xóa identity khi đang có user hoặc lead liên kết | SQLite ném lỗi `FOREIGN KEY constraint failed` | **VƯỢT QUA (PASS)** |
| 3NF Media Cascade Delete | Xóa dự án kiến trúc tiêu biểu | Toàn bộ bản ghi con trong `project_media` tự động bị xóa | **VƯỢT QUA (PASS)** |
| Project Year Range Check | Nhập năm dự án 1980 hoặc 2150 | SQLite ném lỗi `CHECK constraint failed` | **VƯỢT QUA (PASS)** |
| Unique Constraints | Insert trùng email hoặc trùng mã công trình `code` | SQLite ném lỗi `UNIQUE constraint failed` | **VƯỢT QUA (PASS)** |
| UUIDv7 Edge / Monotonic | Sinh khóa trên Cloudflare Workers Edge | Format chuẩn RFC 9562, sort tuần tự theo timestamp | **VƯỢT QUA (PASS)** |

---

## 7. Verification Method (Hướng Dẫn Kiểm Tra Độc Lập Cho Lần Review Tiếp Theo)

Sau khi Worker 1 khắc phục các lỗi trên, chạy các lệnh kiểm tra sau tại root:

```bash
# 1. Kiểm tra build package repositories
pnpm --filter @khangviet/repositories run build

# 2. Chạy test suite xác nhận các CHECK constraint mới hoạt động
pnpm --filter @khangviet/repositories test

# 3. Kiểm tra kiểm thử API auth hiện hữu
pnpm --filter api test:auth

# 4. Kiểm tra độ dài file và hàm bằng script đếm dòng
node -e "const fs = require('fs'); ['packages/repositories/src/d1/repositories/d1-lead-repository.ts', 'packages/repositories/src/d1/repositories/d1-cms-project-repo.ts', 'packages/repositories/src/d1/seed-projects.ts'].forEach(f => console.log(f, fs.readFileSync(f, 'utf8').split('\n').length));"
```
Mọi file phải có độ dài <= 100 dòng và mọi hàm phải <= 35 dòng.
