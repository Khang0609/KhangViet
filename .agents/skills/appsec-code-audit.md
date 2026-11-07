---
name: appsec-code-audit
description: Hướng dẫn quy trình đánh giá an toàn thông tin ứng dụng (AppSec Review & Static Code Audit). Sử dụng khi cần rà soát bảo mật toàn diện codebase, kiểm tra trước khi release, tìm kiếm lỗ hổng theo chuẩn OWASP Top 10 và xây dựng báo cáo vá lỗi (Remediation Report).
---

# Quy Trình Đánh Giá An Toàn Thông Tin Ứng Dụng (AppSec Code Audit)

## Tổng quan
Kỹ năng này chuẩn hóa quy trình kiểm tra an ninh mã nguồn tĩnh (SAST & Manual Code Review) nhằm phát hiện sớm các lỗ hổng bảo mật nghiêm trọng (Broken Access Control, Cryptographic Failures, Injection, Insecure Configuration) trước khi đưa vào môi trường Production.

## Khi nào sử dụng
- Kiểm toán bảo mật định kỳ hoặc trước đợt bàn giao/phát hành tính năng (Pre-release audit).
- Khi bổ sung luồng Xác thực (Authentication), Phân quyền (RBAC/ABAC), hoặc tích hợp cổng thanh toán / API bên thứ ba.
- Khi người dùng yêu cầu rà soát bảo mật tĩnh hoặc kiểm tra nguy cơ bị tấn công/leo thang đặc quyền.

## Trụ cột Rà soát Trọng tâm (Core Audit Pillars)

### 1. Cơ chế Xác thực & Phân quyền (Authentication & Authorization)
- **Session & JWT Management:**
  - Kiểm tra xem secret key có bị hardcode hay fallback giá trị mặc định (`khangviet-dev-...`) hay không.
  - Kiểm tra thời hạn sống của token (`exp`), thuật toán ký (`alg` - tránh `none` hoặc thuật toán yếu).
  - Cookie flags: Bắt buộc `HttpOnly`, `Secure`, `SameSite` phù hợp (`Lax`/`Strict`).
- **Phân quyền Route & RBAC:**
  - Kiểm tra middleware bảo vệ endpoint (VD: `requireAdmin`, Server Route Guard).
  - Rà soát nguy cơ BOLA/IDOR: Kiểm tra quyền sở hữu tài nguyên (User chỉ được truy xuất dữ liệu của chính mình thay vì nhận `userId` tùy ý từ client).

### 2. Bảo mật API Endpoints & Dữ liệu
- **Input Validation:** Xác thực toàn bộ body, query, params bằng Zod/Valibot trước khi xử lý nghiệp vụ.
- **CSRF & State-Changing Requests:** Tuyệt đối không cho phép method `GET` kích hoạt hành động thay đổi trạng thái (như purge cache, xóa dữ liệu).
- **Rate Limiting:** Kiểm tra chống Brute-force trên endpoint đăng nhập (`/api/auth/login`) và chống spam/resource exhaustion trên form công khai.
- **Data Protection & Password Hashing:**
  - CẤM dùng SHA-1, MD5, hoặc SHA-256 1 vòng đơn giản để lưu mật khẩu. Bắt buộc dùng PBKDF2, Argon2id hoặc bcrypt.
  - Sử dụng hàm so sánh an toàn thời gian (`timingSafeEqual`) để chống Timing Attacks.

### 3. Cấu hình Môi trường & Hardening
- **CORS Policies:**
  - CẤM cấu hình `origin: (origin) => origin || "*"` kèm `credentials: true`.
  - Bắt buộc kiểm tra danh sách trắng domain (Whitelist) cụ thể.
- **Fail-Closed on Secrets:** Nếu biến môi trường mật (`JWT_SECRET`, `REVALIDATE_SECRET`, `DB_PASSWORD`) bị thiếu trong Production, hệ thống phải dừng chạy (Crash/Throw Fatal) thay vì tiếp tục với giá trị mặc định.
- **Xử lý Ngoại lệ & Logging:** Không trả về `err.message` hoặc stack trace thô trong response 500 của Production. Bổ sung `traceId` để tra cứu log.
- **Security Headers:** Kích hoạt HSTS, CSP, X-Frame-Options, X-Content-Type-Options.

## Quy chuẩn Cấu trúc Báo cáo Đầu ra (Output Standard)
Mỗi báo cáo kiểm toán bảo mật phải tuân theo cấu trúc chuẩn:
1. **Mã rủi ro & Tên lỗ hổng:** Tên rõ ràng + đối chiếu OWASP Top 10 và CWE.
2. **Vị trí mã nguồn:** File & dòng code cụ thể (dạng link clickable `file:///`).
3. **Nguyên nhân kỹ thuật & Mức độ:** (Critical / High / Medium / Low) + Kịch bản tấn công lý thuyết.
4. **Mã nguồn vá lỗi (Remediation Snippet):** Đoạn mã tham chiếu đã tối ưu/vá lỗi trực tiếp.

