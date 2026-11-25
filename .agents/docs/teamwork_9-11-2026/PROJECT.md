# Project: Khang Viet Design - Database Redesign, Dedicated Media Worker & Universal Media Dropzone

## Architecture
Hệ thống tuân thủ kiến trúc **Serverless Edge-Native** phân tán trên mạng lưới toàn cầu Cloudflare:
- **apps/api**: Hono v4 Web API Worker (Port 8787), kết nối Cloudflare D1 (`khangviet-db`) qua Drizzle ORM, cung cấp Auth JWT/Cookie, RBAC, CRM Leads, CMS Staging.
- **apps/media-worker**: Standalone Media Processing Micro-Worker (Port 8788), binding trực tiếp Cloudflare R2 (`khangviet-media`), sử dụng `@cf-wasm/photon` WebAssembly để nén WebP, resize Lanczos3, trích xuất metadata kích thước ảnh.
- **apps/web**: Next.js 16 Web & Admin Application (Port 3000), cung cấp giao diện quản trị CMS với `UniversalMediaUpload` hỗ trợ 4 chế độ nhập ảnh (Browse, Drag & Drop, Paste Clipboard Ctrl+V, External URL fetch), tải trực tiếp lên Media Worker.
- **packages/repositories**: Tầng Data Access Layer độc lập, triển khai Party / Identity Data Model và chuẩn hóa 3NF Projects & Media R2 với Drizzle ORM trên Cloudflare D1 SQLite.
- **packages/types**: Hợp đồng dữ liệu Zod schemas chia sẻ giữa API, Media Worker, Repositories và Web Client.

