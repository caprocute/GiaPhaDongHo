import figma from "@figma/code-connect";
import { SideNavItem } from "./SideNavItem";

const FILE = "https://www.figma.com/design/ETrlAF4vsj0uHiJd69jcnD/Gia-ph%E1%BA%A3-h%E1%BB%8D-Ho%C3%A0ng";

figma.connect(SideNavItem, `${FILE}?node-id=6-129`, {
  example: () => (
    <SideNavItem icon="◫" active href="#">
      Bảng điều khiển
    </SideNavItem>
  ),
});
