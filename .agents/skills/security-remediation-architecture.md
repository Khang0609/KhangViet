---
name: security-remediation-architecture
description: Quy trình chuẩn doanh nghiệp dành cho Senior Backend Architect khi tiếp nhận báo cáo kiểm toán an ninh (Cyber Security / AppSec Audit Report). Hướng dẫn phân tích nguyên nhân gốc rễ, lập kế hoạch vá lỗi mang tính hệ thống (Systemic Remediation), bảo vệ tính tương thích ngược (Backward Compatibility), thực thi mã nguồn chuẩn Clean Architecture/Result Pattern và kiểm thử hồi quy đa tầng.
---

# Kỹ Năng Vá Lỗ Hổng & Gia Cố Hệ Thống (Security Remediation Architecture)

## 1. Tổng quan & Triết lý Cốt lõi (Architectural Philosophy)

Là một Senior Backend Architect, nhiệm vụ khi tiếp nhận một báo cáo kiểm toán an ninh (AppSec / Pentest Report) không chỉ đơn thuần là "chữa cháy" (point-patching) dòng code bị cảnh báo, mà bao gồm:

1. **Systemic Hardening (Gia cố gốc rễ):** Loại bỏ toàn bộ lớp lỗ hổng (vulnerability class) trên toàn codebase. Nếu một endpoint bị phát hiện IDOR hoặc cấu hình CORS lỏng lẻo, phải rà soát và thiết lập cơ chế phòng thủ ở tầng nền tảng (Middleware / Framework Level) để các kỹ sư khác không thể tái diễn lỗi trong tương lai (*"Make illegal states unrepresentable"*).
2. **Blast Radius & Zero-Regression:** Mọi thay đổi bảo mật phải cân nhắc kỹ lưỡng độ ảnh hưởng tới hệ thống đang vận hành. Không làm gián đoạn người dùng hợp lệ, không gây breaking changes trên API contracts cũ, và luôn chuẩn bị chiến lược di trú dữ liệu êm ái (Graceful Migration / Lazy Re-hash).
3. **Fail-Closed & Defense-in-Depth:** Hệ thống phải từ chối mặc định khi thiếu secret, token không hợp lệ hoặc cấu hình môi trường không an toàn. Phòng thủ theo nhiều lớp (Edge WAF $\rightarrow$ Middleware Route Guard $\rightarrow$ Service/Domain Logic $\rightarrow$ Database Query Scoping).
4. **Native Primitives over Supply-Chain Bloat:** Tối đa hóa việc dùng Web Standards và Web Crypto API sẵn có của Cloudflare Workers / Node.js runtime, hạn chế tối đa việc kéo thêm các thư viện bên ngoài vào `package.json`.

---

## 2. Khi Nào Kích Hoạt Kỹ Năng Này

