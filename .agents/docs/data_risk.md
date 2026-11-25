# Sổ Tay Đánh Giá Code & Kiểm Kê Rủi Ro Dữ Liệu (Code Audit & Data Risks)

> **Mục đích:** Ghi nhận và theo dõi danh sách các điểm rủi ro, lưu ý kỹ thuật (Gotchas / Trade-offs), cùng các đề xuất tối ưu cho phần Database (D1 / SQLite), Schema, Validation và kiến trúc hệ thống sau khi rà soát mã nguồn.
> **Trạng thái:** Đang kiểm kê và rà soát (In Progress).

---

## 1. Danh Sách Kiểm Kê & Rủi Ro Dữ Liệu

### ITEM-01: Ràng Buộc & Tự Động Hóa UUIDv7 Tại Tầng Schema (Drizzle / D1)

- **Vị trí liên quan:**
  - `packages/repositories/src/d1/schema/*.ts` (các bảng `identities`, `leads`, `projects`,...)
  - `packages/repositories/src/d1/uuid-v7.ts`
  - `packages/types/src/user.ts`
- **Mức độ / Ưu tiên:** `MEDIUM` (Ảnh hưởng hiệu năng B-Tree Index và phân mảnh trang SQLite về lâu dài).
- **Hiện trạng:**
  - Bảng Drizzle định nghĩa cột ID đơn thuần: `id: text("id").primaryKey()`.
  - Việc sinh ID phụ thuộc 100% vào việc lập trình viên nhớ gọi thủ công `generateUuidV7()` tại từng Repository (`d1-lead-repository.ts`, `d1-cms-project-repo.ts`,...).
  - Tầng Zod validation tại `packages/types/` chỉ dùng `z.string().uuid()`, chấp nhận mọi phiên bản UUID (v1, v4, v7).
- **Rủi ro:**
  - Một dev khác vô tình dùng `crypto.randomUUID()` (UUIDv4) hoặc truyền chuỗi ngẫu nhiên thì hệ thống vẫn nạp thành công vào Database.
  - Phá vỡ tính chất tuần tự theo thời gian (k-sortable) của UUIDv7, dẫn đến phân mảnh trang (page fragmentation) trong SQLite/D1 khi số lượng bản ghi tăng cao.
- **Giải pháp khắc phục đề xuất:**
  1. Gắn `$defaultFn(() => generateUuidV7())` trực tiếp vào định nghĩa cột `id` trong tất cả các file schema của Drizzle ORM.
  2. Bổ sung `uuidV7Schema` dùng regex kiểm tra chữ số version (`-7xxx-`) và variant (`-[89ab]xxx-`) trong `packages/types`.
  3. (Tùy chọn) Bổ sung CHECK Constraint ở mức SQL Migration nếu cần phòng thủ tuyệt đối ở cấp DB engine.

---

### ITEM-02: Cân Nhắc Thay Thế Hàm `generateUuidV7()` Bằng Thư Viện Chuẩn (`uuidv7`)

- **Vị trí liên quan:**
  - `packages/repositories/src/d1/uuid-v7.ts`
- **Mức độ / Ưu tiên:** `LOW - OPTIMIZATION` (Cân nhắc độ ổn định khi chịu tải cao hoặc concurrency lớn).
- **Đánh giá hàm tự viết hiện tại:**
  - **Điểm cộng:** Zero-dependency, bundle siêu nhẹ, tận dụng Web Crypto API có sẵn trên Cloudflare Workers. Hoạt động tốt cho ~99% nhu cầu web thông thường (vài chục đến vài trăm request/giây).
  - **Hạn chế kỹ thuật:** Chưa triển khai cơ chế **Monotonic Counter** (tiểu mục 6.2 của RFC 9562). Nếu trong cùng một mili-giây có nhiều ID được sinh ra đồng thời trên cùng một isolate/request, thứ tự sắp xếp giữa các ID đó có thể bị xáo trộn nhẹ vì phần random không tăng tiến tuần tự.
- **Khuyến nghị & Đề xuất:**
  - Cân nhắc cài đặt package chính thức `uuidv7` (chỉ nặng ~1KB, native ESM, hỗ trợ Edge/Cloudflare Workers hoàn hảo).
  - Thư viện ngoài đã tích hợp sẵn sub-millisecond precision và monotonic counter đảm bảo tính thứ tự tuyệt đối 100% ngay cả khi burst traffic cao.
  - Đóng gói hàm xuất ra từ `@khangviet/repositories` để các package khác chỉ cần import dùng chung một điểm duy nhất.

