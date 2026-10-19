export const WIREFRAME_SPEC_TEXT = `================================================================================
KHANG VIET DESIGN (SINCE 2009) — PIXEL-LEVEL WIREFRAME & INTERACTION BLUEPRINT
================================================================================

[KHỐI 1: HEADER & STICKY GLASSMORPHISM NAVIGATION]
- Chiều cao: 80px (h-20) cố định top-0, z-index: 50.
- Nền: bg-(--bg-obsidian)/85 + backdrop-blur-md (12px) + border-b 1px rgba(255,255,255,0.08).
- Cột Trái: Logo Khang Việt nguyên bản trên nền đen sâu (#0B0C0E), chiều cao 40px, tôn sắc cam #F27D26 như đèn hiệu ban đêm.
- Cột Giữa: 4 mục điều hướng (01. Dự án | 02. Lĩnh vực | 03. Năng lực xưởng | 04. Về Khang Việt), font Plus Jakarta Sans 13px, gap 36px, chỉ số mono #D4A373.
- Cột Phải:
  + CTA 1 (Outline): border 1px solid #D4A373, padding 10px 18px, chữ #D4A373 -> Hover: bg-(--accent-bronze) chữ #111215.
  + CTA 2 (Hotline): Nút "0903 680 449" kèm chấm đèn trạng thái hoạt động màu hổ phách.

[KHỐI 2: ASYMMETRIC HERO SECTION (12-COLUMN EDITORIAL GRID)]
- Padding dọc: Top 128px / Bottom 96px. Nền: Lưới kỹ thuật CAD 64x64px cực mờ (opacity 2.5%).
- Bố cục bất đối xứng:
  + Cột Trái (5/12 cột - lg:col-span-5):
    * Eyebrow Badge: "SINCE 2009 • ARCHITECTURAL SIGNAGE & INTERIOR CONTRACTOR" (11px, tracking 0.2em, #D4A373).
    * Headline (Syne ExtraBold 800): "Kiến Tạo Diện Mạo Thương Hiệu Đỉnh Cao." (56px-68px, leading 1.05).
    * Sub-headline (Plus Jakarta Sans 16px-18px, #8E929B, max-w-xl, margin-top 24px).
    * Cụm nút điều hướng Dự án & Khảo sát nhanh (margin-top 36px).
  + Cột Phải (7/12 cột - lg:col-span-7):
    * Khung Visual 16:9 (aspect-video), bo viền sắc cạnh 2px, lớp phát sáng hổ phách (box-shadow: 0 0 65px -15px rgba(212,163,115,0.22)).
    * Trình chiếu tương tác 4 công trình thực tế BIDV & BigC/GO! kèm thanh chọn thumbnail và thông số kỹ thuật CAD.
- Dải Stat Badges (3 cột đáy Hero, ngăn cách bằng vách hairline 1px):
  + [15+] Năm Kinh Nghiệm (2009 - Nay)
  + [1,000+] Công Trình Hoàn Thiện
  + [100%] Tự Chủ Xưởng Cơ Khí & In Ấn

[KHỐI 3: PARTNER TRUST MARQUEE (MONOCHROME LUXURY)]
- Chiều cao dải: 108px, border-y 1px rgba(255,255,255,0.08), nền #14161A.
- Hiệu ứng chạy vô tận 38s linear (tạm dừng khi hover).
- 10 thương hiệu bảo chứng: BIDV, GO! (BigC), Vingroup, Kingsmen, Trung Nguyên Legend, Decathlon, Eximbank, Shinhan Bank, The New Gym, Dior.
- Trạng thái mặc định: Monochrome #8E929B (opacity 65%) -> Hover: Sáng bừng #F5F5F7 + viền #D4A373/40.

[KHỐI 4: CORE DISCIPLINES (3 TRỤ CỘT DỊCH VỤ)]
- Lưới 3 cột bằng nhau (grid-cols-1 lg:grid-cols-3, gap 24px).
- Thẻ Card: Nền #1A1C20, padding 36px (p-9), border 1px rgba(255,255,255,0.08).
- Hiệu ứng Hover: Viền chuyển sang #D4A373/60, thẻ nâng nhẹ translateY(-4px), ảnh minh họa bên trong zoom scale(1.05) trong 700ms.

[KHỐI 5: FEATURED PROJECTS SHOWCASE (EDITORIAL ARCHIVE GRID)]
- Trình bày theo cấu trúc Tạp chí Kiến trúc đương đại:
  + Project A: Hệ thống Nhận diện Mặt tiền & Quầy Giao dịch Chuỗi Ngân hàng BIDV (6 ảnh thực tế & phối cảnh: Mặt dựng Alu, Lam nhôm, PGD Tân Tạo, Hộp đèn quầy giao dịch, Biển chức danh Phó Giám Đốc).
  + Project B: Hạng mục Hộp đèn Chữ nổi & Cổng chào Đại siêu thị BigC / GO! (3 ảnh thực tế: Pano đôi TTTM, Thợ lắp đặt ma trận LED trên cao, Cổng chào chính BigC Supercenter).
- Tích hợp Bộ lọc hạng mục + Lightbox phóng ảnh độ phân giải cao kèm thông số vật liệu.

[KHỐI 6: IN-HOUSE PRODUCTION & ENGINEERING (XƯỞNG BÌNH TÂN)]
- Sơ đồ kiến trúc chỉ huy sản xuất tại 687/24/34 Kinh Dương Vương, Q. Bình Tân:
  + Tầng Chỉ Huy: Ban Giám Đốc (Ông Trần Xuân Đông) + Phòng Kỹ sư Kết cấu & Kiến trúc sư.
  + Tầng Thực Thi (4 Tổ đội trực chiến = 24 nhân sự kỹ thuật biên chế):
    * Tổ Cơ khí (10 thợ) | Tổ Quảng cáo (08 thợ) | Tổ Vẽ mỹ thuật (04 thợ) | Tổ In ấn (02 thợ).

[KHỐI 7: DUAL CONTACT GATE & LEGAL FOOTER]
- Cổng chuyển đổi kép (2 cột độc lập nền #1A1C20):
  + Cổng A (Chủ Cửa Hàng / Showroom): Form khảo sát nhanh 3 trường (Họ tên, Số điện thoại, Nhu cầu thi công) + Nút gọi/Zalo 0903 680 449.
  + Cổng B (Tổng Thầu / Chuỗi Tập Đoàn): Khu vực gửi hồ sơ mời thầu / bản vẽ BOQ CAD & kết nối trực tiếp Giám đốc Trần Xuân Đông.
- Chân trang pháp lý: CÔNG TY TNHH THIẾT KẾ QUẢNG CÁO TRANG TRÍ NỘI THẤT KHANG VIỆT — MST: 0306794247 do Sở KH&ĐT TP.HCM cấp ngày 22/01/2009.`;

