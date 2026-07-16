# TK-11 — Quy trình phát triển với AI (grounded, không vibe coding)

> Hiện thực hóa mô hình trong `Bao-cao-Chuan-hoa-giao-dien-thoi-dai-AI.pdf` cho dự án này:
> **một source of truth (tokens + code) · mọi thứ có đường về (round-trip) · mọi output của AI qua cổng kiểm chứng · learn loop**.

## 1. Kiến trúc quy trình (map từ PDF §3)

```
TOKENS (design-tokens/ DTCG, sống trong git)
   │  Style Dictionary chạy CI → packages/tokens (CSS vars/Tailwind/TS)
   ▼
SD CODE = packages/ui (shadcn-style, registry nội bộ)
   + Storybook stories đầy đủ (tài liệu cho AI đọc — bắt buộc)
   + (nếu dùng Figma) Code Connect map node ↔ component
   ▼
AI AGENT (Claude Code)  ← context: CLAUDE.md rules + Storybook MCP + OpenAPI types + SRS/instruction
   ▼
VERIFICATION GATES (CI + local, tự động)
   Gate A build/typecheck/test · Gate B token-lint 0 hardcode
   Gate C visual diff (Playwright) · Gate D a11y (axe) · Gate S security (TK-10 §4)
   ▼
PR review (con người) → merge → staging → production
   ↺ LEARN LOOP: mỗi lần dev sửa tay output AI → phân loại thiếu-rule/thiếu-token/thiếu-mapping → vá hệ thống trong tuần
```

## 2. Luật cho AI agent — `CLAUDE.md` gốc repo (trích yếu, PDF §3.2c)

```markdown
## UI generation rules
- CHỈ dùng component từ `packages/ui` cho pattern đã có (Button, FormField, DataTable…);
  cấm viết styled-div trần cho pattern tồn tại.
- CẤM hardcode màu/spacing/font — chỉ dùng token (`var(--color-…)`, `theme.spacing.…`).
- Mọi form: `<FormField>` + Zod schema; mọi bảng: `<DataTable>`; mọi ngày: `<DualDatePicker>` (dương/âm).
- Sau khi sinh màn hình: chạy `pnpm lint:tokens && pnpm test:a11y` trước khi báo xong.

## Backend rules
- Entity/CRUD: viết JDL → `jhipster jdl` (TK-01 §3.1); cấm AI sinh boilerplate Entity/Resource/DTO.
- Endpoint mới bắt buộc `@RequiresPermission(...)` + test authz; controller admin nằm trong `…/admin/`.
- Không viết SQL nối chuỗi; chỉ JPA/parameterized. Không tự chế crypto/auth — dùng `core.security`.
- Chuyển đổi âm–dương lịch CHỈ qua `core.lunar` (Java) / `packages/lunar` (TS); cấm tự tính.
- Module chỉ import `api/`+`events/` của module khác — `ApplicationModules.verify()` phải xanh.

## Definition of Done
- Component mới: đủ 4 mảnh (spec + code + story + mapping/doc). Màn hình: qua đủ gate A–D(+S).
- Không claim "done" khi chưa dán kết quả gate/test thật.
```

## 3. Tích hợp bộ skill Claude Code vào vòng đời (yêu cầu 10)

| Giai đoạn | Skill / công cụ | Cách dùng bắt buộc |
|-----------|-----------------|--------------------|
| Trước khi code tính năng | **Plan mode / Plan agent** | Tạo plan từ spec TK-xx; không code khi chưa có spec tương ứng trong `instruction/` |
| Sau khi code | **`/verify`** | Chạy app thật, bấm đúng luồng vừa làm (không chỉ unit test) |
| Trước commit | **`/code-review`** (medium+) | Bắt lỗi đúng/sai + đơn giản hóa; findings phải xử lý hoặc giải trình |
| Diff chạm auth/donation/privacy/upload | **`/security-review`** | Bắt buộc — theo TK-10 §5; kèm người duyệt thứ 2 |
| Dọn nợ sau sprint | **`/simplify`** | Reuse/simplify code AI sinh ra, chống phình |
| Chart/dashboard CRM | **skill `dataviz`** | Trước khi viết bất kỳ chart nào (đúng trigger của skill) |
| Design system | **Bridge (`setup bridge` / `make …`)** nếu dùng Figma | Compiler-driven, cấm hardcode primitive — trùng triết lý PDF |
| Skill riêng dự án (tự tạo bằng `skill-creator`) | `verify-lunar` (đối chiếu golden vectors âm lịch), `gen-jdl` (soạn/validate JDL rồi gọi JHipster — không sinh Java CRUD tay), `release-check` (checklist gate + backup trước release) | Viết ở `.claude/skills/` giai đoạn GĐ1 |

**Chống vibe coding — 3 chốt cứng:**
1. *Không có spec → không code*: mọi PR phải link tới TK-xx/FR-xx; AI được yêu cầu từ chối task mơ hồ và hỏi lại spec.
2. *Máy chặn trước, người duyệt sau*: gate A–D+S đỏ là không review tiếp — review người chỉ dành cho logic nghiệp vụ.
3. *Learn loop có chủ*: mỗi lần sửa tay output AI → ticket 3 loại (thiếu rule / thiếu token / thiếu mapping) → cập nhật CLAUDE.md, tokens, stories trong tuần (PDF §5.2 "đo drift như đo bug").

## 4. Lộ trình dựng nền (map PDF §6 vào dự án này)

| GĐ | Tuần | Việc | Nghiệm thu |
|----|------|------|-----------|
| 0 | 1–2 | Chốt source of truth (văn bản ký); glossary VN (person/hồ sơ, union/hôn phối…); chọn 20 component ưu tiên (TK-04 §3) | 1 trang quy ước |
| 1 | 2–4 | `design-tokens/` DTCG + Style Dictionary CI; theme heritage/light/dark/tet; CLAUDE.md v1 | đổi 1 token → cả 2 app đổi theo |
| 2 | 4–9 | 20 component đủ "4 mảnh"; Storybook (+MCP); registry `pnpm ui:add` | 20/20 done, bảng theo dõi không ô trống |
| 3 | 9–11 | Pilot 3 màn hình thật (1 CRUD: danh sách thành viên; 1 form phức tạp: hồ sơ người + ngày kép; 1 pattern mới: canvas phả đồ) — đo 3 chỉ số PDF §6.5 | CRUD ≥80% code từ thư viện |
| 4 | 11–13 | Gates B/C/D/S vào CI; designer review trên preview; 2 sprint thật | 4 tiêu chí production PDF §6.6 |
| 5 | liên tục | Hội đồng DS 2 người; drift audit hằng tuần (agent tự chạy); learn loop | báo cáo drift định kỳ |

## 5. Quy ước làm việc với Claude Code trong repo

- Ngữ cảnh nạp cho agent mỗi phiên: `CLAUDE.md` (luật) + `instruction/TK-xx` liên quan + OpenAPI types + stories liên quan. Không dán cả repo.
- Mọi số liệu/thuật toán văn hóa (âm lịch, xưng hô) phải có **golden test** trước khi AI implement — test là spec.
- Commit message tiếng Việt, format `[module] hành động — FR/TK tham chiếu`.
- AI không tự ý: đổi schema DB (phải kèm migration + duyệt), thêm dependency (phải ghi vào TK-02 + license check), đổi token semantic (qua hội đồng DS).
