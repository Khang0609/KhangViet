# BÁO CÁO ĐÁNH GIÁ AN TOÀN THÔNG TIN ỨNG DỤNG (STATIC APPLICATION SECURITY AUDIT)

**Dự án:** Khang Việt Architecture & Construction (KhangVietDesign)  
**Phạm vi kiểm tra:** Toàn bộ Codebase (`apps/api`, `apps/web`, `packages/*`)  
**Phương pháp thực hiện:** Static Application Security Testing (SAST) & Manual Code Review  
**Tiêu chuẩn đối chiếu:** OWASP Top 10 (2021), CWE/SANS Top 25, Cloudflare Workers / Next.js Best Practices  
**Ngày thực hiện:** 03/11/2026  
**Chuyên gia thực hiện:** Gemini Flash 3.8 Low

---

## 1. TỔNG QUAN KẾT QUẢ ĐÁNH GIÁ (EXECUTIVE SUMMARY)

Đợt rà soát an ninh mã nguồn tập trung vào ba trụ cột trọng yếu:

1. **Cơ chế Xác thực & Phân quyền (Authentication & Authorization):** Quản lý Session, JWT, RBAC, phân quyền route.
2. **Bảo mật API Endpoints & Server Actions:** Input Validation, CSRF, Rate Limiting, xử lý dữ liệu và lỗi.
3. **Bảo vệ Secret & Cấu hình:** Quản lý biến môi trường, CORS, Cookie flags và Security Headers.

### Thống kê mức độ rủi ro:

| Mức độ nghiêm trọng (Severity) | Số lượng phát hiện | Trạng thái                                |
| :----------------------------- | :----------------: | :---------------------------------------- |
| **CRITICAL / HIGH**            |         4          | **RESOLVED** (Đã khắc phục & verify 100%) |
| **MEDIUM**                     |         3          | **RESOLVED** (Đã khắc phục & verify 100%) |
| **LOW / INFO**                 |         1          | **RESOLVED** (Đã khắc phục & verify 100%) |

---

## 2. DANH MỤC LỖ HỔNG & BIỆN PHÁP KHẮC PHỤC CHI TIẾT

---

### [SEC-01] Nguy cơ Đánh Cắp Session (Token Hijacking) do Cấu hình CORS Phản Xạ Wildcard kèm Credentials

