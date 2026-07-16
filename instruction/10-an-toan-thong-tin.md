# TK-10 — An toàn thông tin (ATTT) & Quyền riêng tư

> Nguyên tắc: dữ liệu gia phả chứa **PII của người đang sống** (họ tên, ngày sinh, quan hệ, ảnh, đôi khi SĐT)
> → phải thiết kế theo NĐ 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân + OWASP ASVS L2.

## 1. Mô hình mối đe dọa (STRIDE rút gọn)

| Mối đe dọa | Kịch bản điển hình | Đối sách chính |
|-----------|--------------------|----------------|
| Spoofing | chiếm tài khoản tộc trưởng | Keycloak + 2FA bắt buộc cho role quản trị, brute-force detection |
| Tampering | sửa trộm phả hệ, "nhét" người vào họ | RBAC subtree, change-request + duyệt, audit log bất biến, version mọi bản ghi |
| Repudiation | chối "tôi không sửa/không thu tiền" | audit_log append-only (hash chain), biên nhận đánh số |
| Info disclosure | lộ PII người sống, scrape toàn bộ họ | privacy tier §3, rate-limit + bot detection, presigned URL hết hạn, không lộ email thô (parity bản cũ) |
| DoS | upload bom, export PDF spam | quota upload, job queue có giới hạn, rate limit, Turnstile ở form public |
| Elevation | member gọi API admin | permission check tại API (không tin UI), test authz tự động từng endpoint |

## 2. Kiểm soát theo OWASP ASVS (điểm nhấn)

- **AuthN**: OIDC + PKCE; TOTP 2FA + backup codes (parity SRS-10); phiên: access token 10', refresh rotation, silent renew.
- **AuthZ**: deny-by-default; permission `module:entity:action:scope`; kiểm tra subtree bằng `lineage_path` phía server; test ma trận role×endpoint trong CI.
- **Input/Output**: Bean Validation + Zod; sanitize rich-text (server-side, allowlist — nội dung TipTap lưu JSON, render qua renderer kiểm soát, không dán HTML thô); SQLi: JPA/parameterized only (Semgrep rule cấm string concat query).
- **Upload**: whitelist mime + magic bytes, giới hạn dung lượng, ảnh re-encode qua imgproxy (diệt payload), PDF/scan vào bucket riêng không execute.
- **Headers/Web**: CSP nonce-based (portal SSR), HSTS, COOP/COEP, SameSite=Lax, CSRF token cho form SSR; admin SPA: CSP strict + không third-party script.
- **Secrets**: không có secret trong repo (gitleaks gate); runtime qua env/secret manager; khóa MinIO/Keycloak sinh lúc deploy.
- **Jasypt (bắt buộc)**: mọi secret trong cấu hình ứng dụng (DB/Redis/MinIO/SMTP/Zalo/imgproxy/client-secret…) dùng `jasypt-spring-boot-starter`, giá trị `ENC(...)`; master password chỉ qua `JASYPT_ENCRYPTOR_PASSWORD`. Cấm plaintext trong YAML commit được; cấm tự viết AES/crypto thay Jasypt.
- **Mã hóa**: TLS 1.3; at-rest: PG `pgcrypto` cho trường nhạy cảm (SĐT), MinIO SSE; backup mã hóa; cấu hình nhạy cảm qua Jasypt như trên.

## 3. Quyền riêng tư kiểu gia phả (khác biệt quan trọng nhất)

| Tier | Đối tượng | Khách vãng lai | Thành viên đăng nhập | Thư ký nhánh+ |
|------|-----------|----------------|----------------------|---------------|
| Người **đã khuất** | mặc định public (mục đích thờ phụng, như bản cũ) | ✅ đầy đủ | ✅ | ✅ |
| Người **còn sống** | mặc định `members` | tên + đời (ẩn ngày sinh đầy đủ, SĐT, địa chỉ, ảnh tùy config) | ✅ theo config họ | ✅ |
| Trẻ vị thành niên | luôn `private` | ❌ | chỉ nhánh mình | ✅ |

- Mỗi người có cờ `privacy` ghi đè; tộc trưởng đặt **chính sách mặc định cấp gia phả**.
- Quyền chủ thể dữ liệu (NĐ13): thành viên xem/sửa/yêu cầu xóa dữ liệu của mình (workflow change-request); trang "Chính sách dữ liệu" công khai; log truy cập hồ sơ người sống.
- Export PDF/Excel tôn trọng privacy theo vai người xuất (khách xuất bản public-only).

## 4. Security gates trong CI (Gate S — bổ sung vào 4 gate của PDF)

| Công cụ | Chặn gì | Ngưỡng fail |
|---------|---------|-------------|
| Semgrep (ruleset java + react + custom) | SQLi, XSS sink, hardcoded secret, `@PreAuthorize` thiếu trên controller admin | high trở lên |
| OWASP Dependency-Check + `pnpm audit` | CVE dependency | CVSS ≥ 7 không có waiver |
| Trivy | CVE image + misconfig Dockerfile | high |
| gitleaks | secret lộ | bất kỳ |
| ZAP baseline (staging, hằng đêm) | header thiếu, lỗi bề mặt | báo cáo + ticket |
| Test authz ma trận | endpoint × role | lệch ma trận kỳ vọng |

## 5. Luật ATTT cho AI agent (chống "vibe coding" mặt an ninh — chi tiết TK-11)

1. AI **không được** sinh code auth/crypto tùy hứng — chỉ dùng module `core.security` đã duyệt.
2. Mọi endpoint mới phải khai `@RequiresPermission` — thiếu là Semgrep fail (máy chặn, không chờ người nhớ).
3. AI không bao giờ nhận secret thật; dev dùng `.env.local` ngoài git.
4. Diff do AI sinh chạm các đường nhạy cảm (auth, payment/donation, privacy filter, upload) → bắt buộc chạy skill `/security-review` + người duyệt thứ hai.
5. Prompt-injection cho F9 (trợ lý AI): system prompt tách dữ liệu/lệnh, tool chỉ đọc (read-only API, scoped theo user), lọc PII người sống trước khi đưa vào context, log toàn bộ hội thoại.

## 6. Vận hành an toàn

- Cập nhật ảnh nền hàng tháng (Renovate + rebuild); patch khẩn CVE ≤ 72h.
- Tài khoản quản trị hạ tầng: SSH key + 2FA, không dùng chung.
- Kế hoạch ứng phó sự cố: phát hiện → cô lập (maintenance mode) → khôi phục từ backup → thông báo thành viên theo NĐ13 (72h) — runbook `deploy/runbooks/incident.md`.
- Pentest nhẹ trước go-live R1; bug bounty nội bộ dòng họ (con cháu làm IT 😄).
