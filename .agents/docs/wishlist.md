# Khang Việt Design - Backlog & Wishlist Features

Tài liệu này lưu trữ danh sách các tính năng và API cần phát triển, kiểm thử ở các giai đoạn tiếp theo (chưa đưa vào giao diện CMS hiện tại).

---

## 1. Quản Lý Đối Tác Tiêu Biểu Marquee (`TrustMarquee`)
- **Mục tiêu**: Cho phép admin thêm, sửa, xóa, sắp xếp danh sách các thương hiệu xuất hiện trên dải chạy vô tận `TrustMarquee`.
- **Nghiệp vụ backend cần làm**:
  - Bổ sung action `UPDATE_BRANDS` trong `ChangeActionType` (`packages/types/src/sync.ts`).
  - Thêm phương thức `updatePartnerBrands(brands: PartnerBrand[])` trong `ICmsRepository` và `JsonCmsRepository` (`packages/repositories`).
  - Xây dựng contract OpenAPI và route `PUT /api/v1/admin/cms/brands` trong `apps/api/src/routes/adminCms.ts`.
  - Thực hiện unit test và fuzzy test (`schemathesis`) đảm bảo API hoạt động ổn định 100%.
- **Giao diện frontend cần làm sau khi có API**:
  - Module quản lý danh sách thẻ thương hiệu (`BrandList`, `BrandModal`).

---

## 2. Hệ Thống Upload Hình Ảnh Trực Tiếp (Media Cloud Storage)
- **Mục tiêu**: Thay vì chỉ nhận URL web nhập tay, cho phép kéo thả ảnh và upload trực tiếp từ máy tính lên Cloudflare R2 hoặc AWS S3.
- **Nghiệp vụ backend cần làm**:
  - Endpoint `POST /api/v1/admin/media/upload` (presigned URL hoặc direct upload via Workers).
  - Tối ưu hóa kích thước ảnh (WebP format, nén dung lượng, resize tự động).
- **Giao diện frontend**:
  - Tích hợp File Dropzone vào `ImageUrlInput` thay thế cho thông báo nhắc nhở hiện tại.

---

## 3. Hệ Thống Xác Thực Đăng Nhập Quản Trị Viên (Admin Authentication)
- **Mục tiêu**: Kích hoạt lại bảo mật đa tầng cho đường dẫn `/admin` và API.
- **Nghiệp vụ**:
  - Chuyển `BYPASS_AUTH = false` trong `adminAuthMiddleware`.
  - Trang đăng nhập nhập Secret Key hoặc JWT Session Cookie tại `/admin/login`.

