# TK-00 — Tổng quan thiết kế hệ thống Gia Phả Số (GiaPhaHub)

> Bộ thiết kế chi tiết cho phiên bản hiện đại của website gia phả dòng họ, kế thừa toàn bộ tính năng
> đã phân tích trong `SRS/` (reverse-engineer từ hohoangtrungbinh.com) và tuân thủ mô hình phát triển
> giao diện thời đại AI trong `Bao-cao-Chuan-hoa-giao-dien-thoi-dai-AI.pdf`.
> Ngày lập: 16/07/2026 · Trạng thái: **Bản thiết kế v1 — chờ phê duyệt**

## 1. Mục tiêu sản phẩm

Xây dựng **nền tảng gia phả số** cho dòng họ Việt Nam:

- Lõi phả hệ: cây gia phả nhiều đời, ngày giỗ âm lịch, phả ký/tộc ước/hương hỏa, xuất ấn phẩm.
- Cổng thông tin: tin tức, thông báo, danh nhân, thư viện, album, công đức.
- CRM quản trị hiện đại cho tộc trưởng/ban biên tập; cổng tự khai cho con cháu.
- Kiến trúc module hóa, một bộ mã phục vụ được nhiều dòng họ (multi-tenant theo gia phả).

## 2. Bản đồ truy vết: 10 yêu cầu → tài liệu thiết kế

| # | Yêu cầu của chủ đầu tư | Tài liệu trả lời |
|---|------------------------|------------------|
| 1 | Kiến trúc hiện đại: Spring Boot + React + MinIO + Elasticsearch, đề xuất thêm | [01-kien-truc-he-thong.md](01-kien-truc-he-thong.md), [02-lua-chon-cong-nghe.md](02-lua-chon-cong-nghe.md) |
| 2 | Giao diện ấn tượng, tuân thủ mô hình trong PDF | [04-design-system-giao-dien.md](04-design-system-giao-dien.md), [11-quy-trinh-phat-trien-voi-ai.md](11-quy-trinh-phat-trien-voi-ai.md) |
| 3 | Kế thừa tất cả tính năng bản cũ | [05-ke-thua-tinh-nang.md](05-ke-thua-tinh-nang.md) (map từng FR của `SRS/`) |
| 4 | 10 tính năng mới phù hợp văn hóa Việt Nam | [06-tinh-nang-moi-de-xuat.md](06-tinh-nang-moi-de-xuat.md) |
| 5 | CRM hiện đại, thuận tiện | [07-crm-quan-tri-hien-dai.md](07-crm-quan-tri-hien-dai.md) |
| 6 | Dễ đóng gói, triển khai | [09-trien-khai-va-dong-goi.md](09-trien-khai-va-dong-goi.md), [12-cau-hinh-ha-tang-cicd.md](12-cau-hinh-ha-tang-cicd.md) |
| 7 | Tư vấn DB phù hợp | [03-thiet-ke-database.md](03-thiet-ke-database.md) |
| 8 | Module hóa như bản cũ (NukeViet) | [01-kien-truc-he-thong.md](01-kien-truc-he-thong.md) §3, [08-api-va-module-hoa.md](08-api-va-module-hoa.md) |
| 9 | Hệ thống hóa thành thiết kế chi tiết trong `instruction/` | Toàn bộ bộ tài liệu TK-00 → TK-11 |
| 10 | Tích hợp bộ skill phát triển với AI, đảm bảo ATTT, tránh vibe coding | [10-an-toan-thong-tin.md](10-an-toan-thong-tin.md), [11-quy-trinh-phat-trien-voi-ai.md](11-quy-trinh-phat-trien-voi-ai.md), `CLAUDE.md` gốc repo |

## 3. Nguyên tắc thiết kế (kim chỉ nam)

1. **Một source of truth**: design tokens (DTCG JSON) + code trong git; Figma là nơi khám phá, không phải chân lý (theo PDF §3).
2. **Grounded generation**: AI lắp ráp UI từ component thật + tokens + rules, không "dịch" pixel; mọi output qua 4 cổng kiểm chứng máy (PDF §3.4).
3. **Modular monolith trước, microservice khi cần**: Spring Modulith — ranh giới module được kiểm chứng bằng test, deploy 1 artifact.
4. **Backend scaffold bằng JHipster 9 trên Spring Boot 4**: CRUD/entity sinh từ JDL (`--skip-client`); AI không viết boilerplate BE — chỉ JDL + logic nghiệp vụ (TK-01 §3.1, TK-02).
5. **Văn hóa Việt là tính năng hạng nhất**: âm lịch/can chi, xưng hô, ngày giỗ, công đức, khuyến học — không phải bản dịch của phần mềm phương Tây.
6. **Riêng tư theo vòng đời**: người còn sống được bảo vệ dữ liệu mặc định (NĐ 13/2023/NĐ-CP); người đã khuất hiển thị để thờ phụng tra cứu.
7. **Không vibe coding**: mọi thay đổi đi qua spec → code → gate → review; AI là công cụ có kiểm soát (TK-11).

