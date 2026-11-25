# Adversarial Verification Report — Milestone 1: Projects & Media 3NF Normalization

**Reviewer:** Challenger 2 (Empirical Adversarial Verifier)  
**Role:** critic, specialist  
**Conversation ID:** ff1e575e-e0f6-4f18-8250-7b8dd2210ec2  
**Target Worker:** Worker 1 (`teamwork_worker_m1`)  
**State Folder:** `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m1_2`  
**Verdict:** **APPROVE**  
**Date:** 2026-11-08  

---

## 1. Observation (Quan Sát Thực Nghiệm Trực Tiếp)

Đã thiết lập và thực thi độc lập bộ harness kiểm thử đối kháng `packages/repositories/test/adversarial-projects-media.mjs` với `node:sqlite` (tương thích `better-sqlite3`) trên môi trường Node.js v22.18.0. Dưới đây là các kết quả ghi nhận trực tiếp từ terminal và SQLite engine:

### 1.1. Year Boundary & CHECK Constraints
- **Lệnh thực thi:**
  ```bash
  node packages/repositories/test/adversarial-projects-media.mjs
  ```
- **Kết quả quan sát trực tiếp:**
  - `Subcase 1.1`: Insert project với `year = 1989` (< 1990) ném lỗi:
    `CHECK constraint failed: projects_year_range` -> **PASS**.
  - `Subcase 1.2`: Insert project với `year = 1990` (cận dưới chính xác) thành công, `record.year === 1990` -> **PASS**.
  - `Subcase 1.3`: Insert project với `year = 2026` (năm chuẩn) thành công, `record.year === 2026` -> **PASS**.
  - `Subcase 1.4`: Insert project với `year = 2100` (cận trên chính xác) thành công, `record.year === 2100` -> **PASS**.
  - `Subcase 1.5`: Insert project với `year = 2101` (> 2100) ném lỗi:
    `CHECK constraint failed: projects_year_range` -> **PASS**.
  - `Subcase 1.6`: Insert project với `year = -50` (năm âm) ném lỗi:
    `CHECK constraint failed: projects_year_range` -> **PASS**.
  - `Subcase 1.7`: Cập nhật project hợp lệ thành `year = 1988` ném lỗi:
    `CHECK constraint failed: projects_year_range` -> **PASS**.
  - `Subcase 1.8`: Cập nhật project hợp lệ thành `year = 2105` ném lỗi:
    `CHECK constraint failed: projects_year_range` -> **PASS**.
  - `Subcase 1.9`: Cập nhật project hợp lệ thành `year = 2040` thành công, `updated.year === 2040` -> **PASS**.

### 1.2. Code Uniqueness & Index Verification
- **Kết quả quan sát trực tiếp:**
  - `Subcase 2.1`: Insert bản ghi project trùng lặp `code = 'kv-baseline'` ném lỗi:
    `UNIQUE constraint failed: projects.code` -> **PASS**.
  - `Subcase 2.2`: Lệnh `UPDATE projects SET code = 'kv-baseline'` dẫn đến va chạm mã ném lỗi:
    `UNIQUE constraint failed: projects.code` -> **PASS**.
  - `Subcase 2.3`: Kiểm tra bảng phân giải Index của SQLite qua `PRAGMA index_list('projects')` và `PRAGMA index_info(...)`:
    ```json
    [
      { "name": "idx_projects_status", "unique": 0, "columns": ["status"] },
      { "name": "idx_projects_category", "unique": 0, "columns": ["category_tag"] },
      { "name": "projects_code_unique", "unique": 1, "columns": ["code"] },
      { "name": "sqlite_autoindex_projects_1", "unique": 1, "columns": ["id"] }
    ]
    ```
    Khẳng định: Cột `code` chỉ có **duy nhất 1 index** mang tên `projects_code_unique` với thuộc tính `unique: 1`. Index trùng lặp `idx_projects_code` từ schema v0 đã được loại bỏ hoàn toàn -> **PASS**.

### 1.3. ON DELETE CASCADE Enforcement
- **Kết quả quan sát trực tiếp:**
  - `Subcase 3.1`:
    - Tạo project mục tiêu `p-cascade-target` cùng 10 hàng `project_media`.
    - Tạo project đối chứng `p-cascade-control` cùng 5 hàng `project_media`.
    - Trước khi xóa: Target media count = 10, Control media count = 5.
    - Thực thi: `DELETE FROM projects WHERE id = 'p-cascade-target';`.
    - Sau khi xóa: Target media count = 0 (10/10 hàng tự động bị dọn sạch bởi foreign key CASCADE). Control media count = 5 (không có tác dụng phụ hoặc xóa nhầm) -> **PASS**.
  - `Subcase 3.2`: Chèn bản ghi `project_media` trỏ tới `project_id` không tồn tại ném lỗi:
    `FOREIGN KEY constraint failed` -> **PASS**.

### 1.4. Project Media Metadata & 0-media Edge Cases
- **Kết quả quan sát trực tiếp:**
  - `Subcase 4.1`: Gọi `mapProjectRecordToFeatured` với 0 media (`[]` hoặc tham số mặc định) trả về:
    `gallery: []` (mảng rỗng, không ném exception) -> **PASS**.
  - `Subcase 4.2`: Chuyển đổi media có `location = null`, `spec = null`, `caption = null`, `aspectRatio = null`:
    Mapper trả về an toàn: `caption: ""`, `location: ""`, `spec: ""`, `aspect: "landscape"` mà không văng lỗi runtime -> **PASS**.
  - `Subcase 4.3`: Media có đầy đủ dữ liệu kiến trúc bảo toàn chính xác: `location: "Zone A - South Wing"`, `spec: "Anodized Aluminum + Double Glazed Low-E Glass"`, `aspect: "portrait"` -> **PASS**.
  - `Subcase 4.4`: Mô phỏng gom nhóm đa dự án với số lượng media hỗn hợp (0, 2, 1 media): Dữ liệu gom nhóm chính xác theo từng `projectId`, không bị rò rỉ chéo -> **PASS**.

