# Khang Viet Design - Backend Architecture & API Routes Overview

> Tài liệu tổng hợp kiến trúc Backend, API Routes, Repositories và Database layer để các phiên làm việc tiếp theo nhanh chóng nắm bắt và tiếp tục phát triển.

---

## 1. Backend Tech Stack

- **Runtime & Deployment:** [Cloudflare Workers](https://workers.cloudflare.com/) via [Wrangler](https://developers.cloudflare.com/workers/wrangler/).
- **Web Framework:** [Hono v4](https://hono.dev/) (`hono`, `@hono/zod-openapi`).
- **Data Validation & Type Contracts:** [Zod](https://zod.dev/) & `@hono/zod-openapi` (Contract-first OpenAPI schemas).
- **API Documentation & Spec:**
  - OpenAPI Spec: `/doc` (JSON spec OpenAPI 3.0.0).
  - UI Docs Explorer: `/reference` ([Scalar](https://scalar.com/) API reference).
- **Authentication & Security:**
  - JWT Tokens (Web Crypto API `crypto.subtle` qua `tokenService.ts`).
  - Refresh Token lưu trữ qua HTTP-only Cookie (`/api/auth`).
  - Password Hashing: PBKDF2 with SHA-256 (`passwordService.ts`).
  - Role-based Access Control (RBAC): `authMiddleware.ts` & `adminAuthMiddleware.ts`.
- **Architecture Pattern:** Repository Pattern & Screaming Architecture qua monorepo packages.

---

## 2. Cấu Trúc Database & Repositories Layer

Hệ thống backend phân tách tầng Data Access qua các gói trong monorepo:

### 2.1. `@khangviet/repositories`
- **Factory Pattern (`getRepositories()`):** Cung cấp các repository instances (`cms`, `lead`, `user`).
- **Interfaces (`src/interfaces`):**
  - `ICmsRepository`: Quản lý landing page content, dự án (`projects`), pending changes, và sync status.
  - `ILeadRepository`: Quản lý khách hàng tiềm năng/tư vấn (danh sách, chi tiết, cập nhật status, xóa, tạo mới).
  - `IUserRepository`: Quản lý user, authentication data, tìm kiếm user an toàn (`findSafeById`, `findByEmail`).
- **Driver Hiện Tại:** `json` (In-memory/File-based JSON store với cơ chế Staging/Pending Changes cho CMS).
- **Sẵn sàng mở rộng Driver:** Interface hỗ trợ cắm thêm `d1` (Cloudflare D1) hoặc `sqlite`.

### 2.2. `@khangviet/data`
- Chứa seed data ban đầu và mock database files:
  - `landing-content.json`: Nội dung hero, giới thiệu, dự án, thông tin pháp lý.
  - `leads.json`: Danh sách dữ liệu liên hệ/khách hàng.
  - `users.json`: Thông tin tài khoản quản trị/nhân sự có băm mật khẩu.

### 2.3. On-demand Revalidation Service
- `apps/api/src/services/revalidateNotifier.ts`: Gọi webhook hoặc endpoint ISR (`cms-landing`) của frontend (`apps/web`) để revalidate cache khi CMS được cập nhật hoặc apply pending changes.

---

## 3. Bản Đồ API Endpoints (`apps/api/src/routes`)

### 3.1. Public Content Routes (`/api/v1/content`)
*Mounted at: `apps/api/src/routes/publicContent.ts`*

| Method | Endpoint | Summary & Chức năng | Request / Param | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/landing` | Lấy toàn bộ dữ liệu trang chủ (Hero, Intro, Projects, Legal,...) | Không | `{ success: true, data: LandingContent }` |
| `GET` | `/projects` | Lấy danh sách các dự án tiêu biểu | Không | `{ success: true, data: FeaturedProject[] }` |
| `GET` | `/projects/:id` | Lấy thông tin chi tiết một dự án theo ID | Param: `id` | `{ success: true, data: FeaturedProject }` (404 nếu không tìm thấy) |

---

### 3.2. Public Leads Routes (`/api/v1/leads`)
*Mounted at: `apps/api/src/routes/publicLeads.ts`*

| Method | Endpoint | Summary & Chức năng | Request / Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Khách gửi thông tin liên hệ / đăng ký nhận tư vấn | Body: `CreateLeadDto` (`fullName`, `phone`, `email?`, `serviceCategory?`, `projectScale?`, `message?`) | `201 Created`: `{ success: true, data: ContactLead, message: string }` |

---

### 3.3. Authentication Routes (`/api/auth`)
*Mounted at: `apps/api/src/routes/auth.ts`*

| Method | Endpoint | Summary & Chức năng | Request / Body | Response / Cookie |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/login` | Đăng nhập tài khoản quản trị / người dùng | Body: `{ email, password }` | Set Cookie: `refreshToken` (HttpOnly).<br>Body: `{ success: true, data: { accessToken, user } }` |
| `POST` | `/refresh` | Cấp mới Access Token bằng Refresh Token từ cookie | Cookie: `refreshToken` | Set Cookie: `refreshToken` mới.<br>Body: `{ success: true, data: { accessToken } }` |

---

### 3.4. Protected User Routes (`/api`)
*Mounted at: `apps/api/src/routes/protected.ts` (Requires `authMiddleware` Bearer Token)*

| Method | Endpoint | Summary & Chức năng | Headers | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/protected` | Kiểm tra trạng thái token và lấy thông tin user hiện tại | `Authorization: Bearer <accessToken>` | `{ success: true, data: { message, user } }` |

---

### 3.5. Admin CMS Routes (`/api/v1/admin/cms`)
*Mounted at: `apps/api/src/routes/adminCms.ts` (Requires `adminAuthMiddleware` - Role ADMIN)*

| Method | Endpoint | Summary & Chức năng | Request / Param / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/sync-status` | Kiểm tra trạng thái đồng bộ & số lượng pending changes | Không |
| `GET` | `/pending-changes` | Lấy danh sách các thay đổi nội dung đang chờ duyệt | Không |
| `POST` | `/apply-changes` | Xuất bản (Publish) toàn bộ thay đổi đang chờ & trigger revalidate web | Không |
| `DELETE` | `/pending-changes/:id` | Hủy bỏ một thay đổi CMS đang chờ | Param: `id` |
| `POST` | `/projects` | Thêm dự án mới (hỗ trợ Staging/Direct tùy mode) | Body: `CreateProjectDto` |
| `PUT` | `/projects/:id` | Cập nhật dự án theo ID | Param: `id`, Body: `UpdateProjectDto` |
| `DELETE` | `/projects/:id` | Xóa dự án theo ID | Param: `id` |
| `PUT` | `/hero` | Cập nhật danh sách slider / hero section | Body: `{ slides: HeroSlide[] }` |
| `PUT` | `/legal` | Cập nhật thông tin pháp lý doanh nghiệp | Body: `LegalInfo` |

---

### 3.6. Admin Leads Routes (`/api/v1/admin/leads`)
*Mounted at: `apps/api/src/routes/adminLeads.ts` (Requires `adminAuthMiddleware` - Role ADMIN)*

| Method | Endpoint | Summary & Chức năng | Request / Query / Param |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Lấy danh sách khách hàng liên hệ (có lọc & tìm kiếm) | Query: `status?`, `search?` |
| `GET` | `/:id` | Lấy chi tiết thông tin một Lead theo ID | Param: `id` |
| `PATCH` | `/:id/status` | Cập nhật trạng thái xử lý Lead (`NEW`, `CONTACTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) và ghi chú | Param: `id`, Body: `{ status, notes? }` |
| `DELETE` | `/:id` | Xóa bản ghi Lead theo ID | Param: `id` |

---

## 4. Lưu ý phát triển cho các chat sau (Guidelines)
- **Tách bạch Contracts và Handlers:** Mỗi router sử dụng `createRoute` định nghĩa schema rõ ràng trong `apps/api/src/contracts/` trước khi implement handler trong `apps/api/src/routes/`.
- **Validation Hook:** `defaultValidationHook` tự động map lỗi Zod validation trả về status `400` với format `{ success: false, error: ... }`.
- **Repository Abstraction:** Tuyệt đối không query dữ liệu trực tiếp trong routes mà gọi thông qua `getRepositories()`.
