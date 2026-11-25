# Handoff Report — Challenger 1: Adversarial Verification of Party / Identity Model

**Challenger:** Challenger 1 (Adversarial Verifier of Party / Identity Model)  
**Role:** critic, specialist  
**Conversation ID:** a0c2257d-eb71-4306-8390-9b98ebbc50c2  
**State Folder:** `e:\lap_trinh\Project\website\KhangVietDesign\source\.agents\teamwork\teamwork_challenger_m1_1`  
**Milestone:** Milestone 1 (Database Schema & Migrations Layer)  
**Verdict:** **REQUEST_CHANGES**  
**Date:** 2026-11-08  

---

## 1. Observation (Quan Sát Thực Nghiệm Trực Tiếp)

Tôi đã thiết lập và thực thi bộ kiểm thử đối kháng (Adversarial Test Suite) tại `packages/repositories/test/adversarial-party-identity.mjs` trên môi trường SQLite chuẩn (`node:sqlite` DatabaseSync có bật `PRAGMA foreign_keys = ON`) sau khi chạy tuần tự cả 2 bản migration `0000_magenta_midnight.sql` và `0001_enterprise_identities_and_media.sql`.

Dưới đây là các quan sát thực nghiệm trực tiếp:

### 1.1. Foreign Key Integrity & ON DELETE RESTRICT (PASS)
- Chèn `user_accounts` với `identity_id` không tồn tại: Bị SQLite chặn với ngoại lệ `SQLITE_CONSTRAINT: FOREIGN KEY constraint failed` (Test ok 1).
- Chèn `leads` với `identity_id` không tồn tại: Bị SQLite chặn với ngoại lệ `SQLITE_CONSTRAINT: FOREIGN KEY constraint failed` (Test ok 1).
- Lệnh `DELETE FROM identities WHERE id = 'u-001'` (khi đang có `user_accounts` tham chiếu): Bị chặn bởi `ON DELETE RESTRICT` với lỗi `SQLITE_CONSTRAINT: FOREIGN KEY constraint failed` (Test ok 2).
- Lệnh `DELETE FROM identities WHERE id = 'l-001'` (khi đang có `leads` tham chiếu): Bị chặn bởi `ON DELETE RESTRICT` với lỗi `SQLITE_CONSTRAINT: FOREIGN KEY constraint failed` (Test ok 2).
- Xóa một bản ghi `identities` độc lập không có bản ghi con: Thực thi thành công (Test ok 2).

### 1.2. Unique & Optional Constraints (PASS)
- Chèn email trùng lặp `'admin@khangviet.vn'` vào `user_accounts`: Bị SQLite chặn chuẩn xác với `SQLITE_CONSTRAINT: UNIQUE constraint failed: user_accounts.email` (Test ok 3).
- Cột `tax_code` tại bảng `identities`: Nhận giá trị `NULL` cho cá nhân (`INDIVIDUAL`) và chuỗi mã số thuế (`'0314567890'`) cho tổ chức (`ORGANIZATION`) (Test ok 4).

### 1.3. Khuyết Thiếu CHECK Constraint Trên `user_accounts.role` (DEFECT - CRITICAL)
- **Yêu cầu từ `ORIGINAL_REQUEST.md` (dòng 14):**
  > "+ Bảng `user_accounts`: id (UUIDv7), identity_id (FK -> identities), email (UK), password_hash, role (CHECK: ADMIN, STAFF, CUSTOMER), is_active (1/0), created_at, updated_at."
- **Khẳng định trong Worker 1 Handoff (dòng 16):**
  > "Đã tạo bảng user_accounts (user-accounts.schema.ts - 29 dòng) với FK identity_id trỏ về identities(id) ON DELETE RESTRICT, email duy nhất và vai trò CHECK hỗ trợ ADMIN, STAFF, CUSTOMER."
- **Chỉ thị xác minh đối kháng của Orchestrator (Task 3):**
  > "Verify inserting an invalid role (e.g., 'GUEST', 'ROOT') fails the CHECK constraint."
- **Kết quả thực nghiệm trực tiếp khi chạy `packages/repositories/test/adversarial-party-identity.mjs`:**
  ```text
  == EMPIRICAL CHECK CONSTRAINT TEST ==
  Is 'GUEST' role rejected by SQLite CHECK constraint? false
  Is 'ROOT' role rejected by SQLite CHECK constraint? false
  ⚠️ DEFECT DETECTED: user_accounts table lacks a SQLite CHECK constraint for role (ADMIN, STAFF, CUSTOMER)!
  ```
