import figma from "@figma/code-connect";
import { DataTable } from "./DataTable";

const FILE = "https://www.figma.com/design/ETrlAF4vsj0uHiJd69jcnD/Gia-ph%E1%BA%A3-h%E1%BB%8D-Ho%C3%A0ng";

// DataTable used in Admin CRM — Danh sách thành viên screen
figma.connect(DataTable, `${FILE}?node-id=6-31`, {
  example: () => (
    <DataTable
      columns={[
        { key: "stt",    header: "STT" },
        { key: "name",   header: "Họ và tên" },
        { key: "code",   header: "Mã hiệu" },
        { key: "gen",    header: "Đời" },
        { key: "born",   header: "Ngày sinh" },
        { key: "status", header: "Trạng thái" },
      ]}
      rows={[]}
    />
  ),
});
