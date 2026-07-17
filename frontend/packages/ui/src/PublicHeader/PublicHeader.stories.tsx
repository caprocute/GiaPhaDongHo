import { GitBranch, Home, LayoutDashboard, Users } from "lucide-react";
import { PublicHeader } from "./PublicHeader";

export default { title: "PublicHeader", component: PublicHeader };

export const Default = { args: {} };

export const AdminSurface = {
  args: {
    brand: "Họ Hoàng Trung Bính",
    subtitle: "Bàn quản trị tộc sự · GiaPhaHub",
    fluid: true,
    sticky: false,
    cta: { href: "#", label: "Về cổng thông tin" },
    utilityLeft: (
      <>
        <b>GiaPhaHub</b> · Di sản sống
      </>
    ),
    navItems: [
      { href: "#", label: "Trang chủ", icon: Home },
      { href: "#", label: "Phả đồ", icon: GitBranch },
      { href: "#", label: "Hồ sơ", icon: Users },
      { href: "#", label: "CRM quản trị", icon: LayoutDashboard, forceActive: true },
    ],
  },
};