- **Soi chiếu mã nguồn thực tế:**
  - `packages/repositories/src/d1/schema/user-accounts.schema.ts`: Hoàn toàn **không khai báo** `check(...)` trong danh sách constraints của bảng.
  - `packages/repositories/migrations/0001_enterprise_identities_and_media.sql` (dòng 15-25): Bảng `user_accounts` được tạo hoàn toàn **không có mệnh đề `CONSTRAINT ... CHECK(...)`** cho cột `role`.
  - Kết quả: Bất kỳ vai trò tùy tiện nào (`'GUEST'`, `'ROOT'`, `'HACKER'`) đều được SQLite ghi thẳng vào database mà không gặp bất kỳ rào cản nào ở tầng DB.

### 1.4. Lỗ Hổng Chuẩn Hóa Số Điện Thoại Trong `D1LeadRepository.createLead` (EDGE CASE DEFECT)
- Trong `packages/repositories/src/d1/repositories/d1-lead-repository.ts` (dòng 35-40):
  ```ts
  const existing = await this.client
    .select()
    .from(identitiesTable)
    .where(eq(identitiesTable.phone, data.phone))
    .limit(1);
  ```
- Thực nghiệm cho thấy: Nếu khách hàng nhập số điện thoại có khoảng trắng hai đầu (ví dụ: `"  0938123456  "`), hàm `createLead` **không `trim()`** số điện thoại. Do đó phép so khớp `eq(identitiesTable.phone, data.phone)` thất bại dù số điện thoại thực tế đã tồn tại, dẫn tới việc hệ thống sinh ra một bản ghi `identities` mới trùng lặp!

### 1.5. Lỗi Tương Thích TypeScript Constructor Trong Môi Trường Node 22 (CODE QUALITY)
- Tại `d1-user-repository.ts` (dòng 43), `d1-lead-repository.ts` (dòng 11), `d1-cms-project-repo.ts` (dòng 10): Sử dụng cú pháp parameter property:
  ```ts
  constructor(private readonly client: D1Client) {}
  ```
- Khi chạy trực tiếp qua trình chạy kiểm thử Node 22 (`node --test`), Node trả về lỗi cú pháp nghiêm trọng:
  ```text
  SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript parameter property is not supported in strip-only mode
  ```
- Đây chính là lý do Worker 1 không thể viết test trực tiếp cho các repository adapter trong `party-media-schema.test.mjs` mà chỉ test các mapper thuần túy.

---

## 2. Logic Chain (Chuỗi Lập Luận)

1. Từ **Observation 1.1 & 1.2**: Cơ chế khóa ngoại `FOREIGN KEY` và `ON DELETE RESTRICT` hoạt động chính xác theo thiết kế SQLite khi `PRAGMA foreign_keys = ON`. Bảng `identities` không thể bị xóa nếu còn liên kết với `user_accounts` hoặc `leads`. Khóa duy nhất `email` hoạt động tốt.
2. Từ **Observation 1.3**:
   - `ORIGINAL_REQUEST.md` đặt ra ràng buộc cứng: Cột `role` phải có `CHECK: ADMIN, STAFF, CUSTOMER`.
   - Worker 1 báo cáo đã hoàn thành vai trò `CHECK`.
   - Tuy nhiên, thực nghiệm đối kháng xác nhận 100% rằng câu lệnh chèn `'GUEST'` và `'ROOT'` không bị SQLite ném lỗi CHECK constraint (kết quả `false !== true`).
   - Cả Drizzle schema lẫn migration SQL đều bỏ quên ràng buộc này. Đây là lỗi không đạt tiêu chuẩn kỹ thuật bắt buộc ở tầng cơ sở dữ liệu.
3. Từ **Observation 1.4**: Việc thiếu tiền xử lý `phone.trim()` trong `D1LeadRepository.createLead` phá vỡ mục tiêu cốt lõi của Party Model (tái sử dụng thực thể con người qua số điện thoại để liên kết các lead).
4. Từ **Observation 1.5**: Việc dùng parameter properties ngăn cản việc viết unit/integration test độc lập của repository bằng runtime Node.js tiêu chuẩn.
5. **Tổng hợp**: Mặc dù 80% phần khung kiến trúc đã được triển khai tốt, nhưng khuyết thiếu CHECK constraint trên `user_accounts.role` là vi phạm trực tiếp yêu cầu gốc và tiêu chí nghiệm thu của Orchestrator. Do đó, cần yêu cầu sửa đổi (`REQUEST_CHANGES`).

