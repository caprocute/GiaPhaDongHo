import figma from "@figma/code-connect";
import { GioCard } from "./GioCard";

const FILE = "https://www.figma.com/design/ETrlAF4vsj0uHiJd69jcnD/Gia-ph%E1%BA%A3-h%E1%BB%8D-Ho%C3%A0ng";

figma.connect(GioCard, `${FILE}?node-id=6-119`, {
  example: () => (
    <GioCard
      day="04"
      month="Tháng Sáu ÂL"
      name="Ông Hoàng Quang Du"
      tag="Tháng này"
    />
  ),
});