- Khi nhận được báo cáo kiểm toán mã nguồn (SAST/DAST/Pentest report) như [security-audit-report.md](file:///e:/lap_trinh/Project/website/KhangVietDesign/source/.agents/docs/security-audit-report.md).
- Khi có sự cố an ninh cần lập tức lên kế hoạch Hotfix hoặc Hardening Release.
- Khi cần thiết kế lại cơ chế Xác thực (Auth), Quản lý Session, Mã hóa mật khẩu, Phân quyền dữ liệu (Multi-tenant/RBAC), hoặc thiết lập tường lửa ứng dụng (CORS, CSRF, Rate Limiting).

---

## 3. Quy Trình 5 Giai Đoạn Chuẩn Doanh Nghiệp (Enterprise Remediation Lifecycle)

### Giai đoạn 1: Tiếp nhận Báo cáo, Đánh giá Rủi ro & Bán kính Ảnh hưởng (Triage & Blast Radius)
1. **Phân loại Ma trận Rủi ro:**
   - **CRITICAL / HIGH:** Các lỗi cho phép khai thác từ xa không cần quyền truy cập (RCE, Auth Bypass, CORS Wildcard kèm Credentials, Default/Hardcoded JWT Secret, Fast Weak Hash SHA-256). Ưu tiên xử lý khẩn cấp (P0).
   - **MEDIUM:** BOLA/IDOR trong phạm vi hạn chế, thiếu Rate Limiting trên form công khai, CSRF trên endpoint Revalidation. Xử lý trong sprint hiện tại (P1).
   - **LOW / INFO:** Thiếu Security Headers, Verbose Error Stack trong môi trường Production, rò rỉ thông tin phiên bản. Hardening toàn cục (P2).
2. **Đánh giá Bán kính Ảnh hưởng (Blast Radius):**
   - Thay đổi API response/schema có làm gãy Frontend (Next.js) hoặc Mobile app không?
   - Thay đổi thuật toán hash mật khẩu có vô hiệu hóa tài khoản người dùng cũ không? (Giải pháp: Dual-check & Lazy Re-hash khi user đăng nhập).
   - Thay đổi cấu hình CORS có vô tình chặn các subdomain nội bộ hoặc môi trường Local Dev/Staging không?

### Giai đoạn 2: Lập Kế Hoạch Chiến Lược & Thiết Kế Kiến Trúc (Remediation Blueprint)
Trước khi chỉnh sửa code, bắt buộc lập bản kế hoạch chi tiết (Remediation Plan):
1. **Xác định Root-Cause Mechanism:** Cơ chế lõi bị thiếu là gì? (Thiếu Route Guard Middleware, thiếu Zod Schema, thiếu Environment Fail-Closed Parser).
2. **Quy tắc Atomic Implementation (4 bước theo chuẩn kiến trúc):**
   - *Bước 1: Contracts & Types:* Định nghĩa Schema, DTO, Result Types `Result<T, E>`.
   - *Bước 2: Pure Domain Logic:* Viết hàm thuần túy (Crypto, Hash, Token verify), không phụ thuộc side-effects.
   - *Bước 3: Service & Middleware Integration:* Đấu nối vào Hono/Next.js middleware, DB context, Logger.
   - *Bước 4: UI/Consumer Wiring & API Spec:* Cập nhật OpenAPI/Zod specs và các client gọi API.

### Giai đoạn 3: Thực Thi Bản Vá Chuẩn Kiến Trúc Dự Án (Architectural Execution)
Mọi bản vá bắt buộc tuân thủ bộ quy chuẩn của dự án:
- **Giới hạn kích thước code:** File $\le$ 100 dòng, Hàm $\le$ 35 dòng. Nếu vượt quá, tách module con cùng cấp.
- **Strict Result Pattern:** Không ném `throw error` bừa bãi trong business flow. Dùng `Result<T, E>`.
- **Structured Tracing:** Ghi log kèm context (`traceId`, `userId`, `errorCode`), tuyệt đối không để lộ `err.stack` ra client production.
- **Mẫu xử lý cho các nhóm lỗ hổng kinh điển:**
  - **CORS:** Sử dụng Dynamic Whitelist parser kiểm tra origin từ danh sách cấu hình, trả về `null` nếu origin lạ, không bao giờ dùng `origin: (o) => o || "*"`.
  - **Secrets:** Tách cấu hình qua module env có validation nghiêm ngặt (Fail-Closed). Ném lỗi `Fatal` ngay khi boot nếu thiếu secret trên Production.
  - **Cryptography:** Sử dụng Web Crypto API (`crypto.subtle.deriveBits` với PBKDF2-HMAC-SHA256, 100,000+ iterations), so sánh bằng `crypto.subtle.timingSafeEqual`.
  - **BOLA/IDOR Prevention:** Truy vấn cơ sở dữ liệu luôn kèm điều kiện sở hữu `and(eq(table.id, id), eq(table.userId, authUserId))` thay vì chỉ truy vấn bằng `id`.

### Giai đoạn 4: Kiểm Thử Đa Tầng & Xác Minh Khai Thác (Verification Rigor)
Không bao giờ đóng một ticket bảo mật nếu chưa chứng minh được qua test:
1. **PoC Exploit Test (Chứng minh lỗ hổng đã được vá):**
   - Viết test script gửi payload tấn công nguyên bản từ báo cáo (ví dụ: gửi CORS request từ `https://evil-attacker.com` hoặc gửi fake JWT ký bằng dev-secret).
   - Xác nhận response trả về HTTP `401 Unauthorized` hoặc `403 Forbidden` hoặc không có CORS header.
2. **Regression & Happy-Path Test:**
   - Chạy test case người dùng bình thường để đảm bảo chức năng nghiệp vụ hoạt động ổn định 100%.
3. **Boundary & Edge-Case Testing:**
   - Payload trống, token hết hạn, ký tự đặc biệt, timing discrepancy, schema fuzzing qua Schemathesis.

### Giai đoạn 5: Tổng Kết & Chuyển Giao (Sign-Off & Knowledge Transfer)
1. Cập nhật `security-audit-report.md` chuyển trạng thái sang **RESOLVED** kèm liên kết đến commit/PR.
2. Cập nhật OpenAPI documentation nếu có sự thay đổi contract.
3. Đề xuất quy tắc linting hoặc unit-test guard để ngăn chặn tái phát.
