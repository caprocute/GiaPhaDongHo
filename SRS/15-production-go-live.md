# SRS-15 — Yêu cầu Production & Go-live (GiaPhaHub)

**Phiên bản:** 1.0 · **Ngày:** 2026-07-17  
**Tham chiếu:** TK-09, TK-10, TK-12, TK-13 §RP.2–RP.6, NFR trong [00-tong-hop.md](00-tong-hop.md)  
**Mục tiêu:** nâng hệ thống từ khung R1/R2 lên **bản dùng thật** — ổn định, an toàn, đo được, bàn giao được.

---

## 1. Phạm vi

Áp dụng cho môi trường **staging (gold)** và **production**.  
Không bao gồm F5/F7/F9/SaaS (hàng đợi sau go-live).

Gồm: portal chuyên nghiệp, CRM đủ dùng hàng ngày, kênh thông báo thật, ATTT/PII, chất lượng kỹ thuật, vận hành, UAT/go-live.

---

## 2. Portal công khai (RP.3)

### 2.1 Dữ liệu & trạng thái

**FR-15.1** Luồng chính (trang chủ, hồ sơ, phả đồ, ngày giỗ, tin, album, tìm kiếm, công đức, sự kiện, xưng hô, tự khai, nhắc giỗ) **không** dùng dữ liệu demo làm nguồn chính khi API trả dữ liệu hợp lệ.  
**FR-15.2** Khi API trống/lỗi: EmptyState / Alert ngôn ngữ nghiệp vụ («Chưa có bài viết», «Không kết nối được máy chủ») — không lộ mã HTTP/stack.  
**FR-15.3** Metadata (title, description, keywords, favicon) lấy từ cấu hình dòng họ (SRS-12b).

### 2.2 Nội dung & media

**FR-15.10** Gallery album công khai: list album → xem ảnh + lightbox (SRS-08); ảnh qua URL ký/presign.  
**FR-15.11** Trang tĩnh Giới thiệu / Điều khoản / Quy định thành viên từ CMS (FR-12.12); link từ đăng ký & footer.  
**FR-15.12** Block trang chủ: bật/tắt và thứ tự tối thiểu (giỗ / tin / công đức / CTA phả đồ) — cấu hình admin hoặc settings (FR-12.19 thu gọn).

### 2.3 Trải nghiệm & hiệu năng

**FR-15.20** Responsive mobile/desktop đạt SRS-13; bàn phím/focus cơ bản (Gate D axe trên trang chủ + phả đồ + form đăng nhập).  
**FR-15.21** PWA nhẹ: cài được; cache đọc hồ sơ/giỗ đã xem (không yêu cầu offline soạn).  
**FR-15.22** Hiệu năng: trang chủ LCP chấp nhận được trên staging; phả đồ ≥200 node pan/zoom mượt theo SRS-12a §9.  
**FR-15.23** Không jargon kỹ thuật trên mọi chữ UI portal (rule dự án).

---

## 3. CRM & nghiệp vụ hàng ngày (RP.2)

**FR-15.30** Soạn phả đồ đạt các FR còn mở của SRS-12a (skeleton, nhãn đời, badge, role FE, audit thao tác).  
**FR-15.31** Hồ sơ người đủ field FR-12.5; thống nhất `lifeStatus`: `alive` | `deceased`.  
**FR-15.32** Chương Phả ký / Tộc ước / Hương hỏa: soạn rich-text admin + đọc portal (FR-12.7).  
**FR-15.33** Xuất ấn phẩm: chọn chương → PDF/Excel tin cậy trên staging (FR-12.9); lỗi hiện thông báo nghiệp vụ.  
**FR-15.34** Trước go-live: **một** trong hai — import Excel tối thiểu **hoặc** GEDCOM subset.  
**FR-15.35** Màn admin Công đức / Sự kiện / Media / Khuyến học / Duyệt tự khai: parity bố cục mockup `instruction/mockups/admin-*.html`; số liệu thật, không placeholder giả.  
**FR-15.36** Dashboard: KPI lấy API thật (số thành viên, giỗ tháng này, yêu cầu chờ duyệt, tiến độ quỹ).  
**FR-15.37** Menu CRM ẩn mục không có permission; nhãn nghiệp vụ.

---

## 4. Thông báo đa kênh (RP.4 + SRS-05 mở rộng)

**FR-15.40** Job nhắc giỗ chạy theo lịch trên staging/prod; tạo outbox đúng `remindDaysBefore`.  
**FR-15.41** Ít nhất **một kênh thật** end-to-end trước go-live: **Email** (sau khi SMTP SRS-12b đạt).  
**FR-15.42** Zalo: chỉ hiện khi cấu hình + chế độ gửi thật; nếu tắt → copy «Chưa kết nối Zalo».  
**FR-15.43** Web Push: bật khi có VAPID; không thì ẩn khỏi UI (không stub «đã gửi»).  
**FR-15.44** iCal công khai / cá nhân giữ đúng SRS nhắc giỗ mở rộng; timezone theo settings lịch.