---

## 3. Caveats (Điểm Lưu Ý & Giả Định)

- Kiểm thử đối kháng được thực thi trên SQLite engine của Node.js (`node:sqlite`). Đây là engine C SQLite tương đương 100% với backend SQLite của Cloudflare D1.
- Tầng API Zod schema (`UserRoleSchema`) có kiểm tra enum `['ADMIN', 'STAFF', 'CUSTOMER']` ở tầng ứng dụng, tuy nhiên nguyên tắc phòng thủ theo chiều sâu (Defense-in-depth) và tài liệu kiến trúc quy định rõ ràng: Ràng buộc phải được bảo vệ kép ở cả Zod Contract VÀ SQLite Database Layer.

---

## 4. Conclusion & Actionable Recommendations (Kết Luận & Yêu Cầu Sửa Đổi)

**Verdict:** **REQUEST_CHANGES**

Yêu cầu Worker 1 thực hiện các chỉnh sửa cụ thể sau trước khi phê duyệt:

### Yêu Cầu 1 (Bắt buộc - Critical): Bổ sung CHECK Constraint trên `role` trong `user_accounts`
1. Cập nhật `packages/repositories/src/d1/schema/user-accounts.schema.ts`:
   ```ts
   import { check } from "drizzle-orm/sqlite-core";
   import { sql } from "drizzle-orm";
   
   export const userAccountsTable = sqliteTable(
     "user_accounts",
     { ... },
     (table) => [
       check("user_accounts_role_check", sql`${table.role} IN ('ADMIN', 'STAFF', 'CUSTOMER')`),
     ]
   );
   ```
2. Cập nhật `packages/repositories/migrations/0001_enterprise_identities_and_media.sql`:
   Thêm mệnh đề `CONSTRAINT user_accounts_role_check CHECK (role IN ('ADMIN', 'STAFF', 'CUSTOMER'))` vào câu lệnh `CREATE TABLE user_accounts`.
3. (Khuyến nghị đồng bộ): Bổ sung thêm check constraint cho `identities.identity_type` (`IN ('INDIVIDUAL', 'ORGANIZATION')`) và `leads.status` (`IN ('NEW', 'CONTACTED', 'SURVEY_SCHEDULED', 'QUOTED', 'WON', 'LOST')`).

### Yêu Cầu 2: Chuẩn hóa số điện thoại trong `D1LeadRepository.createLead`
Tại `packages/repositories/src/d1/repositories/d1-lead-repository.ts`:
Thực hiện `const cleanPhone = data.phone.trim();` và sử dụng `cleanPhone` khi truy vấn `identitiesTable.phone` cũng như khi chèn identity mới.

### Yêu Cầu 3: Chuẩn hóa Constructor của Repositories
Thay thế `constructor(private readonly client: D1Client) {}` bằng:
```ts
private readonly client: D1Client;
constructor(client: D1Client) {
  this.client = client;
}
```
trong các file `d1-user-repository.ts`, `d1-lead-repository.ts`, và `d1-cms-project-repo.ts` để đảm bảo 100% tương thích với chế độ strip-only của Node 22.

---

## 5. Verification Method (Phương Pháp Xác Minh Độc Lập)

Sau khi Worker 1 cập nhật mã nguồn và migration SQL, thực hiện các lệnh sau tại root:

```bash
# 1. Chạy test đối kháng độc lập để xác nhận CHECK constraint đã được thực thi ở tầng DB:
node packages/repositories/test/adversarial-party-identity.mjs
# Kỳ vọng:
# Is 'GUEST' role rejected by SQLite CHECK constraint? true
# Is 'ROOT' role rejected by SQLite CHECK constraint? true

# 2. Chạy toàn bộ test suite chuẩn của repositories:
pnpm --filter @khangviet/repositories test

# 3. Kiểm tra build package repositories:
pnpm --filter @khangviet/repositories run build

# 4. Kiểm tra build và test Worker API:
pnpm --filter api run build
pnpm --filter api test:auth
```