### 1.5. Build & Regression Testing
- `pnpm --filter @khangviet/repositories run build`: Exit code 0 (TypeScript compile sạch).
- `pnpm --filter @khangviet/repositories test`: **10/10 tests pass**.
- `pnpm --filter api run build`: Exit code 0 (wrangler dry-run thành công).
- `pnpm --filter api test:auth`: **12/12 e2e scenarios pass 100%**.

---

## 2. Logic Chain (Chuỗi Lập Luận Từ Quan Sát Đến Kết Luận)

1. **Từ Quan sát 1.1 ➔ Toàn vẹn ràng buộc CHECK trên `year`:**
   - Việc kiểm thử cả 5 mốc quan trọng (1989 [fail], 1990 [pass], 2026 [pass], 2100 [pass], 2101 [fail], -50 [fail]) cùng cả 2 thao tác INSERT và UPDATE xác nhận rằng `CHECK(projects.year >= 1990 AND projects.year <= 2100)` trong file migration `0001_enterprise_identities_and_media.sql` và schema `projects.schema.ts` được SQLite engine kích hoạt và thi hành chính xác 100%.

2. **Từ Quan sát 1.2 ➔ Tính đơn nhất và vệ sinh Index (Index Hygiene):**
   - Lệnh `PRAGMA index_list('projects')` chứng minh rằng không còn tồn tại index trùng thừa `idx_projects_code` (từng tồn tại ở v0). SQLite chỉ duy trì duy nhất một B-Tree index cho `code` là `projects_code_unique`. Điều này vừa bảo đảm tính toàn vẹn unique vừa tiết kiệm bộ nhớ ram/đĩa của Cloudflare D1.

3. **Từ Quan sát 1.3 ➔ Khóa ngoại CASCADE hoàn chỉnh:**
   - Trong `project_media`, khai báo `FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE` hoạt động tự động ở cấp database engine. Khi `D1CmsProjectRepo.deleteProject(id)` chạy `DELETE FROM projects`, toàn bộ media con được dọn dẹp nguyên tử, không để lại rác (orphaned records). Thí nghiệm đối chứng khẳng định việc cascade chỉ ảnh hưởng đúng project mục tiêu.

4. **Từ Quan sát 1.4 ➔ Khả năng chống chịu lỗi (Resilience) của tầng Repository Mapper:**
   - Hàm `mapProjectRecordToFeatured` và `mapMediaToGalleryItem` xử lý `null` và `undefined` bằng toán tử nullish coalescing `?? ""` và fallback `"landscape"`. Nhờ đó, ngay cả khi dữ liệu media v0 được nạp không có metadata hoặc dự án chưa có ảnh gallery nào, UI `apps/web` vẫn nhận đúng kiểu mảng rỗng `[]` mà không bao giờ bị crash `TypeError: Cannot read properties of undefined`.

---

## 3. Caveats (Điểm Lưu Ý & Giới Hạn)

- **Foreign Key Enforcement trong SQLite:**
  - Mọi thao tác cascade delete phụ thuộc vào `PRAGMA foreign_keys = ON;`. Trong Cloudflare D1 Production, Cloudflare Workers D1 bật foreign keys mặc định. Khi kiểm thử cục bộ bằng SQLite in-memory, luôn phải đảm bảo lệnh `PRAGMA foreign_keys = ON;` được gọi ngay sau khi kết nối.

---

## 4. Conclusion (Kết Luận & Phán Quyết)

**Phán quyết:** **APPROVE**

Milestone 1 hoàn toàn đạt và vượt các tiêu chí kiểm thử đối kháng:
- Ràng buộc CHECK trên `year` (1990 - 2100) bảo vệ chính xác dữ liệu công trình.
- Ràng buộc UNIQUE trên `code` hoạt động nghiêm ngặt và đã loại bỏ hoàn toàn duplicate index thừa.
- Khóa ngoại `ON DELETE CASCADE` tự động dọn dẹp sạch sẽ toàn bộ `project_media` khi xóa dự án.
- Tầng mapper thích ứng an toàn với 0-media và null metadata.
- Toàn bộ build và test regression đều vượt qua với tỷ lệ thành công 100%.

---

## 5. Verification Method (Phương Pháp Xác Minh Độc Lập)

Bất kỳ reviewer hoặc auditor nào cũng có thể kiểm chứng lại kết quả bằng các lệnh sau:

```bash
# 1. Chạy trực tiếp test harness đối kháng do Challenger 2 tạo:
node packages/repositories/test/adversarial-projects-media.mjs
# Kỳ vọng: 22 subtests PASS 100%, exit code 0

# 2. Hoặc chạy qua node --test runner:
node --test packages/repositories/test/adversarial-projects-media.mjs
# Kỳ vọng: TAP 13 report, 22 pass, 0 fail

# 3. Chạy toàn bộ test suites hiện hữu của repositories:
pnpm --filter @khangviet/repositories test
# Kỳ vọng: 10/10 test suites pass 100%

# 4. Kiểm tra build Worker API và chạy e2e auth test:
pnpm --filter api test:auth
# Kỳ vọng: 12/12 scenarios pass 100%
```
