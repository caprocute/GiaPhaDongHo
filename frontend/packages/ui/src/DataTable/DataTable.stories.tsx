import { DataTable } from "./DataTable";

export default { title: "DataTable", component: DataTable };

export const Default = {
  args: {
    columns: [
      { key: "name", header: "Họ tên" },
      { key: "gen", header: "Đời" },
    ],
    rows: [
      { name: "Nguyễn Văn A", gen: "Đời 5" },
      { name: "Nguyễn Thị B", gen: "Đời 6" },
    ],
  },
};
