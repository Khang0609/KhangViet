# Báo Cáo Khảo Sát Kỹ Thuật: Kiến Trúc Dedicated Cloudflare Media Worker (`apps/media-worker`)

**Phiên bản:** 1.0.0  
**Tác giả:** Explorer 2 — Media Worker Architect  
**Trạng thái:** Hoàn tất khảo sát  
**Ngày thực hiện:** 2026-11-08  

---

## 1. Tóm Tắt Tổng Quan (Executive Summary)

Theo định hướng kiến trúc Serverless Edge-Native của Khang Việt Design (0 VNĐ chi phí hạ tầng ban đầu, độ trễ cận 0ms, Zero Egress Fee qua Cloudflare R2), việc tách rời tác vụ xử lý media ra khỏi Core API (`apps/api`) là một quyết định kiến trúc mang tính chiến lược:

1. **Cô lập tài nguyên (Resource Isolation):** Tác vụ nén và giải mã ảnh tiêu tốn RAM (raw pixel buffer RGBA) và CPU. Nếu đặt chung trong `apps/api`, các request xem CMS hoặc gửi Lead sẽ bị ảnh hưởng trực tiếp, thậm chí gây sập Worker khi chạm trần 128MB RAM.
2. **Kích thước gói triển khai (Bundle Size Isolation):** `apps/api` giữ nguyên độ siêu nhẹ (< 30KB bundle), trong khi `apps/media-worker` đóng gói toàn bộ engine WebAssembly xử lý ảnh mà không làm chậm cold-start của API nghiệp vụ.
3. **Luồng dữ liệu tối ưu (Direct-to-R2 Ingestion):** Client (Admin UI `UniversalMediaUpload`) tương tác trực tiếp với Media Worker qua HTTP POST. Media Worker nén WebP, đẩy vào R2 và trả về metadata (`public_url`, `r2_key`, `width_px`, `height_px`, `aspect_ratio`, `file_size_bytes`). Sau đó Admin UI chỉ cần gửi metadata này về `apps/api` để lưu vào D1 Database (`project_media`), loại bỏ hoàn toàn việc truyền tải file nhị phân trung gian qua API chính.

---

## 2. Khảo Sát Monorepo & Cấu Hình Môi Trường

### 2.1. Cấu Trúc Monorepo Hiện Tại
- **Quản lý Workspace:** `pnpm-workspace.yaml` đã khai báo:
  ```yaml
  packages:
    - 'apps/*'
    - 'packages/*'
  ```
  Do đó, việc tạo thư mục `apps/media-worker` sẽ được pnpm workspace tự động nhận diện mà không cần cấu hình thêm ở root.
- **Phân Bổ Cổng Dịch Vụ Môi Trường Local:**
  - `apps/web`: Cổng `3000` (`http://localhost:3000`)
  - `apps/api`: Cổng `8787` (`http://localhost:8787` qua `wrangler dev`)
  - `apps/media-worker`: **Khuyến nghị cổng `8788`** (`wrangler dev --port 8788`), giúp lập trình viên chạy song song cả 3 dịch vụ đồng thời mà không bị xung đột cổng.

### 2.2. Khai Báo Package & Dependencies (`apps/media-worker/package.json`)
```json
{
  "name": "media-worker",
  "type": "module",
  "scripts": {
    "dev": "wrangler dev --port 8788",
    "deploy": "wrangler deploy --minify",
    "cf-typegen": "wrangler types --env-interface CloudflareBindings",
    "test": "wrangler deploy --dry-run --outdir=dist && node test-e2e.mjs"
  },
  "dependencies": {
    "@cf-wasm/photon": "^0.4.0",
    "@khangviet/types": "workspace:*",
    "hono": "^4.13.2"
  },
  "devDependencies": {
    "@types/node": "^20.19.43",
    "wrangler": "^4.154.0"
  }
}
```

