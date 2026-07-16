import type { Meta, StoryObj } from "@storybook/react";
import { SideNavItem } from "./SideNavItem";

const meta: Meta<typeof SideNavItem> = {
  title: "GiaPha/SideNavItem",
  component: SideNavItem,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof SideNavItem>;

export const Active: Story = {
  args: { icon: "◫", active: true, children: "Bảng điều khiển", href: "#" },
};

export const Default: Story = {
  args: { icon: "☰", active: false, children: "Thành viên", href: "#" },
};

export const WithBadge: Story = {
  args: { icon: "✓", active: false, badge: "7", children: "Chờ duyệt", href: "#" },
};

export const NavList: Story = {
  render: () => (
    <nav style={{ width: 236, background: "var(--color-surface-card)", border: "1px solid var(--color-border-default)", padding: "8px 0" }}>
      <SideNavItem icon="◫" active href="#">Bảng điều khiển</SideNavItem>
      <SideNavItem icon="⌘" href="#">Cây phả hệ</SideNavItem>
      <SideNavItem icon="☰" href="#">Thành viên</SideNavItem>
      <SideNavItem icon="✓" badge="7" href="#">Chờ duyệt</SideNavItem>
      <SideNavItem icon="🪙" href="#">Quỹ công đức</SideNavItem>
      <SideNavItem icon="⚙" href="#">Cấu hình</SideNavItem>
    </nav>
  ),
};