---

## 5. Bảo mật, riêng tư, tuân thủ (RP.4)

**FR-15.50** HTTPS bắt buộc trên production; HSTS khuyến nghị.  
**FR-15.51** Giới hạn đăng nhập sai / khóa tạm (FR-12.21); captcha theo settings auth.  
**FR-15.52** Mọi serializer/export người còn sống qua privacy filter + flags SRS-12b §5.2.  
**FR-15.53** Có bộ regression test privacy (khách / thành viên / editor).  
**FR-15.54** Diff chạm auth, donation, upload, settings secret → `/security-review` + duyệt 2 người.  
**FR-15.55** Gate S (semgrep/trivy) **fail CI** — không `continue-on-error` trên nhánh bảo vệ.  
**FR-15.56** Audit bắt buộc theo FR-12b.143; lưu tối thiểu 180 ngày trên prod (hoặc theo chính sách họ).  
**FR-15.57** Secret: Jasypt `ENC(...)` hoặc secret manager; cấm plaintext trong git.

---

## 6. Chất lượng kỹ thuật (RP.5)

**FR-15.60** E2E smoke (Playwright hoặc tương đương) tối thiểu:
1. Đăng nhập admin  
2. Tạo/sửa 1 thành viên  
3. Xem hồ sơ trên portal  
4. Gửi 1 yêu cầu tự khai  

**FR-15.61** IT backend ổn định trên CI (Testcontainers Postgres) cho luồng genealogy/settings/privacy.  
**FR-15.62** OpenAPI → `api-types` đồng bộ trong CI; phá contract = đỏ.  
**FR-15.63** Gate A (build/test), B (tokens), D (a11y trang trọng yếu) bắt buộc; Gate C visual cho component lõi.

---

## 7. Vận hành & hạ tầng (RP.5)

**FR-15.70** Backup tự động CSDL + object storage theo lịch (SRS-12b backup); **đã thử restore thành công ≥1 lần** trên staging.  
**FR-15.71** Health/metrics endpoint; log có correlation id cơ bản.  
**FR-15.72** Runbook: tunnel DEV, seed, deploy staging/prod, rollback, khôi phục backup.  
**FR-15.73** Seed họ mẫu đủ demo go-live (không PII thật nếu chưa có thỏa thuận).  
**FR-15.74** GitHub Environment **production** + approval; secrets tách staging/prod.  
**FR-15.75** RPO/RTO nội bộ ghi trong runbook (ví dụ RPO ≤ 24h, RTO ≤ 4h — chỉnh theo thỏa thuận).

---

## 8. UAT & Go-live (RP.6)

**FR-15.80** Checklist UAT nghiệp vụ (tộc trưởng/thư ký) tối thiểu:

| # | Kịch bản | Đạt |
|---|----------|-----|
| 1 | Đăng nhập admin + 2FA | |
| 2 | Đổi tên dòng họ / logo → thấy trên portal | |
| 3 | Thêm người + hôn phối trên soạn phả đồ | |
| 4 | Duyệt một tự khai | |
| 5 | Đăng bài + xem trên portal | |
| 6 | Upload ảnh album + xem gallery | |
| 7 | Tạo/xem chiến dịch công đức | |
| 8 | Đăng ký nhắc giỗ + nhận email (nếu bật) | |
| 9 | Xuất PDF một chương | |
| 10 | Sao lưu / xác nhận có bản mới | |

**FR-15.81** Tài liệu người dùng ngắn (đăng nhập, soạn phả, duyệt, cấu hình).  
**FR-15.82** Soft-launch 1 dòng họ; theo dõi lỗi ≥2 tuần trước tuyên bố ổn định.  
**FR-15.83** Đóng cổng RP: chỉ bugfix + hàng đợi F5/F7/F9/SaaS.

---

## 9. Tiêu chí cổng Production (Definition of Done sản phẩm)

| Hạng mục | Tiêu chí |
|----------|----------|
| Cấu hình | SRS-12b cổng RP.1 đạt |
| Portal/CRM | FR-15.1–15.37 đạt trên staging |
| Thông báo | FR-15.41 đạt (email E2E) |
| ATTT | FR-15.50–15.57; Gate S xanh |
| Chất lượng | FR-15.60–15.63 |
| Vận hành | Restore đã thử; runbook có |
| UAT | ≥9/10 dòng FR-15.80 đạt (hoặc waiver có chữ ký) |

**Không** tuyên bố production khi còn stub/demo trên đường chính hoặc secret plaintext trong repo.
