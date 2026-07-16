# TK-02 — Lựa chọn công nghệ (kèm lý do & phương án thay thế)

## 1. Bảng stack chuẩn

| Tầng | Công nghệ chọn | Phiên bản | Lý do chọn | Phương án thay thế |
|------|----------------|-----------|------------|--------------------|
| Ngôn ngữ BE | Java (LTS) | 21 | Virtual threads, ổn định doanh nghiệp, đội ngũ VN dồi dào | Kotlin (nếu team quen) |
| Framework BE | **Spring Boot** | **4.1.x** (tối thiểu 4.0.x) | Dòng OSS hiện hành (Framework 7, Jackson 3, Jakarta EE 11); Boot 3.5 đã hết OSS (06/2026). Greenfield → lên 4 ngay | Boot 3.5.x chỉ khi bị khóa dependency (không áp dụng dự án này) |
| Sinh mã / scaffold BE | **JHipster** (JDL, `--skip-client`) | **9.x** | Hỗ trợ Spring Boot 4 + Java 21+; sinh Entity/CRUD/DTO/MapStruct/Liquibase/test chuẩn; giảm token AI viết boilerplate | JHipster 8 (Boot 3 — không dùng cho dự án mới) |
| Kiến trúc BE | **Spring Modulith** | **2.x** (2.0 cho Boot 4.0; 2.1 cho Boot 4.1) | Module hóa có kiểm chứng (yêu cầu 8), outbox event sẵn; xếp package sau khi JHipster generate | Modulith 1.4 (chỉ gắn Boot 3.x) |
| ORM/Migration | Spring Data JPA + **Liquibase** (chuẩn JHipster) | — | Changelog versioned do generator + chỉnh tay expand→migrate→contract | Flyway (chỉ nếu tách hẳn khỏi JHipster) |
| FE Portal | **Next.js (React 19)** | 15.x | SSR/SSG cho SEO cổng thông tin (bản cũ rất mạnh SEO); OG image động | Vite + React Router 7 SSR |
| FE Admin | **Vite + React 19 + TypeScript** | — | SPA tương tác dày, build nhanh | gộp vào Next.js (ít khuyến nghị) |
| UI kit | **Tailwind CSS v4 + shadcn/ui** | — | Chuẩn "AI đọc được" theo PDF (registry, mã nguồn mở trong repo) | MUI (nặng, khó token hóa) |
| State/Data FE | TanStack Query v5 + Zustand | — | Server-state chuẩn, ít boilerplate | Redux Toolkit |
| Form/Validate | react-hook-form + Zod | — | Schema dùng chung FE/BE (zod → JSON Schema) | — |
| Animation | **Motion (framer-motion)** + View Transitions API (Next 15) | 12.x | Micro-interaction, spring counter, chuyển trang mượt | — |
| Animation phức tạp | **GSAP** (nay miễn phí 100% kể cả plugin) | 3.x | Hero SVG stroke "vẽ cây", timeline dài, ScrollTrigger kể chuyện phả ký | Motion (đủ cho case đơn giản) |
| Scroll trải nghiệm | Lenis (smooth scroll — chỉ trang storytelling portal) | — | Trang giới thiệu dòng họ dạng "cuộn kể chuyện" | tắt cho trang CRUD |
| Icon | lucide-react + **bộ icon hoa văn riêng** (SVG sprite: rồng, mây, triện, đèn thờ) | — | Nhận diện di sản không lib nào có sẵn | — |
| Chart CRM | Recharts token-hóa (theo skill `dataviz`) | 2.x | Dashboard quỹ/thống kê đồng bộ design system | visx (khi cần control sâu) |
| Phả đồ — render | **React Flow (`@xyflow/react`)** (MIT) | 12.x | Node = React component → style bằng token/shadcn/Motion (thẩm mỹ tối đa); minimap, pan/zoom, fitView animation, custom edge có sẵn; cộng đồng lớn | Tự vẽ d3 (nhiều công), family-chart (renderer khó style) |
| Phả đồ — layout | **Layout engine riêng** trong `packages/tree-viz`: d3-dag/elkjs + luật gia phả Việt (union node hôn phối, thứ tự con, hàng ngang theo đời) | — | React Flow **không có layout** — vị trí node do ta tính; tham khảo thuật toán của [family-chart](https://github.com/donatso/family-chart) (MIT) nhưng không dùng renderer | dagre (kém gom cặp vợ chồng) |
| Search | **Elasticsearch** | 8.16+ (AGPLv3) | Yêu cầu chủ đầu tư; analyzer ICU folding cho tiếng Việt không dấu | OpenSearch 2.x (Apache-2.0) nếu ngại AGPL |
| Object storage | **MinIO** | RELEASE.2025-x | Yêu cầu chủ đầu tư; S3-compatible, versioning, presigned URL | SeaweedFS, Garage |
| Ảnh động | **imgproxy** | 3.x | Resize/webp/avif on-the-fly từ MinIO, ký URL chống hotlink | Thumbor |
| Cache/queue nhẹ | Redis | 7.x | Cache cây, rate-limit, session bridge, BullMQ-style job đơn giản | Valkey |
| IAM | **Keycloak** | 26.x | OIDC chuẩn, TOTP 2FA + backup codes (parity bản cũ), social login, quản trị user tách khỏi app | Spring Authorization Server (nhẹ hơn, tự code 2FA) |
| Xuất PDF | **pdf-render service** (Node + Playwright) | — | Render đúng CSS in của phả đồ/sách gia phả — fidelity 100% với web | OpenPDF/JasperReports (khó giữ giao diện) |
| Xuất Excel | Apache POI | — | Xuất danh sách thành viên/phả đồ dạng bảng | — |
| Âm lịch | Thuật toán **amlich (Hồ Ngọc Đức)** port Java + TS, chung bộ test vector | — | Chuẩn âm lịch VN (UTC+7, tháng nhuận); 2 bản đồng bộ bằng golden tests | lib `lunar-javascript` (lịch TQ — không dùng) |
| Thông báo | SMTP (Jakarta Mail) + **Zalo OA API** + Web Push (VAPID) | — | Zalo là kênh quốc dân VN | Telegram bot (phụ) |
| Realtime | SSE (Spring MVC) | — | Đủ cho thông báo CRM; tránh phức tạp WebSocket | WebSocket/STOMP |
| API docs | springdoc-openapi | 2.x | Sinh OpenAPI 3.1 → typegen cho FE (`openapi-typescript`) | — |
| Test BE | JUnit 5, Testcontainers, ArchUnit/Modulith test | — | Ranh giới module + test tích hợp DB thật | — |
| Test FE | Vitest, Testing Library, **Playwright** (E2E + visual Gate C), **axe-core** (Gate D) | — | Theo 4 gates của PDF | — |
| Quan sát | OpenTelemetry + Grafana LGTM (Loki/Grafana/Tempo/Mimir) | — | 1 stack compose sẵn | ELK |
| CI/CD | GitHub Actions (hoặc GitLab CI) | — | Chạy 6 gates (TK-11 §4) | Jenkins |

## 2. Các đề xuất bổ sung ngoài yêu cầu gốc

1. **JHipster 9 (backend-only)** — scaffold + JDL là đường chính sinh CRUD trên **Spring Boot 4**; AI chỉ viết JDL và logic miền (TK-01 §3.1). Cấu hình: OAuth2 Keycloak, PostgreSQL, Gradle 9, Java 21, bỏ client.
2. **imgproxy** — bắt buộc thực tế: album dòng họ nhiều ảnh scan lớn; không resize on-the-fly sẽ chậm và tốn băng thông.
3. **Keycloak** — tách IAM khỏi app: 2FA TOTP + mã dự phòng (parity SRS-10) không phải tự code, đăng nhập Google/Facebook/Zalo cho con cháu lớn tuổi dễ dùng; khớp blueprint OAuth2 của JHipster.
4. **pdf-render service** — "sách gia phả" là sản phẩm văn hóa quan trọng (SRS-03 FR-03.6); render bằng trình duyệt headless giữ đúng khung viền, font, chữ Hán-Nôm.
5. **OpenTelemetry + LGTM** — vận hành 1 người vẫn nhìn được toàn hệ.
6. **Zalo OA** — nhắc giỗ/thông báo họp họ tới đúng người Việt lớn tuổi (TK-06 F1).
7. **PWA cho Portal** — cài lên điện thoại, offline xem cây đã cache; đỡ chi phí làm app native giai đoạn đầu.

## 3. Ma trận phiên bản & license

| Thành phần | License | Rủi ro | Ghi chú |
|-----------|---------|--------|---------|
| Spring Boot/Modulith | Apache-2.0 | Không | |
| JHipster | Apache-2.0 | Không | Generator; mã sinh ra thuộc dự án |
| Next.js/React/Vite | MIT | Không | |
| Tailwind/shadcn | MIT | Không | |
| family-chart | MIT | Không | Fork về `packages/tree-viz` |
| Elasticsearch 8.16+ | AGPLv3/ELv2/SSPL (chọn AGPL) | Thấp (self-host, không phân phối SaaS đóng) | Nếu bán SaaS đóng mã → chuyển OpenSearch |
| MinIO | AGPLv3 | Thấp (dùng như dịch vụ độc lập qua S3 API) | Không nhúng SDK server vào mã đóng |
| Keycloak | Apache-2.0 | Không | |
| imgproxy | MIT | Không | |
| Playwright | Apache-2.0 | Không | |

## 4. Chuẩn hóa phiên bản Node/Java

- Java **21** (Temurin) — sàn của JHipster 9; Gradle **9.x**, Node **22** LTS, pnpm 9 (workspace FE).
- Spring Boot **4.1.x** + Spring Modulith **2.1.x** (hoặc Boot 4.0.x + Modulith 2.0.x nếu cần nhánh dài hơn).
- Cấm bootstrap backend bằng Spring Boot 3.x / JHipster 8 trên repo này.
- Renovate bot cập nhật dependency + `npm audit`/`gradle dependencyCheck` trong CI (TK-10).
