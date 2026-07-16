import { Breadcrumb } from "./Breadcrumb";

export default { title: "Breadcrumb", component: Breadcrumb };

export const Default = {
  args: {
    items: [
      { label: "Trang chủ", href: "/" },
      { label: "Gia phả", href: "/persons" },
      { label: "Nguyễn Văn A" },
    ],
  },
};