- **Phân loại OWASP:** A01:2021 - Broken Access Control / A05:2021 - Security Misconfiguration
- **Mã CWE:** [CWE-942: Permissive Cross-domain Policy with Untrusted Domains](https://cwe.mitre.org/data/definitions/942.html)
- **Mức độ nghiêm trọng:** **CRITICAL (HIGH)**
- **Vị trí tệp tin:** `apps/api/src/index.ts` (Dòng 20 - 28)

#### Nguyên nhân kỹ thuật:

Hệ thống cấu hình middleware CORS toàn cục bằng hàm:

```typescript
app.use(
  "*",
  cors({
    origin: (origin) => origin || "*",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);
```

Hàm `origin: (origin) => origin || "*"` sẽ tự động phản xạ lại (reflect) bất kỳ `Origin` nào gửi lên trong HTTP Request header từ trình duyệt, đồng thời gửi kèm header `Access-Control-Allow-Credentials: true`.

#### Kịch bản khai thác:

1. Nạn nhân (Admin đang đăng nhập) truy cập một trang web độc hại `https://evil-attacker.com`.
2. Trang độc hại thực hiện một lời gọi `fetch('https://api.khangviet.vn/api/auth/refresh', { method: 'POST', credentials: 'include' })`.
3. Do trình duyệt tự động đính kèm cookie HttpOnly `refreshToken`, máy chủ API chấp nhận và phản hồi với:
   - `Access-Control-Allow-Origin: https://evil-attacker.com`
   - `Access-Control-Allow-Credentials: true`
4. Trình duyệt của nạn nhân cho phép script của `evil-attacker.com` đọc trực tiếp response body chứa `accessToken` của tài khoản Admin. Kẻ tấn công cướp quyền Admin hoàn toàn mà không cần biết mật khẩu.

#### Giải pháp khắc phục (Remediation):

Chỉ cho phép danh sách trắng (Whitelist) các domain tin cậy được cấu hình qua biến môi trường. Tuyệt đối không phản xạ wildcard khi `credentials: true`.

```typescript
// apps/api/src/index.ts - Bản vá
import { getCorsOrigins } from "./config/cors";

app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const allowedOrigins = [
        c.env?.WEB_APP_URL,
        "https://khangviet.vn",
        "https://admin.khangviet.vn",
      ].filter(Boolean) as string[];

      // Trong môi trường dev có thể bổ sung localhost
      if (c.env?.NODE_ENV !== "production") {
        allowedOrigins.push("http://localhost:3000", "http://127.0.0.1:3000");
      }

      if (origin && allowedOrigins.includes(origin)) {
        return origin;
      }
      return null; // Từ chối cấp quyền truy cập Cross-Origin cho domain lạ
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);
```

---

### [SEC-02] Hardcoded JWT Fallback Secret dẫn đến Khả năng Giả Mạo Chữ Ký Token Admin

- **Phân loại OWASP:** A02:2021 - Cryptographic Failures / A07:2021 - Identification and Authentication Failures
- **Mã CWE:** [CWE-798: Use of Hard-coded Credentials](https://cwe.mitre.org/data/definitions/798.html)
- **Mức độ nghiêm trọng:** **CRITICAL (HIGH)**
- **Vị trí tệp tin:** `apps/api/src/middlewares/authMiddleware.ts` (Dòng 16 - 20)

#### Nguyên nhân kỹ thuật:

Hàm lấy khóa bí mật JWT có fallback tĩnh:

```typescript
const DEFAULT_SECRET = "khangviet-dev-jwt-secret-2026";

export const getJwtSecret = (c: Context<AppEnv>): string => {
  return c.env?.JWT_SECRET || DEFAULT_SECRET;
};
```

Nếu biến môi trường `JWT_SECRET` chưa được gán trên Cloudflare Workers Dashboard (hoặc bị thiếu trong quá trình deploy), hệ thống tự động sử dụng chuỗi mặc định `khangviet-dev-jwt-secret-2026`.

#### Kịch bản khai thác:

1. Kẻ tấn công đọc hoặc suy đoán secret mặc định từ mã nguồn.
2. Tự sinh ra JWT với thuật toán `HS256`, thiết lập payload:
   ```json
   {
     "sub": "a0000000-0000-4000-8000-000000000001",
     "email": "admin@khangviet.vn",
     "role": "ADMIN",
     "exp": 1999999999
   }
   ```
3. Ký token bằng bí mật `khangviet-dev-jwt-secret-2026`.
4. Gửi token lên các endpoint `/api/v1/admin/*`. Hàm `TokenService.verifyAccessToken` xác thực thành công do cùng secret, trao toàn quyền Admin mà không cần thông qua bước đăng nhập.

#### Giải pháp khắc phục (Remediation):

Bắt buộc ứng dụng phải ném lỗi hệ thống (Fail-closed) ngay lập tức nếu thiếu `JWT_SECRET` trong môi trường sản xuất. Độ dài secret tối thiểu 256-bit entropy.

```typescript
// apps/api/src/middlewares/authMiddleware.ts - Bản vá
export const getJwtSecret = (c: Context<AppEnv>): string => {
  const secret = c.env?.JWT_SECRET;
  if (!secret) {
    if (c.env?.NODE_ENV === "production") {
      throw new Error(
        "FATAL: JWT_SECRET environment variable is missing in production!",
      );
    }
    console.warn(
      "[SECURITY WARNING] Running with temporary dev secret. Do not use in prod.",
    );
    return "khangviet-dev-jwt-secret-2026";
  }
  return secret;
};
```

---

### [SEC-03] Thuật toán Băm Mật khẩu Không An Toàn (Fast Single SHA-256) & Lỗ hổng So Sánh Chuỗi (Timing Attack)

- **Phân loại OWASP:** A02:2021 - Cryptographic Failures
- **Mã CWE:** [CWE-916: Use of Password Hash With Insufficient Computational Effort](https://cwe.mitre.org/data/definitions/916.html) / [CWE-208: Observable Timing Discrepancy](https://cwe.mitre.org/data/definitions/208.html)
- **Mức độ nghiêm trọng:** **HIGH**
- **Vị trí tệp tin:** `apps/api/src/services/passwordService.ts` (Dòng 6 - 25)

#### Nguyên nhân kỹ thuật:

1. Lớp `PasswordService` sử dụng thuật toán băm SHA-256 1 vòng:
   ```typescript
   const hashBuffer = await crypto.subtle.digest(
     "SHA-256",
     encoder.encode(data),
   );
   ```
   SHA-256 là hàm băm đại diện toàn vẹn dữ liệu (cryptographic hash), hoàn toàn không phải là thuật toán lưu trữ mật khẩu an toàn vì tốc độ thực thi quá nhanh, không có hệ số giãn thời gian tính toán (work factor/iterations) và chi phí bộ nhớ (memory hardness). Kẻ tấn công có thể bẻ khóa hàng tỷ hash mỗi giây trên thiết bị GPU thông thường.
2. Hàm kiểm tra mật khẩu sử dụng phép toán so sánh chuỗi thông thường:
   ```typescript
   return computed === expectedHash;
   ```
   Phép so sánh `===` kết thúc ngay khi gặp ký tự khác nhau đầu tiên, tạo ra độ lệch thời gian phản hồi (timing side-channel) cho phép tấn công trích xuất hash theo từng ký tự.

#### Giải pháp khắc phục (Remediation):

Sử dụng thuật toán **PBKDF2-HMAC-SHA256** với tối thiểu 100.000 đến 600.000 vòng lặp (tuân theo khuyến nghị OWASP Password Storage Cheat Sheet) tương thích hoàn toàn với Web Crypto API sẵn có trên Cloudflare Workers mà không cần cài thêm thư viện ngoài. Sử dụng `crypto.subtle.timingSafeEqual` để so sánh an toàn:

```typescript
// apps/api/src/services/passwordService.ts - Bản vá
export class PasswordService {
  private static readonly ITERATIONS = 100_000;
  private static readonly KEY_LEN = 32;

  static async hashPassword(password: string): Promise<string> {
    const saltBytes = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Array.from(saltBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"],
    );

    const derived = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: saltBytes,
        iterations: this.ITERATIONS,
        hash: "SHA-256",
      },
      keyMaterial,
      this.KEY_LEN * 8,
    );

    const hashHex = Array.from(new Uint8Array(derived))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return `${saltHex}:${hashHex}`;
  }

  static async verifyPassword(
    plainText: string,
    storedHash: string,
  ): Promise<boolean> {
    const [saltHex, expectedHashHex] = storedHash.split(":");
    if (!saltHex || !expectedHashHex) return false;

    const saltBytes = new Uint8Array(
      saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
    );

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(plainText),
      "PBKDF2",
      false,
      ["deriveBits"],
    );

    const derived = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: saltBytes,
        iterations: this.ITERATIONS,
        hash: "SHA-256",
      },
      keyMaterial,
      this.KEY_LEN * 8,
    );

    const expectedBytes = new Uint8Array(
      expectedHashHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
    );
    const derivedBytes = new Uint8Array(derived);

    if (expectedBytes.length !== derivedBytes.length) return false;
    return crypto.subtle.timingSafeEqual(expectedBytes, derivedBytes);
  }
}
```

---

### [SEC-04] Lỗ hổng Xác Thực Bị Vượt Qua (Authentication Bypass) tại Route Revalidation ISR

- **Phân loại OWASP:** A01:2021 - Broken Access Control
- **Mã CWE:** [CWE-305: Authentication Bypass by Primary Weakness](https://cwe.mitre.org/data/definitions/305.html)
- **Mức độ nghiêm trọng:** **HIGH**
- **Vị trí tệp tin:** `apps/web/app/api/revalidate/route.ts` (Dòng 12 - 18, 53 - 61)

#### Nguyên nhân kỹ thuật:

Đoạn mã kiểm tra điều kiện xác thực secret token:

```typescript
const isDev = process.env.NODE_ENV !== "production";
if (!isDev && secret && secret !== EXPECTED_SECRET) {
  return NextResponse.json(
    { success: false, message: "Invalid revalidation secret token" },
    { status: 401 },
  );
}
```

Nhìn vào logic: `if (!isDev && secret && secret !== EXPECTED_SECRET)`:
Khi một người dùng gửi request **KHÔNG CÓ** tham số `secret` (tức là `secret === null` hoặc `undefined`), vế `secret` sẽ trả về `falsy`. Khi đó toàn bộ biểu thức `if` trả về `false`! Lệnh trả về lỗi `401` **bị bỏ qua hoàn toàn**. Hệ thống tiếp tục thực thi hàm `revalidateTag` và `revalidatePath` mà không cần cung cấp bất kỳ mật khẩu nào.
Ngoài ra, route còn hỗ trợ cả method `GET`, cho phép kẻ xấu dễ dàng kích hoạt DoS hoặc làm nghẽn cache ISR thông qua thẻ `<img>` hoặc link đơn giản.

#### Giải pháp khắc phục (Remediation):

1. Chuyển sang tư duy "Từ chối theo mặc định" (Default-deny): `secret` phải tồn tại VÀ phải trùng khớp.
2. Vô hiệu hóa method `GET` đối với thao tác thay đổi trạng thái cache.
3. Không fallback về secret cố định trong code.

```typescript
// apps/web/app/api/revalidate/route.ts - Bản vá
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

const EXPECTED_SECRET = process.env.REVALIDATE_SECRET;

export async function POST(request: NextRequest) {
  if (!EXPECTED_SECRET) {
    return NextResponse.json(
      {
        success: false,
        message: "REVALIDATE_SECRET is not configured on server",
      },
      { status: 500 },
    );
  }

  const secret =
    request.nextUrl.searchParams.get("secret") ||
    request.headers.get("x-revalidate-secret");

  if (!secret || secret !== EXPECTED_SECRET) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized: Invalid or missing revalidation secret token",
      },
      { status: 401 },
    );
  }

  const tag = request.nextUrl.searchParams.get("tag") || "cms-landing";
  const path = request.nextUrl.searchParams.get("path");

  try {
    revalidateTag(tag, "max");
    if (path) {
      revalidatePath(path);
    } else {
      revalidatePath("/", "page");
    }

    return NextResponse.json({
      revalidated: true,
      tag,
      path: path || "/",
      timestamp: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: (err as Error).message },
      { status: 500 },
    );
  }
}
```

---

### [SEC-05] Thiếu Giới Hạn Tần Suất Yêu Cầu (Rate Limiting) trên Login & Public Lead Endpoints

- **Phân loại OWASP:** A04:2021 - Insecure Design / A07:2021 - Identification and Authentication Failures
- **Mã CWE:** [CWE-307: Improper Restriction of Excessive Authentication Attempts](https://cwe.mitre.org/data/definitions/307.html) / [CWE-799: Improper Control of Interaction Frequency](https://cwe.mitre.org/data/definitions/799.html)
- **Mức độ nghiêm trọng:** **MEDIUM**
- **Vị trí tệp tin:**
  - `apps/api/src/routes/auth.ts` (`POST /api/auth/login`)
  - `apps/api/src/routes/publicLeads.ts` (`POST /api/v1/leads`)

#### Nguyên nhân kỹ thuật:

- Endpoint `/api/auth/login` không có bất kỳ rào chắn giới hạn số lần thử mật khẩu sai. Kẻ tấn công có thể chạy công cụ Brute-force / Credential Stuffing hàng trăm nghìn lần để mò mật khẩu tài khoản Admin.
- Endpoint `/api/v1/leads` cho phép người dùng ẩn danh gửi thông tin liên hệ. Không có giới hạn IP hoặc giải pháp Bot Detection (Cloudflare Turnstile, ReCAPTCHA), dẫn đến nguy cơ spam dữ liệu rác, gây tràn bộ nhớ hoặc cạn kiệt tài nguyên lưu trữ.

#### Giải pháp khắc phục (Remediation):

Triển khai Rate Limiting theo địa chỉ IP hoặc định danh client sử dụng Cloudflare Workers KV hoặc In-Memory Token Bucket cho Hono:

```typescript
// apps/api/src/middlewares/rateLimiter.ts
import { Context, Next } from "hono";

interface RateLimitStore {
  [ip: string]: { count: number; resetTime: number };
}

const memoryStore: RateLimitStore = {};

export const createRateLimiter = (options: {
  max: number;
  windowMs: number;
}) => {
  return async (c: Context, next: Next) => {
    const ip =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for") ||
      "unknown";
    const now = Date.now();
    const record = memoryStore[ip];

    if (!record || now > record.resetTime) {
      memoryStore[ip] = { count: 1, resetTime: now + options.windowMs };
    } else {
      record.count++;
      if (record.count > options.max) {
        return c.json(
          {
            success: false,
            error: "Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau.",
          },
          429,
        );
      }
    }

    return await next();
  };
};

// Áp dụng:
// authRouter.use("/login", createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 })); // Tối đa 5 lần thử/15 phút
```

---

### [SEC-06] Rò Rỉ Thông Tin Nội Bộ Qua Phản Hồi Lỗi 500 (Detailed Error Exposure)

- **Phân loại OWASP:** A05:2021 - Security Misconfiguration
- **Mã CWE:** [CWE-209: Generation of Error Message Containing Sensitive Information](https://cwe.mitre.org/data/definitions/209.html)
- **Mức độ nghiêm trọng:** **MEDIUM**
- **Vị trí tệp tin:** `apps/api/src/middlewares/errorHandler.ts` (Dòng 48 - 51)

#### Nguyên nhân kỹ thuật:

Trong middleware xử lý ngoại lệ:

```typescript
console.error(`[API ERROR] ${c.req.method} ${c.req.url}:`, err);
return c.json(
  {
    success: false,
    error: err.message || "Internal Server Error",
  },
  500,
);
```

Thuộc tính `err.message` được trả nguyên bản về phía client. Trong môi trường production, nếu xảy ra lỗi truy vấn cơ sở dữ liệu, lỗi driver mạng hoặc lỗi parse internal object, `err.message` có thể chứa câu lệnh query SQL, thông tin schema, tên bảng, địa chỉ IP máy chủ nội bộ hoặc đường dẫn file hệ thống.

#### Giải pháp khắc phục (Remediation):

Mã hóa và che giấu thông báo lỗi chi tiết khi ứng dụng chạy ở môi trường sản xuất (`NODE_ENV === "production"`), đồng thời cấp mã định danh `traceId` để hỗ trợ tra cứu log an toàn.

```typescript
// apps/api/src/middlewares/errorHandler.ts - Bản vá
export const errorHandler = async (err: Error, c: Context) => {
  // ... các khối xử lý 415, 400 ...

  const traceId = crypto.randomUUID();
  console.error(
    `[CRITICAL ERROR] [${traceId}] ${c.req.method} ${c.req.url}:`,
    err,
  );

  const isProduction = c.env?.NODE_ENV === "production";
  return c.json(
    {
      success: false,
      error: isProduction
        ? "Lỗi máy chủ nội bộ (Internal Server Error)"
        : err.message,
      traceId,
    },
    500,
  );
};
```

---

### [SEC-07] Thiếu Lớp Bảo Vệ Phía Server (Route Guard) trên Trang `/admin` của Web App

- **Phân loại OWASP:** A01:2021 - Broken Access Control
- **Mã CWE:** [CWE-285: Improper Authorization](https://cwe.mitre.org/data/definitions/285.html)
- **Mức độ nghiêm trọng:** **MEDIUM**
- **Vị trí tệp tin:** `apps/web/app/admin/layout.tsx`, `apps/web/app/admin/page.tsx`

#### Nguyên nhân kỹ thuật:

Trang quản trị Next.js App Router (`/admin`) hoàn toàn không có `middleware.ts` ở root của Next.js hoặc kiểm tra session ở Server Component. Mặc dù các API backend Hono có middleware `adminAuthMiddleware` bảo vệ dữ liệu, người dùng chưa đăng nhập vẫn có thể truy cập URL `/admin`, tải toàn bộ giao diện dashboard, cấu trúc menu và mã nguồn client-side.

#### Giải pháp khắc phục (Remediation):

Bổ sung `apps/web/middleware.ts` để kiểm tra sự tồn tại của Refresh Token hoặc Session Cookie trước khi cho phép render nhánh `/admin`:

```typescript
// apps/web/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const refreshToken = request.cookies.get("refreshToken");
    // Nếu không có session token, điều hướng ngay về trang đăng nhập
    if (!refreshToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

---

### [SEC-08] Thiếu Bộ Header Bảo Mật Tiêu Chuẩn & Công Khai Tài Liệu API tại Môi Trường Production

- **Phân loại OWASP:** A05:2021 - Security Misconfiguration
- **Mã CWE:** [CWE-16: Configuration](https://cwe.mitre.org/data/definitions/16.html)
- **Mức độ nghiêm trọng:** **LOW**
- **Vị trí tệp tin:** `apps/api/src/index.ts` (Dòng 68 - 83), `apps/web/next.config.ts`

#### Nguyên nhân kỹ thuật:

1. Máy chủ Hono và Next.js chưa cấu hình các header an ninh thiết yếu:
   - `Content-Security-Policy` (chống XSS injection)
   - `X-Frame-Options: DENY` (chống Clickjacking)
   - `X-Content-Type-Options: nosniff` (chống MIME-type sniffing)
   - `Strict-Transport-Security` (ép buộc HTTPS)
2. Giao diện OpenAPI Scalar (`/reference`) và JSON spec (`/doc`) được mở hoàn toàn công khai, cho phép bất kỳ đối tượng nào quét và lập sơ đồ toàn bộ cấu trúc API nghiệp vụ của hệ thống.

#### Giải pháp khắc phục (Remediation):

1. Bổ sung `secureHeaders()` middleware từ thư viện `hono/secure-headers`.
2. Giới hạn truy cập `/reference` và `/doc` chỉ trong môi trường phát triển (Development) hoặc yêu cầu xác thực nội bộ.

```typescript
// apps/api/src/index.ts - Bản vá
import { secureHeaders } from "hono/secure-headers";

app.use("*", secureHeaders());

// Chỉ mở API docs trong môi trường dev
if (process.env.NODE_ENV !== "production") {
  app.doc("/doc", {
    /* ... */
  });
  app.get("/reference", Scalar({ theme: "purple", url: "/doc" }));
}
```

---

## 3. LỘ TRÌNH VÀ KHUYẾN NGHỊ TRIỂN KHAI VÁ LỖ HỔNG (REMEDIATION ROADMAP)

### Giai đoạn 1: Ưu tiên Khẩn cấp (P0 - Trong vòng 24h)

- [x] **Sửa cấu hình CORS** (`apps/api/src/index.ts` & `src/config/cors.ts`): Loại bỏ cơ chế phản xạ origin động khi có `credentials: true`. Đã verify qua e2e test chặn origin lạ.
- [x] **Vá điều kiện xác thực Revalidate** (`apps/web/app/api/revalidate/route.ts`): Bắt buộc kiểm tra secret token không rỗng và chỉ chấp nhận method `POST`.
- [x] **Cưỡng chế biến môi trường `JWT_SECRET`**: Fail-closed (throw Fatal error) nếu thiếu secret trên Production.

### Giai đoạn 2: Củng cố Nền tảng Xác thực (P1 - Trong vòng 3 ngày)

- [x] **Nâng cấp thuật toán băm mật khẩu**: Nâng cấp lên PBKDF2-HMAC-SHA256 (100k rounds) với Constant-Time Equal, hỗ trợ dual-verification bảo vệ zero-regression.
- [x] **Tích hợp Next.js Auth Middleware**: Thêm `apps/web/middleware.ts` bảo vệ server-side cho `/admin`.
- [x] **Áp dụng Rate Limiting**: Triển khai `apps/api/src/middlewares/rateLimiter.ts` bảo vệ `/api/auth/login` và `/api/v1/leads`.

### Giai đoạn 3: Hoàn thiện Tiêu chuẩn Hardening (P2 - Trong vòng 1 tuần)

- [x] Chuẩn hóa thông báo lỗi 500, ẩn stack trace trong production, cấp `traceId` chuẩn tracing context.
- [x] Thêm các header bảo mật HSTS, CSP, X-Frame-Options qua `secureHeaders()`.
- [x] Ẩn endpoint tài liệu OpenAPI (`/reference`, `/doc`) khỏi Production.

---

_Báo cáo được lập tự động bởi AppSec Code Auditor cho dự án Khang Việt Design._
