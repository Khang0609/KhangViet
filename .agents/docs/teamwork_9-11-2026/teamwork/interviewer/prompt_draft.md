Tái thiết kế kiến trúc Database (Party/Identity Data Model, chuẩn hóa 3NF tách Projects & Media R2), xây dựng dedicated Cloudflare Media Worker xử lý nén WebP, và nâng cấp Admin UI với Universal Media Dropzone cho hệ thống Khang Việt Design.

Integrity mode: development

## Requirements

### R1. Database Schema & Migrations Layer (`packages/repositories`)
- Triển khai Party / Identity Data Model:
  + Bảng `identities`: `id (UUIDv7)`, `full_name`, `phone`, `email` (nullable), `tax_code` (nullable), `identity_type` (INDIVIDUAL/ORGANIZATION), `address`, `notes`, `created_at`, `updated_at`.
  + Bảng `user_accounts`: `id (UUIDv7)`, `identity_id` (FK -> identities), `email` (UK), `password_hash`, `role` (CHECK: ADMIN, STAFF, CUSTOMER), `is_active` (1/0), `created_at`, `updated_at`.
  + Bảng `leads`: `id (UUIDv7)`, `identity_id` (FK -> identities), `service_category`, `project_scale`, `initial_message`, `status` (CHECK), `created_at`, `updated_at`.
  + Bảng `lead_activities`: `id (UUIDv7)`, `lead_id` (FK -> leads CASCADE), `staff_identity_id` (FK -> identities), `action_type`, `content`, `created_at`.
- Tách quan hệ Projects & Media (Chuẩn hóa 3NF):
  + Bảng `projects`: Bỏ cột `gallery` JSON, đổi `year` sang `integer`, thêm `status` (CHECK: DRAFT, PUBLISHED, ARCHIVED), `sort_order`, `client_identity_id`, `created_at`, `updated_at`. Xóa duplicate index trên unique column `code`.
  + Bảng `project_media`: `id (UUIDv7)`, `project_id` (FK -> projects CASCADE), `media_type`, `r2_key`, `public_url`, `caption`, `aspect_ratio`, `width_px`, `height_px`, `file_size_bytes`, `sort_order`, `created_at`.
- Sinh migration D1 SQL và cập nhật Drizzle schema, repositories, services & seed script tương thích với schema mới.

### R2. Dedicated Cloudflare Media Worker (`apps/media-worker`)
- Thiết lập micro-worker độc lập với Cloudflare Workers runtime, cấu hình `wrangler.jsonc` và R2 binding `MEDIA_BUCKET` (`khangviet-media`).
- Cung cấp endpoints nhận upload file (multipart), clipboard paste (raw image blob) và fetch external URL.
- Nén và tối ưu hóa ảnh sang định dạng WebP, lưu trữ vào Cloudflare R2 bucket và trả về public URL cùng metadata kích thước.

### R3. Admin UI Universal Media Dropzone (`apps/web`)
- Nâng cấp `ImageUrlInput` thành `UniversalMediaUpload` component: hỗ trợ Browse file, Drag & Drop, Clipboard Paste (Ctrl+V) và External URL dán link.
- Tích hợp gọi trực tiếp tới Cloudflare R2 Media Worker thay thế việc bypass file path tạm thời.
- Đảm bảo tương thích ngược để không làm gián đoạn hiển thị dữ liệu dự án trên các trang web hiện hữu.

## Acceptance Criteria

### Verification & Testing
- [ ] Lệnh build toàn bộ các package liên quan (`pnpm --filter @khangviet/repositories build`, `pnpm --filter api build`, `pnpm --filter web build`) thực thi thành công không có lỗi TypeScript hay cú pháp.
- [ ] D1 migration SQL hợp lệ và thực thi thành công trên SQLite / local D1.
- [ ] Toàn bộ automated tests hiện hữu của repo vượt qua thành công (`test:auth`, tests trong repositories).
- [ ] Có bộ kiểm thử tự động (unit/integration tests) mới kiểm tra tính toàn vẹn của Identity/Party schema, D1 repositories, endpoints của `apps/media-worker` trên môi trường giả lập cục bộ (Local Miniflare / local D1 & local R2).
- [ ] Component `UniversalMediaUpload` hỗ trợ đầy đủ 4 chế độ nhập (Browse, Drag & Drop, Paste clipboard, External URL fetch) và hiển thị preview sau khi upload.