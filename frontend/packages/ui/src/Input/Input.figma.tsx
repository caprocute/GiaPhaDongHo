import figma from "@figma/code-connect";
import { Input } from "./Input";

const FILE = "https://www.figma.com/design/ETrlAF4vsj0uHiJd69jcnD/Gia-ph%E1%BA%A3-h%E1%BB%8D-Ho%C3%A0ng";

// SearchBar organism maps to Input with type="search"
figma.connect(Input, `${FILE}?node-id=6-815`, {
  example: () => (
    <Input
      type="search"
      placeholder="Tìm tổ tiên theo tên hoặc mã hiệu…"
      aria-label="Tìm trong gia phả"
    />
  ),
});

// CommandBar (⌘K) maps to Input with keyboard shortcut
figma.connect(Input, `${FILE}?node-id=6-727`, {
  example: () => (
    <Input
      type="search"
      placeholder="Tìm người, bài viết, thao tác…"
      aria-label="Command bar (⌘K)"
    />
  ),
});
