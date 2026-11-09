---
trigger: always_on
description: "Bắt buộc tuân thủ khi tạo mới, tái cấu trúc hoặc sửa đổi mã nguồn. Định hình cấu trúc Screaming Architecture, boundaries và naming."
---

# Quy Chuẩn Tổ Chức Mã Nguồn & Kiến Trúc (Architecture & Code Standard)

Tài liệu này là ranh giới bắt buộc (Hard Constraints) cho AI khi sinh mã nguồn. Không được vi phạm bất kỳ điều khoản nào dưới đây trừ khi có chỉ định rõ ràng từ Senior Dev.

> [!IMPORTANT] Phạm Vi Áp Dụng (Scope of Impact - Zero Unsolicited Changes)
> - Quy chuẩn này **CHỈ ÁP DỤNG** cho:
>   1. Mã nguồn được **TẠO MỚI**.
>   2. Module/File mà người dùng **TRỰC TIẾP YÊU CẦU REFACTOR**.
> - **CẤM TUYỆT ĐỐI:** Tự ý rà soát, tái cấu trúc hoặc tách nhỏ các file/module cũ đang hoạt động ổn định nếu task hiện tại không yêu cầu sửa đổi chúng. Luôn giữ phạm vi thay đổi (blast radius) ở mức tối thiểu.

---

## 1. Screaming Architecture & Package by Feature

Mã nguồn phải bộc lộ rõ nghiệp vụ của dự án chỉ bằng việc nhìn vào cây thư mục, không cần mở code.

### 1.1. Nguyên tắc Phân rã
- **CẤM** gom nhóm theo tầng kỹ thuật ở root (VD: cấm gom toàn bộ vào `/controllers`, `/models`, `/services`, `/utils` khổng lồ).
- **BẮT BUỘC** đóng gói theo tính năng/domain (VD: `src/modules/order`, `src/modules/billing`, `src/modules/auth`).
- Mọi logic liên quan chặt chẽ đến domain (data schema, logic xử lý, sub-components, UI state) phải nằm gọn trong thư mục của feature đó.

### 1.2. Thư mục Shared / Core
- Thư mục `src/shared` hoặc `src/common` chỉ chứa các thành phần **thực sự phi nghiệp vụ** (primitive UI components, low-level HTTP client, base type helpers).
- Quy tắc 2-Domain: Một utility/hook chỉ được đưa lên `shared` khi và chỉ khi có từ **2 module khác nhau** cùng tái sử dụng. Nếu chỉ module hiện tại dùng, bắt buộc để tại chỗ (Colocation).

---

## 2. Public API Nội Bộ (Facade / Barrel via `index.ts`)

Mỗi module phải kiểm soát chặt chẽ điểm truy cập ngoại vi để tránh phụ thuộc chéo rối rắm (tight coupling).

- **Điểm vào duy nhất:** Mỗi feature module **bắt buộc** có một file `index.ts` ở thư mục gốc của module đó.
- **Export có chọn lọc:** Chỉ export ra ngoài những Service, Interface, DTO, Component được phép gọi công khai. Tất cả helper nội bộ, sub-components, internal state **CẤM** export ra khỏi module.
- **Cấm Deep Import:**
  - ❌ `import { formatBillingData } from '@/modules/billing/internal/helpers/format';`
  - ✅ `import { BillingService, type InvoiceDto } from '@/modules/billing';`

---

## 3. Tư duy Code "Block-by-Block" & Tránh Trừu tượng hóa sớm (No Over-engineering)

- **Viết phẳng & Tường minh:** Ưu tiên luồng thực thi tuần tự, phẳng (`early returns`), dễ đọc lướt qua bằng mắt.
- **Cấm tự ý tạo Design Patterns phức tạp:** AI KHÔNG ĐƯỢC tự ý tạo Factory, Strategy, Adapter, Abstract Classes, hay Generic Wrappers 3-4 tầng khi bài toán chưa thực sự phát sinh biến thể.
- **Quy tắc 3 lần trùng lặp:** Chỉ trừu tượng hoá khi logic giống nhau xuất hiện lần thứ 3. Code lặp 2 lần vẫn tốt hơn việc tạo ra một abstraction sai lầm.