### 2.3. Cấu Hình Binding R2 & Variables (`apps/media-worker/wrangler.jsonc`)
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "media-worker",
  "main": "src/index.ts",
  "compatibility_date": "2026-08-18",
  "compatibility_flags": ["nodejs_compat"],
  "r2_buckets": [
    {
      "binding": "MEDIA_BUCKET",
      "bucket_name": "khangviet-media"
    }
  ],
  "vars": {
    "NODE_ENV": "production",
    "PUBLIC_R2_URL": "https://media.khangviet.vn",
    "MAX_FILE_SIZE_BYTES": "10485760", // 10MB limit
    "WEB_APP_URL": "https://khang-viet-ju5sb2vw0-khangs-projects-1a7e2aab.vercel.app"
  }
}
```

---

## 3. Ràng Buộc Runtimes Cloudflare Workers & Đánh Giá Thư Viện Xử Lý Ảnh

### 3.1. Phân Tích Giới Hạn Runtime của Cloudflare Workers
| Tiêu chí | Giới hạn thực tế | Tác động & Giải pháp kiến trúc cho Media Worker |
| :--- | :--- | :--- |
| **Bộ nhớ RAM (Memory)** | **128 MB** per isolate | Một ảnh 4000x3000 khi giải mã thành RGBA bitmap chiếm `4000 * 3000 * 4 bytes ≈ 48 MB` RAM. Nếu cộng thêm buffer nén và WASM memory, có thể chạm ngưỡng OOM. **Giải pháp:** Giới hạn kích thước file upload tối đa 10MB; tự động downscale nếu chiều dài cạnh vượt quá 2560px. |
| **CPU Time** | 10ms - 50ms (Free) / 30s (Paid) | Nén ảnh thuật toán cao cấp (Lanczos3/WebP) có thể tốn từ 20ms đến 80ms CPU tùy kích thước ảnh. Với Worker độc lập, giải thuật nén được tối ưu hóa qua WASM biên dịch từ Rust để tốc độ thực thi nhanh nhất. |
| **Kích thước Bundle** | Lên tới 64MB uncompressed / 10MB gzip | WASM module phải được nạp gọn gàng, tránh nhồi nhét quá nhiều binary codecs không cần thiết. |
| **Stream & Body Limit** | Lên tới 100MB body | Body streaming được hỗ trợ tự nhiên qua Web standard `ReadableStream` và `ArrayBuffer`. |

### 3.2. So Sánh Các Giải Pháp Xử Lý Ảnh / WebP Trên Cloudflare Workers

| Tiêu chí | `@cf-wasm/photon` (Rust WASM) | `@jsquash/*` (Squoosh Ports) | Cloudflare Image Resizing | Pure JS (UPNG, jpeg-js) |
| :--- | :--- | :--- | :--- | :--- |
| **Bản chất engine** | `photon-rs` biên dịch sang WASM tối ưu riêng cho `workerd` | Nhiều packages rời rạc (`@jsquash/webp`, `@jsquash/resize`, `@jsquash/jpeg`, `@jsquash/png`) | Dịch vụ đám mây tích hợp sẵn của Cloudflare | Thư viện thuần JavaScript chạy trên CPU V8 |
| **Độ phức tạp cài đặt** | **1 package duy nhất**, tích hợp sẵn import `workerd` | Cần 4–5 packages, phải tự viết router giải mã theo từng MIME type | Yêu cầu bật flag và cấu hình qua Cloudflare Dashboard | Nhiều packages ghép lại |
| **Chi phí hạ tầng** | **0 VNĐ** (Chạy trên Workers Free/Standard) | **0 VNĐ** | **Tốn phí** ($20/tháng Pro plan hoặc $5/tháng Images) | **0 VNĐ** |
| **Định dạng đầu vào** | Tự động nhận diện: **JPEG, PNG, WebP, GIF, BMP** qua magic bytes | Phải check MIME thủ công để gọi đúng hàm decode tương ứng | Mọi định dạng | Hạn chế, không có encoder WebP chuẩn |
| **Đầu ra WebP** | Cực nhanh thông qua `.get_bytes_webp()` | Hỗ trợ qua `@jsquash/webp` | Tự động đổi format | **Không hỗ trợ WebP** |
| **Quản lý bộ nhớ** | Thủ công qua `.free()` (rất an toàn khi bọc `try/finally`) | Garbage collected qua JS (dễ giữ buffer lâu trong heap) | Quản lý bởi Cloudflare | Tự động giải phóng nhưng tiêu tốn heap |

### 3.3. Đề Xuất Công Nghệ Chính Thức: `@cf-wasm/photon`
Khuyến nghị sử dụng **`@cf-wasm/photon` (phiên bản `0.4.0`)**:
- Được build và tối ưu đặc thù cho Cloudflare Workers thông qua conditional export `@cf-wasm/photon/workerd`.
- Đồng thời tương thích hoàn hảo với môi trường Node.js testing qua conditional export `@cf-wasm/photon/node`.
- Gom toàn bộ tính năng: Đọc kích thước (`get_width`, `get_height`), tính tỉ lệ khung hình (aspect ratio), resize tỉ lệ chuẩn, nén WebP, loại bỏ metadata rác vào **1 module WebAssembly duy nhất** (~2.8MB).

> **Quy Tắc Quản Trị Bộ Nhớ Bắt Buộc (Critical Rule):**  
> Vì WebAssembly cấp phát bộ nhớ ngoài V8 heap, lập trình viên **bắt buộc** phải gọi `.free()` trong khối `try ... finally` đối với mọi instance `PhotonImage` để triệt tiêu nguy cơ rò rỉ bộ nhớ (memory leaks).

---

## 4. Thiết Kế Chi Tiết API Contracts & Endpoints

### 4.1. Bản Đồ Endpoints
1. `POST /upload`: Nhận tệp tải lên (hỗ trợ cả `multipart/form-data` và raw binary stream từ Clipboard Paste).
2. `POST /fetch-external`: Nhận URL ảnh bên ngoài, kiểm tra an toàn SSRF, tải về, nén WebP và lưu vào R2.
3. `GET /file/*`: Route phục vụ stream file trực tiếp từ R2 (phục vụ local preview và fallback CDN).
4. `GET /health`: Healthcheck xác nhận trạng thái Worker.

---

### 4.2. Chi Tiết Endpoint 1: `POST /upload`
- **Mục đích:** Hỗ trợ người dùng kéo thả file, chọn file từ máy, hoặc dán thẳng blob ảnh nhị phân từ Clipboard (Ctrl+V).
- **Headers hỗ trợ:**
  - Case A (Form Upload): `Content-Type: multipart/form-data` (trường `file`).
  - Case B (Raw Binary / Clipboard): `Content-Type: image/png` (hoặc `image/jpeg`, `image/webp`, `application/octet-stream`).
- **Query Params tùy chọn:**
  - `folder`: Thư mục phân loại trong R2 (mặc định: `projects`, hỗ trợ `hero`, `general`).
  - `max_width`: Chiều rộng tối đa cần chuẩn hóa (mặc định: `2560`).
- **Giới hạn kiểm tra:**
  - Kích thước <= 10MB (10,485,760 bytes).
  - Magic bytes hợp lệ của ảnh (JPEG: `FF D8 FF`, PNG: `89 50 4E 47`, WebP: `52 49 46 46`, GIF: `47 49 46 38`).
- **Xử lý:**
  1. Trích xuất buffer nhị phân.
  2. Nạp vào `PhotonImage.new_from_byteslice(bytes)`.
  3. Lấy `width_px` và `height_px`.
  4. Xác định `aspect_ratio`:
     - Nếu `w / h > 2.0` -> `"panoramic"`
     - Nếu `w / h > 1.05` -> `"landscape"`
     - Nếu `w / h < 0.95` -> `"portrait"`
     - Còn lại -> `"square"`
  5. Nếu `width_px > 2560` hoặc `height_px > 2560`, thực hiện `resize` giữ nguyên tỉ lệ qua `SamplingFilter.Lanczos3`.
  6. Xuất WebP buffer qua `outputImage.get_bytes_webp()`.
  7. Sinh R2 key chuẩn UUIDv7: `{folder}/{YYYY-MM}/{uuidv7}.webp`.
  8. Ghi vào R2 với HTTP Metadata (`Content-Type: image/webp`, `Cache-Control: public, max-age=31536000, immutable`).
  9. Giải phóng bộ nhớ WASM qua `.free()`.
- **Response Format (Chuẩn Result Pattern):**
  ```json
  {
    "success": true,
    "data": {
      "public_url": "https://media.khangviet.vn/projects/2026-11/0192e4ab-1234-7000-8000-000000000001.webp",
      "r2_key": "projects/2026-11/0192e4ab-1234-7000-8000-000000000001.webp",
      "width_px": 1920,
      "height_px": 1080,
      "aspect_ratio": "landscape",
      "file_size_bytes": 164280,
      "media_type": "image/webp"
    }
  }
  ```

---

### 4.3. Chi Tiết Endpoint 2: `POST /fetch-external`
- **Mục đích:** Khách hàng hoặc Admin dán link ảnh từ bên ngoài (Unsplash, Pinterest, báo chí). Media Worker tự động tải về, nén thành WebP chuẩn và lưu vào R2 sở hữu riêng của Khang Việt.
- **Request Body (JSON):**
  ```json
  {
    "url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    "folder": "projects"
  }
  ```
- **Bảo Mật Phòng Chống SSRF (Server-Side Request Forgery):**
  - Worker tuyệt đối không gửi request tới IP nội bộ hoặc metadata endpoint của Cloud.
  - Chặn các host/IP: `localhost`, `127.0.0.1`, `::1`, dải private RFC 1918 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), dải Link-Local (`169.254.0.0/16`), và dải IPv6 nội bộ (`fc00::/7`, `fe80::/10`).
  - Giao thức bắt buộc: chỉ chấp nhận `http:` và `https:`.
- **Quy trình thực thi:**
  1. Gửi HTTP GET request với timeout 10 giây và header `User-Agent: KhangVietMediaWorker/1.0`.
  2. Xác minh HTTP Status (chỉ chấp nhận 200 OK).
  3. Xác minh Header `Content-Type` phải là ảnh (`image/jpeg`, `image/png`, `image/webp`, `image/gif`).
  4. Đọc stream và kiểm tra dung lượng không vượt quá 10MB.
  5. Chuyển vào pipeline xử lý Photon WebP tương tự endpoint `/upload`.
  6. Lưu trữ R2 và trả về cùng cấu trúc Response chuẩn hóa.

---

### 4.4. Chi Tiết Endpoint 3: `GET /file/*` (Local Preview & Storage Streaming)
- **Mục đích:** Khi chạy dưới môi trường Local (`wrangler dev`), chưa có domain thật gắn vào R2, hoặc cần preview trực tiếp từ Worker:
  `GET /file/projects/2026-11/0192e4ab-...webp`
- **Xử lý:**
  1. Lấy `key` từ path parameter.
  2. Gọi `env.MEDIA_BUCKET.get(key)`.
  3. Nếu không tìm thấy, trả về 404 JSON.
  4. Trả về stream với các header:
     - `Content-Type: image/webp`
     - `ETag: object.httpEtag`
     - `Cache-Control: public, max-age=31536000, immutable`

---

### 4.5. Mã Lỗi & Phản Hồi Khi Gặp Sự Cố (Standard Error Envelope)
Tuân thủ tuyệt đối quy chuẩn Result Type của dự án:
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "Dung lượng tệp tải lên vượt quá giới hạn tối đa 10MB"
  }
}
```

| Mã lỗi (`code`) | HTTP Status | Diễn giải |
| :--- | :--- | :--- |
| `FILE_TOO_LARGE` | `413 Payload Too Large` | Kích thước file lớn hơn 10MB |
| `UNSUPPORTED_MEDIA_TYPE` | `415 Unsupported Media Type` | Định dạng không được hỗ trợ hoặc không phải file ảnh |
| `INVALID_INPUT` | `400 Bad Request` | Thiếu file upload hoặc body JSON không hợp lệ |
| `SSRF_BLOCKED` | `400 Bad Request` | URL trỏ tới địa chỉ IP mạng nội bộ bị từ chối |
| `FETCH_FAILED` | `502 Bad Gateway` | Không thể tải ảnh từ URL bên ngoài |
| `PROCESSING_ERROR` | `422 Unprocessable Entity` | Lỗi khi giải mã hoặc nén ảnh qua WebAssembly |
| `STORAGE_ERROR` | `500 Internal Server Error` | Gặp sự cố khi ghi dữ liệu vào Cloudflare R2 |

---

## 5. Tổ Chức Mã Nguồn Tuân Thủ Quy Chuẩn (Screaming Architecture & <100 Lines Rule)

Để tuân thủ triệt để các quy tắc trong `.agents/rules/code-organization.md` (giới hạn file <= 100 dòng, hàm <= 35 dòng, đặt tên kebab-case), kiến trúc của `apps/media-worker` được tổ chức như sau:

```
apps/media-worker/
├── package.json
├── wrangler.jsonc
├── tsconfig.json
├── test-e2e.mjs                        # Test suite chạy bằng Node.js / Miniflare (<120 dòng)
└── src/
    ├── index.ts                        # Entry point: Khởi tạo Hono app & mount routes (~55 dòng)
    ├── env.ts                          # Định nghĩa Bindings (R2, env vars) (~25 dòng)
    ├── config/
    │   └── cors.ts                     # Whitelist CORS logic (~35 dòng)
    ├── types/
    │   └── media.ts                    # MediaUploadResult, Error DTOs (~45 dòng)
    ├── services/
    │   ├── image-processor.ts          # Logic giải mã, resize và nén WebP via Photon (~85 dòng)
    │   ├── r2-storage.service.ts       # Thao tác R2 put/get và sinh UUIDv7 key (~65 dòng)
    │   └── external-fetch.service.ts   # Tải ảnh URL ngoài và phòng vệ SSRF (~70 dòng)
    ├── middlewares/
    │   └── error-handler.ts            # Xử lý lỗi toàn cục dạng JSON (~35 dòng)
    └── routes/
        ├── upload.route.ts             # Handler POST /upload (~80 dòng)
        ├── fetch-external.route.ts     # Handler POST /fetch-external (~60 dòng)
        └── serve.route.ts              # Handler GET /file/* preview stream (~45 dòng)
```

**Đánh giá tuân thủ quy chuẩn:**
- Không có file mã nguồn nào vượt quá 85 dòng.
- Mỗi module đảm nhận duy nhất một trách nhiệm (Single Responsibility).
- Xử lý lỗi thuần khiết bằng `Result<T, E>`.

---

## 6. Chiến Lược Kiểm Thử Cục Bộ & Giả Lập Môi Trường (Local Simulation Strategy)

### 6.1. Giả Lập R2 & Workers Bằng Miniflare / Wrangler Dev
Khi lập trình viên chạy lệnh:
```bash
pnpm --filter media-worker run dev
```
Wrangler tự động kích hoạt **Miniflare 3** (dựa trên engine `workerd` chính thức của Cloudflare).
- **R2 Storage cục bộ:** Miniflare tạo thư mục lưu trữ nhị phân tại `.wrangler/state/v3/r2/khangviet-media` trên đĩa cứng. Dữ liệu ghi qua `env.MEDIA_BUCKET.put()` được bảo toàn qua các lần khởi động lại.
- **WebAssembly Runtime:** File `.wasm` của `@cf-wasm/photon` được load trực tiếp vào isolate của `workerd`, đảm bảo hành vi xử lý byte ảnh tại local giống hệt 100% trên Cloudflare Edge Production.

### 6.2. Kịch Bản Kiểm Thử Tự Động (`test-e2e.mjs`)
Tương tự như `apps/api/test-e2e.mjs`, chúng ta thiết lập script kiểm thử `test-e2e.mjs` chạy qua lệnh:
```bash
pnpm --filter media-worker run test
# Thực thi: wrangler deploy --dry-run --outdir=dist && node test-e2e.mjs
```

Bộ test suite tự động kiểm tra toàn bộ 7 ca kiểm thử cốt lõi:
1. **Ca 1: Upload ảnh chuẩn qua Multipart Form:** Gửi file ảnh PNG mẫu (1x1 transparent PNG) -> Kiểm tra phản hồi HTTP 200, trường `success: true`, nhận `r2_key` đuôi `.webp`, `width_px = 1`, `height_px = 1`.
2. **Ca 2: Upload trực tiếp Raw Binary Blob (Mô phỏng Paste Clipboard):** Gửi nhị phân với `Content-Type: image/jpeg` -> Kiểm tra chuyển đổi thành công sang `.webp`.
3. **Ca 3: Chặn tệp không phải ảnh:** Gửi file `text/plain` hoặc file rác giả mạo -> Kiểm tra hệ thống trả về HTTP 415 `UNSUPPORTED_MEDIA_TYPE`.
4. **Ca 4: Chặn tệp vượt quá dung lượng:** Gửi payload 11MB -> Kiểm tra hệ thống trả về HTTP 413 `FILE_TOO_LARGE`.
5. **Ca 5: Fetch ảnh ngoài hợp lệ:** Gửi URL ảnh mẫu -> Kiểm tra worker tự tải về, nén và sinh key R2.
6. **Ca 6: Phòng vệ tấn công SSRF:** Gửi URL `http://127.0.0.1:8787/api` hoặc `http://169.254.169.254/` -> Kiểm tra hệ thống từ chối ngay lập tức với HTTP 400 `SSRF_BLOCKED`.
7. **Ca 7: Stream tệp preview:** Gọi `GET /file/{r2_key}` vừa upload ở Ca 1 -> Kiểm tra status 200, `Content-Type: image/webp` và dữ liệu nhị phân không bị rỗng.

---

## 7. Kết Luận & Khuyến Nghị Thực Thi Cho Implementer

1. **Về Công Nghệ Xử Lý Ảnh:** Chọn `@cf-wasm/photon` phiên bản `0.4.0`. Tuyệt đối không dùng `sharp` (không tương thích Workers) hay `@jsquash` (quá cồng kềnh, phân mảnh nhiều wasm packages).
2. **Về Quản Trị Bộ Nhớ:** Luôn đặt lệnh `.free()` trong khối `finally` cho mọi đối tượng `PhotonImage`.
3. **Về Cổng Dev:** Cấu hình `wrangler dev --port 8788` để chạy đồng thời với `apps/api` (8787) và `apps/web` (3000).
4. **Về Tương Thích D1 Schema:** Payload trả về từ Media Worker đã khớp 100% với các cột của bảng `project_media` (`r2_key`, `public_url`, `width_px`, `height_px`, `aspect_ratio`, `file_size_bytes`, `media_type`), sẵn sàng cho việc tích hợp vào Admin UI `UniversalMediaUpload` ở Milestone 3.