## 4. Danh mục tài liệu

| Mã | Tài liệu | Nội dung chính |
|----|----------|----------------|
| TK-00 | 00-tong-quan.md | Tài liệu này |
| TK-01 | 01-kien-truc-he-thong.md | Kiến trúc C4, monorepo, JHipster + Spring Modulith |
| TK-02 | 02-lua-chon-cong-nghe.md | Stack chi tiết (gồm JHipster) + phương án thay thế |
| TK-03 | 03-thiet-ke-database.md | Tư vấn DB, ERD, schema phả hệ, index ES |
| TK-04 | 04-design-system-giao-dien.md | Design tokens, thư viện component, định hướng thẩm mỹ |
| TK-05 | 05-ke-thua-tinh-nang.md | Ma trận parity với SRS bản cũ |
| TK-06 | 06-tinh-nang-moi-de-xuat.md | 10 tính năng mới thuần văn hóa Việt |
| TK-07 | 07-crm-quan-tri-hien-dai.md | Thiết kế ứng dụng quản trị |
| TK-08 | 08-api-va-module-hoa.md | Chuẩn API, hợp đồng module, sự kiện |
| TK-09 | 09-trien-khai-va-dong-goi.md | Docker/Compose, CI/CD, giám sát, backup |
| TK-10 | 10-an-toan-thong-tin.md | Threat model, ASVS, NĐ13, security gates |
| TK-11 | 11-quy-trinh-phat-trien-voi-ai.md | Áp dụng mô hình PDF: tokens→gates→learn loop, skills |
| TK-12 | 12-cau-hinh-ha-tang-cicd.md | Cấu hình máy chủ dev/staging/prod, GitHub Actions CI/CD chi tiết |
| TK-13 | 13-ke-hoach-thuc-hien.md | Kế hoạch R0→R2 + **RP production**; hàng đợi F5/F7/F9/SaaS sau go-live |
| — | `SRS/12b-admin-quy-cong-duc.md` | SRS quỹ công đức: chiến dịch gây quỹ, ghi nhận đóng góp, bảng vàng |
| — | `SRS/12c-admin-khuyen-hoc.md` | SRS khuyến học: hồ sơ thành tích, đợt trao, trao suất |
| — | `SRS/12d-su-kien-dong-ho.md` | SRS sự kiện dòng họ (ClanEvent): CRUD, chi phí sự kiện, RSVP |
| — | `SRS/12e-so-quy-thu-chi.md` | SRS sổ quỹ thu–chi thống nhất: FundExpense, fund_ledger_v, UI sổ quỹ |
| — | `SRS/12b-admin-cau-hinh.md` | SRS cấu hình hệ thống (RP.1) |
| — | `SRS/15-production-go-live.md` | SRS production / go-live (RP.2–6) |
| TK-14 | 14-glossary.md | Thuật ngữ VN ↔ code |
| TK-15 | 15-figma-ds-gia-pha-ho-hoang.md | File Figma DS «Gia phả họ Hoàng» — mẫu duyệt + Bridge |

## 5. Phạm vi phát hành (đề xuất)

- **R1 (lõi):** Gia phả + phả đồ + ngày giỗ + CMS tin tức + tìm kiếm + tài khoản/2FA + CRM lõi + triển khai Compose.
- **R2 (mở rộng):** Công đức/quỹ (SRS-12b), sự kiện & điểm danh (SRS-12d), sổ quỹ thu–chi (SRS-12e), khuyến học (SRS-12c), cổng tự khai + duyệt, thông báo Zalo/email, xuất PDF sách.
- **RP (production):** Hoàn thiện cấu hình đầy đủ, parity mockup/SRS, SMTP/PII thật, bỏ stub/demo đường chính, E2E + backup/restore + go-live — chi tiết [13-ke-hoach-thuc-hien.md](13-ke-hoach-thuc-hien.md) §RP.
- **Hàng đợi sau go-live:** Bản đồ mộ (F5), di sản Hán-Nôm (F7), trợ lý AI (F9), multi-tenant SaaS — không chặn phát hành.