---

### ITEM-03: Tính Toàn Vẹn Khi Tạo Lead (Transaction ACID & Phone Constraint)

- **Vị trí liên quan:**
  - `packages/repositories/src/d1/repositories/d1-lead-repository.ts` (`findOrCreateIdentity` & `createLead`)
  - `packages/repositories/src/d1/schema/identities.schema.ts`
- **Mức độ / Ưu tiên:** `MEDIUM` (Ảnh hưởng tính nhất quán dữ liệu khi lỗi mạng hoặc concurrency).
- **Hiện trạng:**
  - Việc kiểm tra/tạo `identity` và tạo `lead` là 2 câu lệnh SQL riêng biệt, chưa bọc trong transaction `batch()`.
  - Cột `phone` trong bảng `identities` mới chỉ có index tìm kiếm thông thường (`index`), chưa có ràng buộc duy nhất (`unique`).
- **Rủi ro:**
  - Nếu bước insert `lead` bị lỗi giữa chừng, sẽ sinh ra `identity` mồ côi không có đơn tư vấn.
  - Hai request từ cùng 1 số điện thoại gửi tới đồng thời trong cùng 1 tích tắc (race condition) có thể tạo ra 2 bản ghi identity trùng lặp.
- **Giải pháp khắc phục đề xuất:**
  1. Bọc chuỗi thao tác tạo identity và lead vào `client.batch([...])` của Cloudflare D1 để đảm bảo tính nguyên tử (Atomic).
  2. Cân nhắc thêm `unique()` cho cột `phone` trong bảng `identities`.

---

### ITEM-04: Chiến Lược Lưu Trữ Media & Rủi Ro Broken Asset Khi Dùng Chung (R2 vs D1)

- **Vị trí liên quan:**
  - `packages/repositories/src/d1/schema/project-media.schema.ts`
  - `.agents/docs/architecture-handbook-database-media-ui.md` (Mục 5)
- **Mức độ / Ưu tiên:** `ARCHITECTURAL DECISION` (Đã chốt phương án).
- **Phân tích bối cảnh & Rủi ro:**
  - Bảng `project_media` có ràng buộc `ON DELETE CASCADE` theo `projectId`.
  - Nếu 2 dự án A và B cùng dùng chung 1 file vật lý trên Cloudflare R2 (`r2_key`), khi xóa dự án A và dọn dẹp R2, file vật lý sẽ biến mất khiến dự án B bị lỗi hiển thị ảnh (Broken Image / 404).
- **Quyết định kiến trúc (Architecture Decision):**
  - **Chọn Hướng 1 (Isolated Asset Copies):** Chấp nhận mỗi dự án lưu trữ file vật lý hoàn toàn độc lập (`projects/{projectId}/{mediaId}.webp`). Nếu 2 dự án có dùng chung ảnh thì lưu thành 2 file riêng trên R2.
  - **Lý do chọn:**
    - Cực kỳ an toàn, loại bỏ 100% rủi ro xóa nhầm chéo (zero side-effects).
    - Scope hiện tại là Landing Page & Portfolio Showcase, tần suất trùng lặp ảnh giữa các công trình kiến trúc gần như bằng 0.
    - Cloudflare R2 cung cấp 10 GB lưu trữ miễn phí vĩnh viễn và **0đ phí băng thông (Zero Egress)**. Ảnh WebP nén (~100–300KB) hoàn toàn nằm trong hạn mức free tier trong nhiều năm tới.
  - **Kế hoạch tương lai:** Hướng 2 (Media Library DAM tập trung với bảng liên kết N-N và reference counting) sẽ được xem xét nâng cấp khi hệ thống mở rộng sang phân hệ E-commerce hoặc Quản lý Kho vật liệu diện rộng.
- **Quy tắc bắt buộc cho code service R2:**
  - Tuyệt đối không cho phép 2 bản ghi `project_media` khác `projectId` trỏ chung một `r2_key`.
  - Prefix đường dẫn R2 bắt buộc phải luôn chứa `projectId`: `projects/${projectId}/${uuid}.webp`.

---

### ITEM-05: Rủi Ro Lưu Trữ Đóng Băng JSON (Anti-Pattern) Cho `hero_slides` và `legal_info` Trong `cms_metadata`

- **Vị trí liên quan:**
  - `packages/repositories/src/d1/schema/cms.schema.ts` (bảng `cms_metadata`)
  - `apps/api/src/routes/adminCms.ts`
  - Giao diện Admin CMS & Trang chủ Web App
