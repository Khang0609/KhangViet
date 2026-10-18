# Quy chuẩn Tailwind CSS v4 (Khang Việt Design)

Dự án sử dụng **Tailwind CSS v4**. Tuyệt đối **TUÂN THỦ cú pháp v4** và **NGHIÊM CẤM** sử dụng cú pháp v3 đã bị loại bỏ hoặc thay thế.

## 1. Bảng quy đổi cú pháp v3 ➔ v4 bắt buộc

| Cú pháp cũ v3 (CẤM) | Cú pháp mới v4 (BẮT BUỘC) | Ghi chú |
|---|---|---|
| `bg-[var(--accent)]`, `text-[var(--primary)]` | `bg-(--accent)`, `text-(--primary)` | **CSS Variables**: V4 dùng dấu ngoặc tròn `(--*)` thay vì ngoặc vuông `[var(--*)]` |
| `border-white/[0.08]`, `bg-white/[0.03]` | `border-white/8`, `bg-white/3` | **Opacity**: Dùng phần trăm số nguyên sau dấu slash `/`, không dùng ngoặc vuông số thập phân |
| `pt-[100px]`, `md:pt-[120px]`, `max-w-[1440px]` | `pt-25`, `md:pt-30`, `max-w-360` | **Continuous Spacing Scale**: V4 hỗ trợ bội số 4px liên tục, không dùng `[...]` khi đã có số chuẩn |
| `bg-gradient-to-t` / `r` / `b` / `l` | `bg-linear-to-t` / `r` / `b` / `l` | Trong v4 gradient đổi sang `bg-linear-*` |
| `outline-none` | `outline-hidden` (ẩn outline vẫn giữ a11y) hoặc `outline-none` chỉ khi reset style |
| `ring-offset-*` (`ring-offset-2`, `ring-offset-black`) | **Đã bị xóa khỏi v4**. Dùng `outline-*` hoặc `inset-ring-*` | Không dùng `ring-offset` |
| `ring-inset` | `inset-ring` | Đổi vị trí từ |
| `flex-shrink-*` | `shrink-*` (vd: `shrink-0`) | Bỏ tiền tố `flex-` |
| `flex-grow-*` | `grow-*` (vd: `grow`) | Bỏ tiền tố `flex-` |
| `text-opacity-*`, `bg-opacity-*` | Cú pháp slash (vd: `text-white/80`, `bg-black/40`) | Cú pháp opacity dạng modifier |
| `border` (không khai báo màu) | `border border-white/10` | Trong v4 `border` mặc định là `currentColor`, không phải `gray-200` |
| Cấu hình `tailwind.config.js` | Dùng `@theme` trực tiếp trong `globals.css` | V4 là CSS-first configuration |

## 2. Màu sắc thương hiệu & Tokens
- Nền chính: `#050709` (`bg-[#050709]` hoặc `bg-(--bg-obsidian)`)
- Màu nhấn (Accent): `#F58633` (`text-[#F58633]`, `bg-[#F58633]`, `border-[#F58633]` hoặc token tương ứng)
- Bronze Accent: `text-(--accent-bronze)`, `bg-(--accent-bronze)`
- Typography: `font-sans` sử dụng font **Be Vietnam Pro**, `font-mono-tech` cho nhãn kỹ thuật số.