---

## 4. Giới Hạn Kích Thước Code Thực Tế (Pragmatic Boundaries & High Cohesion)

Tránh bẫy "Tách file mù quáng" (Blind Decoupling / Shotgun Surgery). Mục tiêu cao nhất là **tính mạch lạc của nghiệp vụ** và **sự gắn kết chặt chẽ (High Cohesion)**.

### 4.1. Độ Dài File
- **Mức lý tưởng:** **100 - 200 dòng**.
- **Mức trần chấp nhận được (Hard Ceiling):** **250 dòng**.
- **Nguyên tắc Colocation (Đặt cùng chỗ):** 
  - Các Schema (Drizzle/Zod), Type/DTO, Mappers, hoặc sub-views/helpers nhỏ liên quan mật thiết đến cùng một nghiệp vụ ĐƯỢC PHÉP nằm chung trong một file để giữ luồng tư duy liền mạch, đọc từ trên xuống dưới hiểu ngay.
  - **Chỉ tách file khi:**
    1. File chạm ngưỡng cảnh báo **200 - 250 dòng**.
    2. Thành phần con thực sự có nhu cầu tái sử dụng ở module khác.
    3. File gánh vác quá nhiều trách nhiệm hỗn tạp (vi phạm Single Responsibility: vừa fetch mạng, vừa quản lý state lớn, vừa render layout phức tạp).

### 4.2. Độ Dài Hàm / Method
- **Mức lý tưởng:** **<= 45 dòng**.
- **Mức trần chấp nhận được:** **70 dòng** đối với các hàm luồng tuần tự phẳng (Sequential Pipeline, DB Transactions, hoặc React Component render blocks).
- **Trọng tâm là Cyclomatic Complexity (Độ phức tạp phân nhánh):**
  - Không máy móc ngắt hàm khi luồng logic chạy thẳng (linear / declarative / early returns).
  - Bắt buộc tách hàm khi có **hơn 2 cấp thụt lề lồng nhau** (`nested ifs/loops`) hoặc khi một logic tính toán phức tạp có thể cô lập thành hàm thuần khiết (pure function) để viết test riêng.

---

## 5. Quy Chuẩn Đặt Tên (Naming Conventions)

- **Files & Folders:**
  - Feature folders: `kebab-case` (VD: `order-fulfillment`, `auth-flow`).
  - Logic/Service files: `kebab-case.ts` (VD: `order.service.ts`, `validate-cart.ts`).
  - React Components: `PascalCase.tsx` (VD: `OrderSummary.tsx`).
- **Variables & Functions:**
  - Biến và hàm: `camelCase`.
  - Biến boolean: Bắt buộc có tiền tố phản ánh trạng thái (`isReady`, `hasAccess`, `shouldRetry`).
  - Hàm xử lý sự kiện: Tiền tố `handle` (VD: `handleOrderSubmit`).
- **Types & Interfaces:**
  - Sử dụng `PascalCase`. Không dùng tiền tố `I` (như `IOrder`), dùng `Order` hoặc `OrderDTO`.

---

## 6. JSDoc / Docstring: Chuẩn "WHY, not WHAT"

AI không được tạo ra các comment vô giá trị lặp lại tên hàm.

- ❌ **CẤM VIẾT (WHAT):**
  ```ts
  /**
   * Tính toán tổng tiền hóa đơn
   * @param items danh sách mặt hàng
   */
  function calculateTotal(items: CartItem[]) {}
  ```
- ✅ **BẮT BUỘC VIẾT (WHY & CONSTRAINTS):**
  ```ts
  /**
   * Tính tổng giá trị cuối cùng bao gồm thuế VAT và chiết khấu bậc thang.
   * Ràng buộc: VAT được áp dụng sau khi trừ voucher, tuân theo quy định kế toán tháng 10/2026.
   * Rounding mode: Math.floor theo yêu cầu từ cổng thanh toán VNPay.
   */
  function calculateTotal(items: CartItem[]): CurrencyAmount {}
  ```