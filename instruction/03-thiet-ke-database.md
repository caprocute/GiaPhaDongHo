# TK-03 — Tư vấn Database & Thiết kế dữ liệu

## 1. Khuyến nghị: PostgreSQL 16+ làm DB chính

| Tiêu chí | PostgreSQL | MySQL 8 | MongoDB | Neo4j |
|----------|-----------|---------|---------|-------|
| Cây phả hệ (đệ quy) | ✅ Recursive CTE + `ltree` | ⚠️ CTE có nhưng yếu tiện ích | ⚠️ `$graphLookup` hạn chế | ✅✅ tốt nhất |
| Trường văn hóa linh hoạt (âm lịch, can chi) | ✅ JSONB + index | ⚠️ JSON yếu hơn | ✅ | ⚠️ |
| Toàn vẹn quan hệ (hôn phối, cha–con) | ✅ FK, constraint, transaction | ✅ | ❌ | ⚠️ |
| Tìm kiếm tiếng Việt fallback | ✅ FTS + `unaccent` | ⚠️ | ⚠️ | ❌ |
| Multi-tenant | ✅ RLS (row-level security) | ⚠️ tự làm | ⚠️ | ⚠️ |
| Chi phí vận hành thêm | 0 (đã có) | 0 | +1 hệ | +1 hệ |

**Kết luận**: PostgreSQL 16 là DB chính (dữ liệu ~10³–10⁵ người/gia phả thì recursive CTE thừa sức, chưa cần graph DB).
Polyglot phụ trợ: **Elasticsearch** (tìm kiếm), **Redis** (cache/queue), **MinIO** (nhị phân). Neo4j chỉ cân nhắc khi có yêu cầu phân tích quan hệ cực phức tạp (R3+).

## 2. ERD lõi phả hệ (module genealogy)

```mermaid
erDiagram
    FAMILY_TREE ||--o{ PERSON : contains
    FAMILY_TREE ||--o{ CHAPTER : has
    PERSON ||--o{ UNION_MEMBER : joins
    FAMILY_UNION ||--o{ UNION_MEMBER : of
    FAMILY_UNION ||--o{ UNION_CHILD : begets
    PERSON ||--o{ UNION_CHILD : is_child
    PERSON ||--o{ PERSON_MEDIA : has
    PERSON ||--o{ CHANGE_REQUEST : targets

    FAMILY_TREE {
        uuid id PK
        text slug UK "hoang/thon-trung-binh"
        text surname "Hoàng"
        text branch_name
        text province_code
        jsonb meta "năm biên soạn, người soạn..."
        jsonb stats_cache "đời, nam/nữ, mất..."
    }
    PERSON {
        uuid id PK
        uuid tree_id FK
        text code UK_per_tree "A7, A7-sp1"
        text full_name
        text ten_huy
        text ten_thuong
        text gender "male|female|unknown"
        text life_status "alive|deceased|unknown"
        smallint generation "đời (cache)"
        ltree lineage_path "A1.A3.A7 — subtree nhanh"
        date birth_solar
        jsonb birth_lunar "{d,m,y,leap,can_chi}"
        date death_solar
        jsonb death_lunar "{d,m,leap,can_chi,gio}"
        text grave_info
        geography grave_location "R3: tọa độ mộ"
        text biography "sự nghiệp công đức"
        text notes
        uuid avatar_media_id
        text privacy "public|members|private (người sống)"
        uuid linked_user_id "tài khoản tự nhận là node này"
        int version "optimistic lock + lịch sử"
    }
    FAMILY_UNION {
        uuid id PK
        uuid tree_id FK
        smallint order_no "vợ/chồng thứ mấy"
        jsonb marriage_info
    }
    UNION_MEMBER {
        uuid union_id FK
        uuid person_id FK
        text role "husband|wife"
    }
    UNION_CHILD {
        uuid union_id FK
        uuid child_id FK
        smallint order_no "thứ tự con"
    }
    CHAPTER {
        uuid id PK
        uuid tree_id FK
        text type "pha_ky|toc_uoc|huong_hoa|loi_tua"
        jsonb content "rich-text JSON (TipTap)"
        int version
    }
```

**Ghi chú mô hình**
- Hôn phối mô hình hóa bằng `FAMILY_UNION` (không phải cạnh person→person) để chứa nhiều con/nhiều đời vợ chồng đúng như SRS-03 FR-03.12.
- `lineage_path` (kiểu `ltree`) đánh theo dòng cha → lấy cả nhánh hậu duệ bằng 1 truy vấn `path <@ 'A1.A3'`; đồng bộ lại bằng trigger khi đổi cha mẹ.
- `generation` là cache (nguồn chân lý = quan hệ), tính lại async khi cây đổi.
- Mã hiệu: sequence riêng theo `tree_id` sinh `A{n}`; hôn phối sinh `{code}-sp{k}` — giữ tương thích dữ liệu bản cũ (import).
- Ngày âm lịch lưu **cả bản nhập gốc** (âm hoặc dương) + bản quy đổi; module `core.lunar` là nơi duy nhất chuyển đổi.

