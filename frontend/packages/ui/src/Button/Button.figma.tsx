import figma from "@figma/code-connect";
import { Button } from "./Button";

const FILE = "https://www.figma.com/design/ETrlAF4vsj0uHiJd69jcnD/Gia-ph%E1%BA%A3-h%E1%BB%8D-Ho%C3%A0ng";

figma.connect(Button, `${FILE}?node-id=6-87`, {
  example: () => <Button variant="primary">Tra cứu phả đồ</Button>,
});

figma.connect(Button, `${FILE}?node-id=6-89`, {
  example: () => <Button variant="secondary">Tải SVG</Button>,
});

figma.connect(Button, `${FILE}?node-id=6-91`, {
  example: () => <Button variant="ghost">Huỷ</Button>,
});