- **Mức độ / Ưu tiên:** `HIGH - REFACTOR ARCHITECTURE` (Ảnh hưởng nghiêm trọng đến khả năng truy vấn, chuẩn hóa dữ liệu quan hệ và mở rộng B2B).
- **Hiện trạng thực tế:**
  - Bảng `cms_metadata` hiện tại được dùng như một Key-Value Document Store tạm bợ: cột `key` text ('hero_slides' | 'legal_info') và cột `value_json` chứa một chuỗi JSON khổng lồ bị ép phẳng.
  - Cả 2 thực thể này vốn dĩ **hoàn toàn không có quan hệ nghiệp vụ gì với nhau**, nhưng lại bị nhồi nhét chung vào một bảng generic dạng text blob.
- **Phân tích rủi ro & Bất cập kỹ thuật:**
  1. **Đối với `hero_slides`:**
     - Bản chất mỗi Slide là một thực thể độc lập có danh tính (ID, hình ảnh, tiêu đề, nút CTA, thứ tự hiển thị `display_order`, trạng thái `is_active`).
     - Việc gom thành 1 mảng JSON trong 1 dòng khiến D1 không thể đánh Index, không thể query đơn lẻ (như query all slides active, sắp xếp theo sort order trực tiếp bằng SQL), và mỗi lần thêm/sửa 1 slide bắt buộc phải đọc - parse - ghi đè lại toàn bộ mảng JSON (dễ gây race condition ghi đè mất dữ liệu).
  2. **Đối với `legal_info` (Thông tin pháp lý & Hồ sơ doanh nghiệp):**
     - Đang bị ép thành một JSON object đơn điệu (`fullName`, `taxId`, `hotline`, `email`, `factoryAddress`,...).
     - Không thể tích hợp hoặc liên kết khóa ngoại với các phân hệ khác (ví dụ: gán chi nhánh xưởng sản xuất, phân quyền nhiều pháp nhân, hợp đồng B2B).
     - Lưu trữ dạng này làm mất hoàn toàn tính kiểm soát kiểu dữ liệu và toàn vẹn của RDBMS (không có kiểu cột riêng, không có CHECK constraint).
- **Định hướng kiến trúc & Giải pháp đề xuất:**
  1. **Tách riêng bảng `hero_slides`:**
     - Thiết kế bảng riêng: `id` (UUIDv7), `title`, `subtitle`, `image_url`, `cta_label`, `cta_link`, `display_order` (integer), `is_active` (boolean), `created_at`, `updated_at`.
     - Cho phép câu lệnh SQL chuẩn: `SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY display_order ASC`.
  2. **Dàn phẳng và quy hoạch thành bảng `businesses` (Hồ Sơ Doanh Nghiệp / B2B):**
     - Thay vì lưu JSON `legal_info`, thiết kế bảng chuẩn hóa chuyên biệt (ví dụ `businesses` hoặc `company_profiles`).
     - Từng thuộc tính pháp lý (Mã số thuế, Ngày cấp, Người đại diện, Hotline, Email, Địa chỉ trụ sở, Địa chỉ xưởng) trở thành các cột RDBMS tường minh, có kiểu dữ liệu rõ ràng.
     - Sẵn sàng tái sử dụng làm bảng thông tin đối tác B2B, nhà thầu phụ, hoặc khách hàng doanh nghiệp sau này khi mở rộng hệ thống mà không cần đập đi xây lại.

---

### ITEM-06: Cơ Chế Token Không Tự Động Refresh & Bị Treo Phiên Đăng Nhập Trên Giao Diện Admin

- **Vị trí liên quan:**
  - `apps/web/components/modules/admin/shared/adminClient.ts`
  - `apps/web/middleware.ts` / `apps/web/app/admin/layout.tsx`
  - `apps/api/src/routes/auth.ts` (`POST /api/auth/refresh`)
