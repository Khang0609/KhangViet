---
trigger: always_on
description: "Bắt buộc tuân thủ khi tạo mới, tái cấu trúc hoặc sửa đổi mã nguồn. Định hình cấu trúc Screaming Architecture, boundaries và naming."
---

# Quy Chuẩn Tổ Chức Mã Nguồn & Kiến Trúc (Architecture & Code Standard)

Tài liệu này là ranh giới bắt buộc (Hard Constraints) cho AI khi sinh mã nguồn. Không được vi phạm bất kỳ điều khoản nào dưới đây trừ khi có chỉ định rõ ràng từ Senior Dev.

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

## 4. Giới Hạn Kích Thước Code (Hard Limits)

- **Độ dài File:** Tối đa **100 dòng**. Nếu file chạm mốc 90 dòng:
  - Tách sub-components ra file riêng (cùng cấp thư mục).
  - Tách hooks/helpers ra file riêng (cùng cấp thư mục).
- **Độ dài Hàm / Method:** Tối đa **35 dòng**. Một hàm chỉ làm đúng một việc duy nhất. Nếu hàm có nhiều hơn 2 cấp thụt lề (`nested ifs/loops`), phải tách hàm phụ.

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