# `@giapha/tree-viz` — Phả đồ (R1.6 / FR-04)

## Spec

| | |
|--|--|
| **Khi dùng** | Portal `/tree`, CRM tree editor, nhúng hậu duệ hồ sơ |
| **Layout** | `layoutFamily` — đời ngang, union hôn phối, con theo `childIds` |
| **Render** | React Flow (`@xyflow/react`) + token CSS |
| **Giới hạn** | `rootId` + `maxDepth` (parity FR-04) |
| **Export** | PNG/SVG phía client (`html-to-image`) |

## Usage

```tsx
import { FamilyTreeCanvas, demoFamilyGraph } from "@giapha/tree-viz";
import "@xyflow/react/dist/style.css";

<FamilyTreeCanvas graph={demoFamilyGraph()} rootId="p1" maxDepth={3} />
```

### Tokens

`--color-surface-page/card`, `--color-heritage-frame/accent`, `--color-action-primary-bg`, `--font-display`, `--spacing-*`, `--radius-*`

### Do / Don't

- ✅ Truyền graph từ API chart (R1) — không hardcode layout trong app.
- ✅ Tôn trọng privacy: chỉ đưa person đã filter vào graph.
- ❌ Không dùng dagre làm layout cặp vợ chồng.