- **Mức độ / Ưu tiên:** `HIGH - UX & SECURITY` (Trải nghiệm quản trị viên bị gián đoạn và rủi ro treo phiên làm việc không kiểm soát).
- **Hiện trạng thực tế:**
  - Sau khi đăng nhập thành công vào Admin, client nhận được `accessToken` (lưu tại `localStorage` với key `kv_access_token`) và `refreshToken` (lưu tại HTTP-only cookie).
  - Client hiện tại chưa có cơ chế Interceptor hoặc cơ chế tự động theo dõi thời hạn token (Silent Refresh / Token Expiry Tracker):
    - Khi `accessToken` hết hạn sau một khoảng thời gian làm việc, hệ thống hoàn toàn **không chủ động làm mới token (auto-refresh)**.
    - Đồng thời, UI cũng **không phát hiện kịp thời để điều hướng người dùng ra trang login** hoặc hiển thị thông báo phiên làm việc đã kết thúc.
  - Người dùng vẫn thao tác bình thường trên form/dashboard, nhưng khi nhấn nút Lưu/Cập nhật (gọi tới các protected endpoint của admin: `/api/v1/admin/cms/*`), API trả về mã lỗi `401 Unauthorized`. Lúc này dữ liệu đang nhập trên giao diện có nguy cơ bị mất hoặc gây bối rối cho quản trị viên.
- **Rủi ro:**
  1. **Mất mát dữ liệu thao tác:** Quản trị viên nhập thông tin bài viết/dự án trong thời gian dài, khi token hết hạn thì không lưu được và có thể mất trắng nội dung đã nhập nếu trang bị reload.
  2. **Trải nghiệm người dùng (UX) kém:** Giao diện không phản hồi đúng trạng thái xác thực thời gian thực.
  3. **Lỗ hổng xử lý phiên:** Thiếu cơ chế xử lý đồng bộ giữa trạng thái cookie và token trong client memory/localStorage.
- **Giải pháp khắc phục đề xuất:**
  1. **Triển khai Auto-Refresh trong `adminClient.ts` (Fetch Interceptor):**
     - Khi bất kỳ request API nào trả về status `401 Unauthorized`, interceptor tự động tạm hoãn request đó và gọi endpoint `POST /api/auth/refresh` (dùng `refreshToken` từ cookie).
     - Nếu cấp mới token thành công: Lưu `accessToken` mới vào `localStorage`, gắn lại header `Authorization` và tự động retry lại request ban đầu một cách liền mạch (Transparent Retry).
  2. **Xử lý đăng xuất dứt khoát khi Refresh Token hết hạn:**
     - Nếu request refresh thất bại (hoặc refresh token cũng đã hết hạn/bị thu hồi): Xóa sạch token cũ khỏi `localStorage`, xóa cookie phiên và chủ động chuyển hướng người dùng về `/login?redirect=/admin` kèm thông báo phiên làm việc đã hết hạn.
  3. **(Tùy chọn nâng cao) Proactive Refresh Timer:**
     - Đọc trường `exp` trong payload JWT của `accessToken` để lên lịch tự động refresh ngầm trước thời điểm hết hạn từ 1 đến 2 phút.

---

### ITEM-06: Tối Ưu Độ Trễ Thao Tác Lưu Dữ Liệu CMS (Tách Riêng Pending Change & Accept Sync)

- **Vị trí liên quan:**
  - `apps/web/components/modules/admin/*` (các handler lưu form CMS)
  - `apps/api/src/routes/adminCms.ts`
  - `packages/repositories/src/d1/repositories/d1-cms-repository.ts`
- **Mức độ / Ưu tiên:** `MEDIUM - PERFORMANCE / UX` (Thao tác lưu trên giao diện admin bị chậm).
- **Hiện trạng thực tế:**
  - Hiện tại mỗi lần quản trị viên nhấn "Lưu" (dự án, slider hero, thông tin pháp lý), hệ thống đang kết hợp (combine) đồng thời 2 công việc nặng:
    1. Tạo một bản ghi Pending Change vào hàng đợi (`POST /pending-changes`).
    2. Kích hoạt xuất bản/áp dụng ngay lập tức (`POST /apply-changes` hoặc trigger revalidate/sync).
  - Quá trình này bắt client phải chờ trọn vẹn cả chu trình ghi đè DB + đồng bộ cache, khiến thời gian phản hồi (latency) trên nút bấm kéo dài đáng kể.
- **Giải pháp khắc phục đề xuất (Đưa vào backlog ưu tiên sau):**
  - Tách bạch rõ ràng 2 khâu: "Lưu bản nháp/Staging" (phản hồi tức thì < 50ms) và "Xuất bản chính thức / Midnight Sync" (quản trị viên chủ động bấm nút Đồng bộ hoặc hệ thống chạy theo batch).
  - Sử dụng cơ chế Optimistic UI ở frontend để phản hồi tức thì cho người dùng trong lúc request chạy ngầm.

---

_(Tiếp tục bổ sung các phát hiện khác trong quá trình kiểm tra...)_
