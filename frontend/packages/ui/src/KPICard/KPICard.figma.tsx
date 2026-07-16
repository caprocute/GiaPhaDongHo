import figma from "@figma/code-connect";
import { KPICard } from "./KPICard";

const FILE = "https://www.figma.com/design/ETrlAF4vsj0uHiJd69jcnD/Gia-ph%E1%BA%A3-h%E1%BB%8D-Ho%C3%A0ng";

figma.connect(KPICard, `${FILE}?node-id=6-124`, {
  example: () => (
    <KPICard
      label="Thành viên trong phả"
      value="1.586"
      delta="+12 người tháng này"
      trend="up"
    />
  ),
});
