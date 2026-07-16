import { Tabs } from "./Tabs";

export default { title: "Tabs", component: Tabs };

export const Default = {
  args: {
    items: [
      { id: "info", label: "Thông tin", content: "Tiểu sử" },
      { id: "tree", label: "Phả đồ", content: "Sơ đồ" },
    ],
  },
};
