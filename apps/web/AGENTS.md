<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Khang Việt Project Rules

Bắt buộc tuân thủ 3 bộ quy tắc sau:
1. **Working Agreement**: Xem chi tiết tại [working-agreement.md](file:///e:/lap_trinh/Project/website/KhangVietDesign/source/.agents/rules/working-agreement.md)
   - "Do not guess missing project context". Nếu thiếu thông tin quan trọng: hỏi User với `[?] Missing information: ...`
   - Không tự giải quyết thiếu context bằng code (không viết scripts tạm).
   - Existing files là source of truth.
2. **Tailwind CSS v4 Only**: Xem chi tiết tại [tailwindcss-v4.md](file:///e:/lap_trinh/Project/website/KhangVietDesign/source/.agents/rules/tailwindcss-v4.md)
   - Nghiêm cấm cú pháp v3 (`bg-gradient-to-*`, `ring-offset-*`, `flex-shrink-*`, `outline-none` thay vì `outline-hidden`, v.v.).
3. **Giới hạn tệp <= 100 dòng & Colocation**: Xem chi tiết tại [code-organization.md](file:///e:/lap_trinh/Project/website/KhangVietDesign/source/.agents/rules/code-organization.md)
   - Không file nào vượt quá 100 dòng. Tách hook và sub-component đặt cùng cấp thư mục (sibling level).
