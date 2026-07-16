import figma from "@figma/code-connect";
import { Badge } from "./Badge";

const FILE = "https://www.figma.com/design/ETrlAF4vsj0uHiJd69jcnD/Gia-ph%E1%BA%A3-h%E1%BB%8D-Ho%C3%A0ng";

// Chip/son  → tone="default" (son-soft bg, son text)
figma.connect(Badge, `${FILE}?node-id=6-94`, {
  example: () => <Badge tone="default">Đời thứ 5</Badge>,
});

// Chip/gold → tone="accent"
figma.connect(Badge, `${FILE}?node-id=6-96`, {
  example: () => <Badge tone="accent">Mã hiệu A7</Badge>,
});

// Chip/success → tone="success"
figma.connect(Badge, `${FILE}?node-id=6-98`, {
  example: () => <Badge tone="success">Đã duyệt</Badge>,
});

// Chip/warning → tone="warning"
figma.connect(Badge, `${FILE}?node-id=6-100`, {
  example: () => <Badge tone="warning">Chờ duyệt</Badge>,
});

// Chip/danger → tone="error"
figma.connect(Badge, `${FILE}?node-id=6-102`, {
  example: () => <Badge tone="error">Đã mất</Badge>,
});

// NavBadge (inline badge on SideNavItem)
figma.connect(Badge, `${FILE}?node-id=6-732`, {
  example: () => <Badge tone="accent">7</Badge>,
});
