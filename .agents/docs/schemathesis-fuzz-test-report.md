# Báo Cáo Kết Quả Fuzz Testing & Tiến Độ Vá Lỗi API (C-A-R-T-S)

**Dự án**: Khang Viet Architecture & Construction - Headless CMS & CRM API  
**Công cụ**: Schemathesis v4.32.7  
**Target URL**: `http://127.0.0.1:8787/doc` (OpenAPI 3.0.0)  
**Phạm vi**: 17 Operations (Public & Admin Routes)  
**Thời gian cập nhật**: 31/10/2026

---

## 1. Bảng So Sánh Trước & Sau Khi Vá Lỗi (Before / After)

| Tiêu chí | Trước khi vá (Session hôm qua) | Sau khi vá (Hiện tại) | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Lỗi [R] 500 Server Crash (Null byte / Malformed JSON)** | 6 endpoints văng 500 | **0** (Đã bắt và trả về `400 Bad Request`) | ✅ **Triệt tiêu hoàn toàn** |
| **Lỗi [R] 500 Server Error (Unsupported Media Type)** | 2 endpoints văng 500 | **0** (Đã bắt và trả về `415`) | ✅ **Triệt tiêu hoàn toàn** |
| **Lỗi [R] 500 do Undefined property (.trim())** | 1 endpoint văng 500 (`POST /leads`) | **0** (Đã kiểm tra an toàn dữ liệu payload) | ✅ **Triệt tiêu hoàn toàn** |
| **Lỗi [C] Schema Mismatch (Zod error format)** | Lệch schema toàn bộ lỗi 400 | Đã chuẩn hóa qua `defaultValidationHook` | ✅ **Đồng bộ chuẩn ErrorResponse** |
| **Lỗi [T] Undocumented Status Code (400, 404)** | 9 endpoints thiếu khai báo | Đã khai báo đầy đủ vào Contracts | ✅ **Hoàn thành** |
| **Tổng số test cases đã sinh** | 396 test cases | **1.833 test cases** | 🚀 **Độ phủ tăng gấp 4.6 lần** |

---

## 2. Phân Tích Lỗi Chi Tiết Theo Mô Hình C-A-R-T-S

### 2.1. [C] Contract & Conformance (Tuân Thủ Hợp Đồng)
* **Vấn đề trước đây**: Khi `@hono/zod-openapi` validate dữ liệu thất bại, nó trả về `{ error: { name: "ZodError", issues: [...] } }`, trong khi API Contract khai báo `{ success: false, error: string }`.
* **Giải pháp đã áp dụng**: 
  - Tạo `apps/api/src/middlewares/validationHook.ts` với hàm `defaultValidationHook`.
  - Hook tự động lấy lỗi đầu tiên và format thành chuỗi thông báo gọn gàng, khớp 100% với `ErrorResponseSchema`.

### 2.2. [A] Authentication & Authorization (Xác Thực & Phân Quyền)
* **Trạng thái**: Middleware `adminAuthMiddleware` kiểm tra Bearer token hoạt động ổn định trên toàn bộ prefix `/api/v1/admin/*`.

### 2.3. [R] Reliability (Độ Tin Cậy & Chống Crash)
* **Vấn đề trước đây**: 
  1. Schemathesis gửi payload byte nhị phân `\x00` hoặc chuỗi JSON hỏng làm Cloudflare Worker / Hono throw syntax error chưa xử lý, dẫn đến `500 Internal Server Error`.
  2. Gửi Content-Type không mong muốn (như `text/plain`) vào endpoint JSON gây lỗi 500.
  3. Gửi payload thiếu trường bắt buộc khiến logic gọi `.trim()` văng exception.
* **Giải pháp đã áp dụng**:
  - Viết lại `apps/api/src/middlewares/errorHandler.ts` phân loại lỗi:
    - Bắt `SyntaxError` hoặc `Malformed JSON` ➔ Trả về `400 Bad Request`.
    - Bắt lỗi `Unsupported Media Type` ➔ Trả về `415 Unsupported Media Type`.
    - Bắt lỗi `not found` từ Repository ➔ Trả về `404 Not Found`.
  - Bổ sung guard clause kiểm tra `fullName` và `phone` trước khi xử lý trong `POST /api/v1/leads`.

### 2.4. [T] Type Safety & Boundary (An Toàn Kiểu Dữ Liệu Biên)
* **Vấn đề trước đây**: Khi gửi Query Parameter không đúng Enum (ví dụ `status=AAA`), API trả về 400 nhưng tài liệu OpenAPI chỉ định nghĩa 200.
* **Giải pháp đã áp dụng**:
  - Bổ sung định nghĩa `400` và `404` vào tất cả các route contracts (`adminLeadsContracts.ts`, `adminLeadsStatusContracts.ts`, `adminCmsProjectContracts.ts`, `adminCmsMetaContracts.ts`, `publicContent.ts`).

### 2.5. [S] Semantics & Edge Cases (Ngữ Nghĩa HTTP)
* **Hiện tượng ST204 (Wrong response to undeclared method)**:
  - Khi Schemathesis gửi method `TRACE` hoặc phương thức không khai báo, Hono router mặc định trả về `404 Not Found` thay vì `405 Method Not Allowed`.
  - **Nhận định**: Đây là hành vi tiêu chuẩn mặc định của hầu hết các web framework hiện đại (như Express, Hono, Fastify) và không ảnh hưởng đến độ tin cậy hay bảo mật của hệ thống.

---

## 3. Các File Đã Được Chỉnh Sửa & Chuẩn Hóa
1. [errorHandler.ts](file:///e:/lap_trinh/Project/website/KhangVietDesign/source/apps/api/src/middlewares/errorHandler.ts): Xử lý phân loại ngoại lệ 400, 404, 415, 500.
2. [validationHook.ts](file:///e:/lap_trinh/Project/website/KhangVietDesign/source/apps/api/src/middlewares/validationHook.ts): Format Zod validation errors thành chuỗi thông báo chuẩn.
3. [index.ts](file:///e:/lap_trinh/Project/website/KhangVietDesign/source/apps/api/src/index.ts): Tích hợp `defaultHook` và custom `404 Not Found` handler.
4. [publicContent.ts](file:///e:/lap_trinh/Project/website/KhangVietDesign/source/apps/api/src/routes/publicContent.ts): Bổ sung response code 400, 404.
5. [publicLeads.ts](file:///e:/lap_trinh/Project/website/KhangVietDesign/source/apps/api/src/routes/publicLeads.ts): Thêm guard clause kiểm tra payload an toàn.
6. [adminLeadsContracts.ts](file:///e:/lap_trinh/Project/website/KhangVietDesign/source/apps/api/src/routes/adminLeadsContracts.ts) & [adminLeadsStatusContracts.ts](file:///e:/lap_trinh/Project/website/KhangVietDesign/source/apps/api/src/routes/adminLeadsStatusContracts.ts): Tách file dưới 100 dòng theo đúng quy chuẩn tổ chức mã nguồn và bổ sung đầy đủ status responses.
7. [adminCmsProjectContracts.ts](file:///e:/lap_trinh/Project/website/KhangVietDesign/source/apps/api/src/routes/adminCmsProjectContracts.ts): Bổ sung response code 400, 404 cho các mutation CMS projects.
8. [adminCmsMetaContracts.ts](file:///e:/lap_trinh/Project/website/KhangVietDesign/source/apps/api/src/routes/adminCmsMetaContracts.ts): Bổ sung response code 400.
