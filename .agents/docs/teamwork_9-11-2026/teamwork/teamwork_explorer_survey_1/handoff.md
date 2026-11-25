# Handoff Report: Database Schema & Migrations Layer Survey (Milestone 1)

**Agent:** Explorer 1 (Database & Schema Explorer)  
**Conversation ID:** c8761ffa-33e7-4615-90ab-7a5f78beb146  
**State Folder:** `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_explorer_survey_1`  
**Target Milestone:** Milestone 1 (Database Schema & Migrations Layer)  
**Date:** 2026-11-08  

---

## 1. Observation (Quan Sát Thực Tế)

1. **Hiện Trạng Schema (`packages/repositories/src/d1/schema/*`):**
   - `users.schema.ts` (Dòng 9-24): `usersTable` gộp chung cả thông tin tài khoản (`email`, `password`, `role`) lẫn hồ sơ cá nhân (`name`, `phone`). Tồn tại index trùng lặp trên `email` (vừa `unique()`, vừa `index("idx_users_email")`).
   - `leads.schema.ts` (Dòng 9-29): `leadsTable` lưu trực tiếp `full_name`, `phone`, `email`, `message`, `status`, `notes`.
   - `projects.schema.ts` (Dòng 9-35): `projectsTable` lưu `gallery` dưới dạng JSON array (`mode: 'json'`), `year` kiểu `text`, và index trùng lặp trên cột `code` (`unique()` + `index("idx_projects_code")`).
   - `cms.schema.ts` (Dòng 8-33): `cmsMetadataTable` và `pendingChangesTable` quản lý cấu hình landing và hàng đợi staging.
2. **Hiện Trạng Migration & Seed:**
   - `migrations/0000_magenta_midnight.sql`: Khởi tạo 5 bảng gốc (`users`, `leads`, `projects`, `cms_metadata`, `pending_changes`).
   - `migrations/meta/_journal.json`: Journal entry `0000_magenta_midnight` ở version 7, dialect sqlite.
   - `src/d1/seed.ts` (Dòng 17-98): Khởi tạo seed data từ `@khangviet/data` (`initialUsers`, `initialLeads`, `initialLandingContent.featuredProjects`).
3. **Hiện Trạng Types & Contracts (`packages/types`):**
   - `user.ts` (Dòng 8): `UserRoleSchema = z.enum(["ADMIN", "CUSTOMER"])` (thiếu vai trò `"STAFF"`).
   - `project.ts` (Dòng 3-11): `ProjectGalleryItemSchema` chứa `{ id, src, caption, location, spec, aspect }`.
   - `project.ts` (Dòng 13-28): `FeaturedProjectSchema` chứa `year: z.string()` và `gallery: z.array(ProjectGalleryItemSchema)`.
4. **Hiện Trạng API & Test Suite (`apps/api`):**
   - `apps/api/test-e2e.mjs`: Test suite 12 bước kiểm thử luồng auth, RBAC, protected route, refresh token cookie rotation, CORS, rate limiter, PBKDF2 hash.
   - Lệnh `pnpm --filter api test:auth` đã chạy thử nghiệm và **PASS 100%**.
   - Lệnh `pnpm --filter @khangviet/repositories test` chạy `node --test test/*.test.mjs` và **PASS 100%**.
   - Lệnh `pnpm --filter web build` (`next build --webpack`) biên dịch thành công 7 static pages với code 0.
5. **Thiếu Script Build Trong Package Configuration:**
   - `packages/repositories/package.json` và `apps/api/package.json` không có trường `"build"` trong `scripts`, khiến lệnh `pnpm --filter @khangviet/repositories build` và `pnpm --filter api build` báo lỗi `ERR_PNPM_RECURSIVE_RUN_NO_SCRIPT`. Khi chạy `pnpm exec tsc --noEmit` trực tiếp, cả 2 package đều biên dịch không lỗi (Exit code 0).

---

## 2. Logic Chain (Chuỗi Lập Luận)

1. **Từ Quan sát 1 & Yêu cầu R1 (Party Model) ➔ Giải pháp Repository Adapter:**
   - Tách `users` thành `identities` (con người/pháp nhân) và `user_accounts` (xác thực) sẽ làm thay đổi cấu trúc bảng trong D1.
   - `apps/api/src/services/authService.ts` và `apps/api/src/routes/protected.ts` đang phụ thuộc vào `IUserRepository` trả về kiểu `User` và `SafeUser` (có `info.name` và `info.phone`).
   - *Lập luận:* Bằng cách triển khai **Repository Adapter** trong `D1UserRepository` sử dụng `INNER JOIN user_accounts ON user_accounts.identity_id = identities.id`, repo vẫn trả về đối tượng `User` và `SafeUser` hoàn toàn tương thích. Do đó, toàn bộ API Auth và test suite `test:auth` không bị phá vỡ.
2. **Từ Quan sát 1 & Yêu cầu CRM (Leads + Lead Activities) ➔ Adapter cho LeadRepo:**
   - Tách thông tin khách hàng sang `identities` và thêm bảng `lead_activities` ghi nhật ký tư vấn.
   - `apps/api/src/routes/publicLeads.ts` và `adminLeads.ts` nhận DTO `CreateLeadDto` (`fullName`, `phone`, `email`,...) và trả về `ContactLead`.
   - *Lập luận:* `D1LeadRepository.createLead()` sẽ tự động tìm/tạo bản ghi `identities` theo số điện thoại, sau đó tạo bản ghi `leads` liên kết `identity_id`. Các hàm đọc (`getLeads`, `getLeadById`) thực hiện `JOIN identities` để trả về đúng định dạng `ContactLead`. Điều này giữ 100% tương thích ngược cho cả khách gửi form và admin xem CRM.