## 3. Bảng các module khác (rút gọn)

| Module | Bảng chính |
|--------|-----------|
| cms | `post(id, tree_id, category_id, slug, title, sapo, content jsonb, cover_media, status, publish_at, view_count, author_id)`, `category(module ảo, layout)`, `comment(entity_type, entity_id, parent_id, like_count, status)` |
| media | `album(category, cover, view_count)`, `photo(album_id, media_id, caption, order)`, `media(bucket, object_key, mime, width, height, blurhash, exif jsonb)` |
| donation | `campaign(title, goal_amount, start/end, bank_qr)`, `contribution(campaign_id, donor_name, person_id?, amount, kind tiền/hiện vật/công sức, status, receipt_no)`, `honor_entry(danh hiệu bảng vàng)` |
| event | `event(type giỗ_tổ/họp_họ, starts_at, lunar_date, location)`, `rsvp(event_id, user_id, headcount)`, `assignment(ban tế/hậu cần)` |
| moderation | `change_request(entity, entity_id, payload_diff jsonb, submitter, status, reviewer, reason)` |
| notification | `outbox_message`, `subscription(user, kênh email/zalo/push, loại nhắc)` |
| iam | `user_profile(keycloak_id, person_id?, display_name, phone, zalo_id)`, `role`, `user_role(scope theo tree/nhánh)` |
| system | `module_registry(code, enabled, config jsonb)`, `widget_config(trang chủ block)`, `audit_log(actor, action, entity, before/after, ip)` |

## 4. Chiến lược truy vấn phả hệ

```sql
-- Toàn bộ hậu duệ của A7 (dùng ltree — O(index))
SELECT * FROM person
WHERE tree_id = :tree AND lineage_path <@ (SELECT lineage_path FROM person WHERE code='A7' AND tree_id=:tree);

-- Đường quan hệ 2 người (phục vụ máy tính xưng hô — TK-06 F2): recursive CTE tổ tiên chung gần nhất
WITH RECURSIVE up AS (
  SELECT id, 0 AS depth FROM person WHERE id = :a
  UNION ALL
  SELECT uc_parent.person_id, up.depth+1
  FROM up
  JOIN union_child uc ON uc.child_id = up.id
  JOIN union_member uc_parent ON uc_parent.union_id = uc.union_id
) SELECT ...;
```

- Cache Redis: cây con đã dựng (`tree:{id}:chart:{root}:{depth}`), thống kê tree, danh sách giỗ tháng.
- Invalidation theo sự kiện `PersonUpdated`/`UnionChanged`.

## 5. Elasticsearch — thiết kế index

| Index | Nội dung | Điểm đặc biệt |
|-------|----------|---------------|
| `person_v1` | full_name, ten_huy, code, generation, tree, biography | analyzer `vi_folded`: icu_tokenizer + icu_folding (tìm không dấu "hoang van thanh"), sub-field `keyword` cho exact code |
| `content_v1` | post/page/album/tư liệu: title, sapo, body plain, category | highlight snippet như trang seek bản cũ (SRS-09) |

- Đồng bộ: transactional outbox → indexer (không dual-write trực tiếp).
- Suggest-as-you-type: `search_as_you_type` cho ô tra cứu hero (SRS-02 FR-02.8).
- Fallback khi ES down: Postgres FTS `unaccent` (degrade, có feature flag).

## 6. MinIO — quy hoạch bucket

| Bucket | Nội dung | Chính sách |
|--------|----------|-----------|
| `media` | ảnh album, chân dung, ảnh bài viết | private; đọc qua imgproxy URL ký |
| `documents` | scan sắc phong, gia phả Hán-Nôm, PDF tư liệu | private; presigned tải theo quyền |
| `exports` | PDF/Excel sách gia phả sinh ra | TTL 7 ngày, presigned |
| `backups` | pg_dump, ES snapshot | versioning + object-lock, replicate site 2 (TK-09) |

## 7. Di trú dữ liệu từ bản cũ (NukeViet)

1. Export MySQL NukeViet → staging schema (`legacy_*`).
2. Script ETL (Java/Liquibase changeset hoặc job một lần): map `nv4_giapha_*` → `person/union` (giữ mã hiệu A-n), news → post, photos → album, công đức → honor_entry.
3. Đối soát: tổng người, tổng đời, checksum danh sách giỗ (so với SRS: 1.586 người/13 đời).
4. Media: tải `/uploads/**` → MinIO, ghi lại `media` + rewrite URL trong nội dung bài.
