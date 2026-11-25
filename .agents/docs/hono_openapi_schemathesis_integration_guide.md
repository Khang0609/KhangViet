# Hướng Dẫn Tích Hợp OpenAPI & Fuzz Testing Cho Hono (Từ Bước 2)

Tài liệu này định hình lộ trình triển khai từ Bước 2 trở đi, tiếp nối việc bạn đã chuẩn hóa schema và types bằng Zod trong shared package.

---

## Tổng quan các công cụ cần bổ sung

- **`@hono/zod-openapi`** (Cài đặt phía API package): Cầu nối giữa Hono router và Zod schemas, tự động validate runtime và kết xuất OpenAPI Specification (OAS).
- **`schemathesis`** (CLI công cụ kiểm thử): Động cơ fuzz testing tự động đọc OpenAPI spec để sinh hàng trăm payload kiểm tra happy path lẫn edge cases.

---

## Bước 1: Tích Hợp Thư Viện OpenAPI Vào API Package

### Mục tiêu

Chuyển đổi các route xử lý sang chuẩn có khai báo hợp đồng (contract-driven routes), sử dụng trực tiếp các Zod schema được xuất từ shared package.

### Các công việc chính:

1. **Bổ sung dependency**:
   - Cài đặt thư viện `@hono/zod-openapi` vào package API.
2. **Khởi tạo Router mở rộng**:
   - Thay vì dùng instance router thông thường của Hono, chuyển sang dùng instance được hỗ trợ bởi OpenAPI để hỗ trợ biên dịch route metadata.
3. **Khai báo Contract cho từng endpoint**:
   - Sử dụng Zod schemas từ shared package để định nghĩa rõ ràng:
     - Cấu trúc tham số (path params, query params).
     - Cấu trúc payload gửi lên (request body).
     - Cấu trúc dữ liệu và mã trạng thái trả về (200, 201 cho happy path; 400, 404 cho error path).
4. **Gắn logic xử lý (Handler)**:
   - Viết logic xử lý tương ứng với contract đã định nghĩa. Dữ liệu đầu vào lúc này đã được thư viện tự động kiểm tra tính hợp lệ ở runtime trước khi chạm tới tầng repositories hoặc mock database.

---

## Bước 2: Xuất OpenAPI Specification JSON Endpoint

### Mục tiêu

Cung cấp một đường dẫn HTTP tĩnh/động chứa toàn bộ mô tả API dưới dạng JSON chuẩn quốc tế để công cụ testing có thể đọc hiểu.

### Các công việc chính:

1. **Cấu hình metadata chung**:
   - Khai báo thông tin cơ bản của hệ thống API (phiên bản API, tiêu đề, mô tả tóm tắt).
2. **Expose endpoint tài liệu**:
   - Khai báo một đường dẫn chuyên biệt trên server (thường đặt là `/doc` hoặc `/openapi.json`).
   - Kiểm tra bằng trình duyệt hoặc HTTP client để đảm bảo endpoint trả về đúng định dạng JSON OpenAPI v3 với đầy đủ các schemas và routes đã map ở Bước 2.

---

## Bước 3: Chạy Fuzz Testing Bằng Schemathesis CLI

### Mục tiêu

Chạy kiểm thử hộp đen tự động dựa trên spec mà không cần viết test script thủ công.

### Các công việc chính:

1. **Khởi động API Server**:
   - Chạy API ở môi trường local hoặc staging có kết nối với mock JSON database / repository.
2. **Chạy Schemathesis CLI**:
   - Có thể chạy trực tiếp qua công cụ chạy lệnh tức thì (như `npx` hoặc trình quản lý package tương đương) mà không bắt buộc phải cài cứng vào `devDependencies`:
     - Trỏ CLI trực tiếp vào URL chứa file spec (ví dụ: `http://localhost:<PORT>/doc`).
     - Kích hoạt chế độ kiểm tra toàn diện (`--checks all`) để rà soát:
       - **Happy path**: Đảm bảo phản hồi thực tế trả về khớp 100% với schema đã định nghĩa.
       - **Edge cases**: Kiểm tra các input biên (ký tự lạ, số âm, overflow, trường thiếu, sai kiểu dữ liệu) xem server có trả về mã 4xx đúng chuẩn hay không.
       - **Crash checks**: Phát hiện bất kỳ request nào khiến server bị sập và trả về lỗi `500 Internal Server Error`.
3. **Khắc phục lỗi và lặp lại**:
   - Đọc báo cáo payload lỗi do CLI xuất ra.
   - Điều chỉnh độ chặt của Zod schema ở shared package hoặc bổ sung guard clause trong logic API cho đến khi CLI hoàn thành 100% test cases xanh.