3. **Từ Quan sát 1, 3 & Yêu cầu 3NF Projects/Media ➔ Bảo toàn Metadata:**
   - Bảng `projects` loại bỏ cột `gallery` JSON, đổi `year` sang `integer`, thêm `status`, `sort_order`, `client_identity_id`.
   - Toàn bộ ảnh đính kèm chuyển sang bảng mới `project_media` (FK -> `projects.id` ON DELETE CASCADE).
   - Component `ProjectLightboxModal` và `ProjectGalleryViewer` trên Web client hiển thị cả `item.location` và `item.spec` của từng ảnh.
   - *Lập luận:* Bảng `project_media` bắt buộc phải có các cột `location` và `spec` (nullable) bên cạnh `caption`, `public_url`, `aspect_ratio`. Trong `D1CmsProjectRepo`, khi gọi `getProjects()` hoặc `getProjectById()`, repo sẽ truy vấn `project_media` và map thành `ProjectGalleryItem[]` để gắn vào thuộc tính `gallery` của `FeaturedProject`. Nhờ đó, cả Web frontend và Admin UI đều hoạt động bình thường mà không mất dữ liệu.
4. **Từ Quan sát 5 ➔ Bổ sung Scripts Build:**
   - Để thỏa mãn Acceptance Criteria ("Lệnh build toàn bộ các package liên quan thực thi thành công"), cần thêm `"build": "tsc --noEmit"` vào `packages/repositories/package.json` và `"build": "wrangler deploy --dry-run --outdir=dist"` vào `apps/api/package.json`.

---

## 3. Caveats (Điểm Lưu Ý & Giả Định)

1. **Trường `tax_code` trong `identities`:** Cấu hình là nullable, chỉ yêu cầu điền khi đối tác là tổ chức doanh nghiệp (`identity_type = 'ORGANIZATION'`). Cá nhân (`INDIVIDUAL`) mặc định để `null`.
2. **SQLite Migration trên Cloudflare D1:** SQLite không hỗ trợ `ALTER TABLE MODIFY COLUMN`. Script migration `0001_enterprise_identities_and_media.sql` cần dùng kỹ thuật tạo bảng mới (`leads_new`, `projects_new`), di chuyển dữ liệu (`INSERT INTO ... SELECT ...`), drop bảng cũ và đổi tên bảng trong khối `PRAGMA foreign_keys = OFF;`.
3. **Mock Store (`packages/repositories/src/json/*`):** Cần cập nhật nhẹ các helper trong `mockStore` để hỗ trợ cả mô hình mới khi chạy ở chế độ driver `"json"`.

---

## 4. Conclusion (Kết Luận & Hướng Dẫn Hành Động Cho Milestone 1)

1. **Cấu trúc Schema mới đã hoàn tất thiết kế:**
   - `identities.schema.ts`: Thực thể con người / đối tác B2B.
   - `user-accounts.schema.ts`: Tài khoản đăng nhập (PBKDF2 hash, role ADMIN/STAFF/CUSTOMER, liên kết `identity_id`).
   - `leads.schema.ts`: Leads liên kết `identity_id`.
   - `lead-activities.schema.ts`: Bảng nhật ký xử lý lead (FK -> leads CASCADE).
   - `projects.schema.ts`: Chuẩn hóa 3NF, bỏ gallery, `year` integer, thêm `status`, `sort_order`, `client_identity_id`, xóa duplicate index trên `code`.
   - `project-media.schema.ts`: Quản lý tài sản media R2 với đầy đủ `public_url`, `r2_key`, `caption`, `location`, `spec`, `aspect_ratio`.
2. **Tương thích ngược 100%:** Được bảo đảm qua Repository Adapters (`D1UserRepository`, `D1LeadRepository`, `D1CmsProjectRepo`), không gây breaking changes cho `apps/api` hay `apps/web`.
3. **Migration & Seed Script:** Đã soạn thảo đầy đủ kịch bản SQL `0001_enterprise_identities_and_media.sql` và hướng dẫn cập nhật `seed.ts`.
4. **Sẵn sàng thực thi:** Builder / Implementer có thể bắt tay triển khai Milestone 1 trực tiếp theo bản thiết kế chi tiết trong `analysis.md`.

---

## 5. Verification Method (Phương Pháp Kiểm Tra & Độc Lập Xác Minh)

Để kiểm tra và xác minh độc lập Milestone 1 sau khi triển khai:

1. **Kiểm tra TypeScript & Build:**
   ```bash
   pnpm exec tsc --noEmit -p packages/repositories/tsconfig.json
   pnpm exec tsc --noEmit -p apps/api/tsconfig.json
   pnpm --filter web build
   ```
   *Kỳ vọng:* Không có lỗi cú pháp hay kiểu dữ liệu, exit code 0.

2. **Kiểm tra Drizzle Schema & Migration Generation:**
   ```bash
   pnpm --filter @khangviet/repositories run db:generate
   ```
   *Kỳ vọng:* Drizzle Kit đọc schema thành công không báo lỗi.

3. **Chạy Bộ Kiểm Thử Tự Động:**
   ```bash
   pnpm --filter @khangviet/repositories test
   pnpm --filter api test:auth
   ```
   *Kỳ vọng:* Toàn bộ 12 test cases auth và các test UUIDv7 / Party schema đều PASS 100%.
