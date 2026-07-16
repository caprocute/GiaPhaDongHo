import figma from "@figma/code-connect";
import { StatCard } from "./StatCard";

const FILE = "https://www.figma.com/design/ETrlAF4vsj0uHiJd69jcnD/Gia-ph%E1%BA%A3-h%E1%BB%8D-Ho%C3%A0ng";

figma.connect(StatCard, `${FILE}?node-id=6-115`, {
  example: () => <StatCard value="1.586" label="Thành viên" />,
});
