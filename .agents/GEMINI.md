# Khang Viet Design — Engineering Constitution

> **Hiến pháp vận hành & Quy chuẩn kỹ thuật cốt lõi** cho mọi phiên làm việc của AI Agent trên hệ thống Khang Việt Architecture & Construction.
> Tài liệu này **không** lưu trữ danh sách file, bảng DB hay API endpoints tĩnh — toàn bộ cấu trúc mã nguồn sống được truy xuất qua **Graphify Knowledge Graph** (`graphify-out/`).

---

## 1. Giao thức Graphify (Bắt buộc trước mọi thao tác code)

Dự án duy trì đồ thị tri thức mã nguồn tại `graphify-out/graph.json`. Agent phải tuân thủ:

1. **Query-first:** Trước khi `grep`, tìm kiếm hoặc đọc file thô cho bất kỳ câu hỏi nào về codebase, luôn chạy:
   - `graphify query "<câu hỏi>"` để lấy ngữ cảnh phạm vi hẹp.
   - `graphify path "<A>" "<B>"` để truy vết quan hệ giữa 2 thành phần.
   - `graphify explain "<concept>"` để hiểu chi tiết một node và các phụ thuộc trực tiếp.
   - `graphify section "<heading>"` khi cần đọc một mục trong file Markdown mà không cần mở cả file.
2. **Scoped Reading:** Chỉ mở và đọc file mã nguồn thô ở đúng dòng/vùng mà Graphify (hoặc lần đọc trước) đã định vị.
3. **Subagent Rule:** Mọi prompt giao cho subagent khám phá code phải đính kèm quy tắc dùng Graphify trên.
4. **Broad Navigation:** Chỉ đọc `graphify-out/wiki/index.md` hoặc `graphify-out/GRAPH_REPORT.md` khi cần rà soát kiến trúc tổng thể hoặc khi `query`/`path`/`explain` chưa đủ ngữ cảnh.
5. **Keep Graph Current:** Sau khi chỉnh sửa code, luôn chạy `graphify update .` (chỉ dùng AST, không tốn chi phí API) để cập nhật đồ thị.
6. **PR & Diff:** `graphify-out/graph.json` được ghi lại toàn bộ mỗi lần build, nên diff lớn ở file này trong PR là bình thường — không đánh dấu là churn hay yêu cầu bỏ qua rebuild.

---

## 2. Nguyên tắc Kiến trúc & Dữ liệu Bất biến

- **Contract-First:** Mọi thay đổi về dữ liệu hoặc API phải cập nhật schema Zod/OpenAPI tại `packages/types` và tầng contracts của API trước khi viết hoặc sửa handler.
- **Factory DB Resolution:** Không khởi tạo cứng driver cơ sở dữ liệu trong router/middleware. Luôn phân giải động qua factory (`getRepositories(c.env?.DB ? "d1" : "json", c.env?.DB)`).
- **Edge-Native & UUIDv7:** Hệ thống chạy trên Cloudflare Workers + D1 (SQLite phân tán). Mọi khóa chính mới phải tuân thủ chuẩn **UUIDv7** (RFC 9562) để bảo vệ B-Tree Index và tránh phân mảnh trang đĩa.
- **Tách biệt thông tin nhạy cảm:** Tuyệt đối không ghi API Token, Secret, hoặc thông số hạ tầng riêng tư vào file cấu hình public hoặc mã nguồn. Tham chiếu `.agents/GEMINI.private.md` khi cần thông số nội bộ.

---

## 3. Kỷ luật Git, Thao tác & Kiểm thử

- **Git Branch Discipline:** Tuân thủ quy trình tại `.agents/skills/git-branch-workflow.md`; luôn kiểm tra nhánh hiện tại trước khi stage hoặc commit.
- **Kiểm thử theo điều hướng (User-Directed Testing):** Không tự động chạy các bộ stress test, e2e hay test nặng như môi trường production sau mỗi thay đổi nhỏ để tránh lãng phí thời gian và token. Chỉ chạy đúng phạm vi test liên quan trực tiếp hoặc khi có chỉ định từ người dùng.
