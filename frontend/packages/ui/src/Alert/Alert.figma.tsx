import figma from "@figma/code-connect";
import { Alert } from "./Alert";

const FILE = "https://www.figma.com/design/ETrlAF4vsj0uHiJd69jcnD/Gia-ph%E1%BA%A3-h%E1%BB%8D-Ho%C3%A0ng";

// DiffChip/Add → success alert (small inline)
figma.connect(Alert, `${FILE}?node-id=6-715`, {
  example: () => <Alert variant="success" title="+1 người" />,
});

// DiffChip/Mod → info alert (modification notice)
figma.connect(Alert, `${FILE}?node-id=6-718`, {
  example: () => <Alert variant="info" title="Sửa 1 trường" />,
});