```
[Browser / Admin UI (apps/web)]
    │
    ├─► [Direct Client Upload] ────────► [apps/media-worker] ──► [Cloudflare R2: khangviet-media]
    │                                          │ (WebP Convert + Metadata)
    │                                          ▼
    │                              { public_url, r2_key, dimensions }
    │                                          │
    └─► [Submit Forms / Lead / Auth] ──► [apps/api] ──────────► [Cloudflare D1: khangviet-db]
                                                                  (identities, user_accounts,
                                                                   projects, project_media)
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Party/Identity Data Model | Triển khai bảng `identities` (INDIVIDUAL/ORGANIZATION, optional `tax_code`), `user_accounts` (auth PBKDF2, roles ADMIN/STAFF/CUSTOMER), `leads` (trỏ identity_id), `lead_activities` (CRM audit) | M1 | ORIGINAL_REQUEST §R1 |
| 2 | 3NF Projects & Media Normalization | Chuẩn hóa bảng `projects` (bỏ gallery JSON, year integer 1990-2100, status, sort_order, client_identity_id, xóa duplicate index code) và tạo bảng `project_media` (media_type, r2_key, public_url, caption, location, spec, dimensions) | M1 | ORIGINAL_REQUEST §R1 |
| 3 | D1 Migration & Seed Layer | Kịch bản SQL `0001_enterprise_identities_and_media.sql` di chuyển dữ liệu v0 an toàn, cập nhật `seed.ts`, và thêm script `"build"` vào `packages/repositories` & `apps/api` | M1 | ORIGINAL_REQUEST §R1, Survey |
| 4 | Backward-Compatible Repository Adapters | Cập nhật `D1UserRepository`, `D1LeadRepository`, `D1CmsProjectRepo` bằng JOIN adapters để bảo toàn 100% contracts và test suite `test:auth` hiện hữu | M1 | ORIGINAL_REQUEST §R1, Survey |
| 5 | Dedicated Cloudflare Media Worker Scaffold | Khởi tạo `apps/media-worker` với Hono v4, Cloudflare Workers runtime, `wrangler.jsonc` (port 8788), R2 binding `MEDIA_BUCKET` (`khangviet-media`), CORS whitelist | M2 | ORIGINAL_REQUEST §R2 |
| 6 | WASM WebP Compression & Image Optimization Engine | Tích hợp `@cf-wasm/photon` WebAssembly xử lý chuyển đổi JPEG/PNG/GIF/BMP sang WebP chuẩn, auto-resize bounding box, trích xuất metadata (width, height, aspect ratio, file size) | M2 | ORIGINAL_REQUEST §R2 |
| 7 | Media Worker Endpoints & Local Simulation | Cung cấp `POST /upload` (multipart/blob), `POST /fetch-external` (SSRF-safe URL fetch), `GET /file/*` preview, `GET /health`, và bộ kiểm thử `test-e2e.mjs` với Miniflare / local R2 | M2 | ORIGINAL_REQUEST §R2 |
| 8 | UniversalMediaUpload Component Architecture | Thiết kế component dropzone đa năng thay thế `ImageUrlInput.tsx`: hỗ trợ Browse file, Drag & Drop, Clipboard Paste (Ctrl+V), External URL fetch, kèm 5 trạng thái UI và progress indicator | M3 | ORIGINAL_REQUEST §R3 |
| 9 | Admin CMS Media Integration & Backward Compatibility | Tích hợp `UniversalMediaUpload` vào `ProjectFormFields.tsx`, `ProjectGalleryRow.tsx`, `HeroSlideItem.tsx`, bảo đảm public website render ảnh liền mạch từ cả local path và R2 CDN | M3 | ORIGINAL_REQUEST §R3 |
| 10 | E2E Verification & Integration Test Suite | Kiểm thử toàn diện toàn bộ repo: build sạch (`@khangviet/repositories`, `api`, `web`, `media-worker`), chạy migration D1 SQLite, test Party/Media repository, test Media Worker, kiểm thử regression | M4 | ORIGINAL_REQUEST §Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Database Schema & Migrations Layer | Triển khai Party Model (`identities`, `user_accounts`, `leads`, `lead_activities`), chuẩn hóa 3NF `projects` & `project_media`, D1 migration SQL, seed script, repository adapters, build scripts, unit tests | none | DONE |
| 2 | M2: Dedicated Cloudflare Media Worker | Xây dựng `apps/media-worker` với Hono v4, R2 binding, `@cf-wasm/photon` WASM WebP encoder, endpoints upload & fetch-external, SSRF defense, automated local tests | none | DONE |
| 3 | M3: Admin UI Universal Media Dropzone | Nâng cấp `ImageUrlInput` thành `UniversalMediaUpload` (Browse, Drag-Drop, Paste Ctrl+V, URL fetch), tích hợp Media Worker, modular <100 lines/file, Tailwind v4, backward compatibility | M2 | DONE |
| 4 | M4: E2E Integration & Verification Suite | Kiểm thử toàn diện toàn bộ monorepo (builds, migration, auth tests, media upload tests, public display), kiểm thử đối kháng và forensic integrity audit | M1, M2, M3 | DONE |

## Interface Contracts

### 1. `apps/media-worker` ↔ Client (`apps/web`)
- **Base URL**: `NEXT_PUBLIC_MEDIA_WORKER_URL` (local: `http://127.0.0.1:8788`, prod: `https://media.khangviet.vn`)
- **Endpoints**:
  + `POST /upload`: Content-Type `multipart/form-data` (field `file`) HOẶC raw binary blob (`image/png`, `image/jpeg`, etc.).
  + `POST /fetch-external`: Content-Type `application/json`, body: `{ "url": string }`.
- **Response Format**:
  ```json
  {
    "success": true,
    "data": {
      "public_url": "http://127.0.0.1:8788/file/projects/abc-123.webp",
      "r2_key": "projects/abc-123.webp",
      "width_px": 1920,
      "height_px": 1080,
      "aspect_ratio": "landscape",
      "file_size_bytes": 145230,
      "media_type": "GALLERY_IMAGE"
    }
  }
  ```

### 2. `packages/repositories` ↔ `apps/api`
- **User Repository Contract (`IUserRepository`)**:
  - `findByEmail(email: string): Promise<User | null>` (JOIN `user_accounts` + `identities`)
  - `findSafeById(id: string): Promise<SafeUser | null>` (JOIN `user_accounts` + `identities`)
- **Lead Repository Contract (`ILeadRepository`)**:
  - `createLead(dto: CreateLeadDto): Promise<ContactLead>` (Upsert `identities`, insert `leads`)
  - `getLeads(filter?): Promise<ContactLead[]>` (JOIN `leads` + `identities`)
- **CMS Project Repository Contract (`ICmsProjectRepository`)**:
  - `getProjects(): Promise<FeaturedProject[]>` (Query `projects` + `project_media`, map to `ProjectGalleryItem[]`)
  - `createProject(dto: CreateProjectDto): Promise<FeaturedProject>` (Insert `projects` + batch insert `project_media`)

## Code Layout
- `packages/repositories/src/d1/schema/`:
  - `identities.schema.ts`, `user-accounts.schema.ts`, `leads.schema.ts`, `lead-activities.schema.ts`, `projects.schema.ts`, `project-media.schema.ts`, `cms.schema.ts`
- `packages/repositories/src/d1/repositories/`:
  - `D1UserRepository.ts`, `D1LeadRepository.ts`, `D1CmsProjectRepo.ts`, `D1CmsMetaRepo.ts`
- `packages/repositories/migrations/`:
  - `0001_enterprise_identities_and_media.sql`
- `apps/media-worker/`:
  - `wrangler.jsonc`, `package.json`, `tsconfig.json`, `src/index.ts`, `src/routes/upload.ts`, `src/routes/fetch-external.ts`, `src/services/image-processor.ts`, `src/services/r2-storage.ts`, `src/services/ssrf-validator.ts`, `test-e2e.mjs`
- `apps/web/components/ui/media-upload/`:
  - `UniversalMediaUpload.tsx`, `MediaDropzoneView.tsx`, `MediaPreviewCard.tsx`, `MediaUrlFetchBar.tsx`, `useMediaUpload.ts`, `types.ts`, `ImageUrlInput.tsx`
