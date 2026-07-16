import figma from "@figma/code-connect";
import { Panel } from "./Panel";

const FILE = "https://www.figma.com/design/ETrlAF4vsj0uHiJd69jcnD/Gia-ph%E1%BA%A3-h%E1%BB%8D-Ho%C3%A0ng";

figma.connect(Panel, `${FILE}?node-id=6-132`, {
  example: () => (
    <Panel title="Tự khai của con cháu — chờ duyệt" action="Mở hàng đợi →">
      <div />
    </Panel>
  ),
});
