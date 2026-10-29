---
trigger: always_on
description: "Quy chuẩn bắt buộc về Error Handling, Result Pattern, Context Fencing, Logging và quy trình Atomic Execution cho AI."
---

# Quy Chuẩn Tracing, Error Boundary & Context Fencing

Tài liệu này định hình cách xử lý ngoại lệ, logging có ngữ cảnh và phương thức tương tác nguyên tử (atomic) giữa kỹ sư và AI.

---

## 1. Cơ Chế Xử Lý Lỗi (Strict Result Pattern)

Tuyệt đối tránh việc ném lỗi (`throw error`) tự do trong business logic. Exception chỉ dành cho các lỗi hệ thống không thể khôi phục (Unrecoverable System Errors).

### 1.1. Chuẩn Hóa Bằng Result Type
Mọi domain service/use-case phải trả về kiểu `Result<T, E>` tường minh thay vì dựa vào runtime `try/catch`.

```ts
// types/result.ts
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

- Phía caller bắt buộc phải kiểm tra `res.success` trước khi truy xuất dữ liệu.
- Định nghĩa rõ các Domain Error cụ thể (discriminated union hoặc enum) để UI/Client có thể phản ứng chính xác:
  ```ts
  export type OrderCreationError = 
    | { code: 'OUT_OF_STOCK'; itemId: string }
    | { code: 'PAYMENT_DECLINED'; reason: string }
    | { code: 'INVALID_PROMOTION' };
  ```

### 1.2. Error Boundaries (Phía Client / UI)
- Mỗi feature module phải có Error Boundary cục bộ để cô lập lỗi UI, không làm sập toàn bộ ứng dụng.
- Khi module gặp sự cố, render Fallback UI cho phép người dùng retry tính năng đó một cách độc lập.

---

## 2. Structured Logging & Tracing Context

Mọi dòng log phải có ý nghĩa điều tra (observability), không chấp nhận log chuỗi text thô.

### 2.1. Cấu Trúc Log Bắt Buộc
- **CẤM** sử dụng `console.log` bừa bãi. Phải sử dụng logger wrapper chuẩn của dự án.
- Mọi log ghi nhận sự kiện phải kèm theo context payload:
  ```ts
  // ❌ Cấm:
  logger.error("Failed to process payment");

  // ✅ Chuẩn:
  logger.error("Payment transaction failed", {
    orderId,
    customerId,
    attemptCount,
    reason: error.code,
    latencyMs
  });
  ```

### 2.2. Tracing Context qua Metadata
- Giữ vững `traceId` hoặc `requestId` xuyên suốt các bước xử lý (từ Gateway/Controller -> Service -> DB/External API).
- Khi xử lý tác vụ bất đồng bộ hoặc hàng đợi (background job), phải inject `traceId` ban đầu vào metadata.

---

## 3. Context Fence Cho AI (Giới Hạn Tác Vụ Của AI)

Để đảm bảo tính nhất quán và kiểm soát mã nguồn, AI phải làm việc theo các nguyên tắc giới hạn ngữ cảnh:

1. **Không Tự Tiện Cài Đặt Thư Viện Mới:**
   - AI **CẤM** tự ý thêm dependency vào `package.json` mà chưa có sự đồng thuận từ Senior Dev. Luôn ưu tiên dùng Native API hoặc thư viện đã có sẵn trong dự án.
2. **Không Đoán Định API/Contract:**
   - Nếu schema dữ liệu hoặc API specs chưa rõ ràng, AI phải dừng lại và đặt câu hỏi thay vì tự giả định cấu trúc trả về.
3. **Tuân Thủ Kiểu Viết Đồng Nhất:**
   - Không pha trộn `async/await` với raw `.then()/.catch()`.
   - Giữ nguyên phong trào Functional Programming hoặc OOP đã có trong module mục tiêu, không tự ý chuyển đổi style.

---

## 4. Kỷ Luật Thực Thi Nguyên Tử (Atomic Commits & Prompts)

Khi được yêu cầu phát triển một tính năng, AI KHÔNG ĐƯỢC sinh ra toàn bộ feature trong một câu trả lời duy nhất. Quá trình làm việc phải chia thành các bước nhỏ:

### 4.1. Quy Trình 4 Bước Bắt Buộc
1. **Bước 1: Domain Models & Schema Contracts**
   - Viết Type definition, DTO, Validation schema (Zod/Valibot/Types).
   - Dừng lại xác nhận trước khi viết logic.
2. **Bước 2: Pure Domain Logic (Business Layer)**
   - Triển khai logic tính toán, thuần khiết (pure functions), áp dụng Result Type.
   - Viết kèm Unit Test cho các case biên.
3. **Bước 3: Integration / Service Layer**
   - Tích hợp Database, HTTP Client hoặc External APIs.
   - Gắn logger context và error handling.
4. **Bước 4: UI / Entry Point Wiring**
   - Ghép nối logic vào Component/Controller và export qua `index.ts`.

### 4.2. Gợi Ý Commit Message Đi Kèm
Ở mỗi bước hoàn thành, AI phải đề xuất một commit message theo chuẩn Conventional Commits ngắn gọn, mô tả đúng khối việc:
- `feat(order): define schema and contracts for order creation`
- `feat(order): implement pure discount calculation logic`
- `refactor(billing): encapsulate invoice helper into billing module`