# SRS-14 — Nghiên cứu mã nguồn mở tương đương

Mục tiêu: tìm giải pháp open source **sát nhất** với hohoangtrungbinh.com, kể cả khả năng dựng giao diện tương đồng.

## 1. Kết luận nhanh

| Kịch bản | Giải pháp đề xuất | Mức khớp |
|----------|-------------------|---------|
| Giống hệt trang gốc, nhanh nhất | **NukeViet CMS + module Gia phả (NukeViet Store) + theme tự đóng theo mẫu `hotoc`** | ~95–100% (chính là stack trang gốc) |
| Chuẩn quốc tế, cộng đồng lớn | **webtrees** + module tùy biến âm lịch + CMS block | ~70% (mạnh hơn về phả hệ, thiếu đặc thù VN) |
| Stack hiện đại, thuần Việt | **giapha-os** (Next.js + Supabase, MIT) + bổ sung khối CMS | ~60–70% phần gia phả, UI Việt sẵn |
| Tự build, chỉ cần thư viện vẽ | **family-chart / Topola / dTree** (D3, MIT) + backend tự chọn | linh hoạt nhất |

## 2. Phương án 1 — Chính stack của trang gốc (NukeViet)

- **NukeViet CMS**: mã nguồn mở GPL, PHP + MySQL — [github.com/nukeviet/nukeviet](https://github.com/nukeviet/nukeviet). Có sẵn: news đa chuyên mục, photos, contact theo bộ phận, users + 2FA, seek, RSS, statistics, quản trị block/theme, backup — tức **toàn bộ khối CMS của trang gốc**.
- **Module Gia phả**: bán trên [NukeViet Store](https://nukeviet.vn/vi/store/modules/gia-pha/) (tác giả webnhanh, ~1.000.000đ, license GPL, bản 4.4.00 cập nhật 09/2024): tạo nhiều gia phả, phả đồ, phả ký/tộc ước, ngày giỗ, hồ sơ từng người — đúng các route `gia-pha` quan sát được. Bản cổ hơn miễn phí trong [kho lưu trữ Google Code của NukeViet](https://code.google.com/archive/p/nuke-viet/wikis/GiaPha.wiki) và một số fork cộng đồng.
- **Giao diện**: trang gốc dùng theme `hotoc` (dịch vụ [hotoc.vn](https://hotoc.vn) — giải pháp thương mại website họ tộc trên NukeViet của hệ sinh thái VINADES). Theme không public, nhưng NukeViet cho tự viết theme (HTML/Smarty-like) — tái tạo giao diện đỏ–vàng theo [13-giao-dien-ux.md](13-giao-dien-ux.md) là khả thi.
- **Đánh giá**: nhanh nhất để có sản phẩm giống hệt; đổi lại stack PHP/jQuery cũ, phụ thuộc module trả phí (dù nhận mã nguồn GPL sau khi mua).

## 3. Phương án 2 — webtrees (chuẩn quốc tế)

[webtrees](https://webtrees.net/) — [github.com/fisharebest/webtrees](https://github.com/fisharebest/webtrees), GPL, PHP + MySQL, bản 2.2.6 (04/2026), có tiếng Việt trong 60+ ngôn ngữ.

**Khớp với trang gốc**: đa gia phả trên 1 cài đặt; hồ sơ cá nhân chi tiết; nhiều loại phả đồ (pedigree, descendants, hourglass, fan chart, timeline) + xuất PDF; **phân quyền riêng tư mạnh** (ẩn người còn sống — trang gốc không có, nên làm tốt hơn); multi-user cộng tác, media/album gắn từng người; GEDCOM import/export; kiến trúc module mở rộng.

**Thiếu so với trang gốc (phải tự viết module/theme)**:
- Ngày giỗ **âm lịch** + can chi + lọc tháng Giêng/Chạp (webtrees có lịch Julian/Hebrew/Hijri... nhưng **không có âm lịch Việt Nam** — cần module chuyển đổi, có thể dùng thuật toán amlich của Hồ Ngọc Đức).
- Khối cổng thông tin (tin tức nhiều chuyên mục, thông báo, bảng vàng công đức) — webtrees chỉ có news/FAQ đơn giản.
- Giao diện đỏ–vàng truyền thống: viết custom theme (webtrees hỗ trợ theme module).
- Mã hiệu kiểu A1/A7-sp1: webtrees dùng XREF GEDCOM, cần hiển thị tùy biến.

**Bổ trợ**: [Topola Viewer](https://github.com/PeWu/topola-viewer) chạy được như addon webtrees cho phả đồ tương tác đẹp.

## 4. Phương án 3 — Dự án Việt: giapha-os

[github.com/homielab/giapha-os](https://github.com/homielab/giapha-os) — MIT, Next.js/TypeScript + Supabase (PostgreSQL), demo giapha-os.homielab.com, ~251 stars.

- Có sẵn: sơ đồ phả hệ dạng cây + mindmap, quản lý thành viên & quan hệ phức tạp, **tự động xác định cách xưng hô tiếng Việt**, tìm kiếm/lọc, phân quyền Admin/Editor/Member, xuất nhập **JSON/CSV/GEDCOM**, dữ liệu tự chủ trên Supabase của mình.
- Thiếu: khối CMS tin tức/album/công đức, ngày giỗ âm lịch (cần kiểm tra/bổ sung), xuất PDF ấn phẩm, theme truyền thống.
- Phù hợp nếu muốn app hiện đại (SPA/PWA) và chấp nhận tự phát triển phần cổng thông tin (ghép Strapi/Payload CMS hoặc chính Next.js).

## 5. Các lựa chọn khác đáng biết

- **[Gramps Web](https://www.grampsweb.org/)** (AGPL, Python + React): đồng bộ với Gramps desktop, phân tích mạnh; nhược: bắt buộc đăng nhập mới xem — trái mô hình "công khai cho con cháu tra cứu" của trang gốc.
- **HuMo-genealogy** (PHP, GPL): xuất bản GEDCOM lên web, nhẹ, có tiếng Việt một phần.
- **[Comparison of web-based genealogy software (Wikipedia)](https://en.wikipedia.org/wiki/Comparison_of_web-based_genealogy_software)** để đối chiếu thêm.

## 6. Thư viện vẽ phả đồ (nếu tự build UI tương đồng)

| Thư viện | License | Ghi chú |
|----------|---------|---------|
| [donatso/family-chart](https://github.com/donatso/family-chart) | MIT | D3, hỗ trợ vợ/chồng & nhiều hôn phối, edit tree, dùng được với mọi framework — **gần nhất với sơ đồ phân cấp của trang gốc** |
| [PeWu/topola](https://github.com/PeWu/topola) | Apache-2.0 | TypeScript, render SVG từ GEDCOM, nhiều kiểu chart |
| [ErikGartner/dTree](https://github.com/ErikGartner/dTree) | MIT | cây nhiều cha mẹ, đơn giản |
| [BenPortner/js_family_tree](https://github.com/BenPortner/js_family_tree) | MIT | d3-dag, tương tác thu/mở giống tree view |
| Balkan FamilyTreeJS | **Không open source** (miễn phí phi thương mại) | đẹp nhưng tránh nếu cần OSS thuần |

**Lịch âm Việt Nam**: dùng thuật toán amlich của Hồ Ngọc Đức (public, đã port sang JS/PHP/Python, các gói npm như `lunar-date-vn`, `amlich`) để làm ngày giỗ, can chi, tháng nhuận theo UTC+7.

## 7. Khuyến nghị

1. **Cần sản phẩm ngay, giống 100%** → NukeViet + mua module gia phả + tự viết theme theo SRS-13. Chi phí thấp nhất, rủi ro thấp nhất.
2. **Đầu tư dài hạn, chủ động công nghệ** → Fork **giapha-os** (MIT, thuần Việt) làm lõi phả hệ + xây khối CMS/portal riêng; hoặc build mới (Next.js/Laravel) dùng **family-chart** cho phả đồ + thuật toán **amlich** cho ngày giỗ, bám các FR trong bộ SRS này.
3. **Ưu tiên chuẩn gia phả quốc tế (GEDCOM, riêng tư)** → **webtrees** + viết 2 module: âm lịch/ngày giỗ VN và theme họ tộc.

**Nguồn tham khảo**:
- [NukeViet CMS — GitHub](https://github.com/nukeviet/nukeviet) · [Module gia phả — NukeViet Store](https://nukeviet.vn/vi/store/modules/gia-pha/) · [Kho Google Code cũ](https://code.google.com/archive/p/nuke-viet/wikis/GiaPha.wiki) · [hotoc.vn](https://hotoc.vn/trang-chu/viet-bai-trong-website-ho-toc)
- [webtrees.net](https://webtrees.net/) · [webtrees — GitHub](https://github.com/fisharebest/webtrees)
- [giapha-os — GitHub](https://github.com/homielab/giapha-os) · [Giới thiệu trên Unikorn](https://unikorn.vn/p/giapha-os)
- [Gramps Web — Cloudron forum](https://forum.cloudron.io/topic/10310/gramps-js-web) · [So sánh phần mềm gia phả web — Wikipedia](https://en.wikipedia.org/wiki/Comparison_of_web-based_genealogy_software)
- [family-chart](https://github.com/donatso/family-chart) · [Topola](https://github.com/PeWu/topola) · [Topola Viewer](https://github.com/PeWu/topola-viewer) · [dTree](https://github.com/ErikGartner/dTree) · [js_family_tree](https://github.com/BenPortner/js_family_tree)
