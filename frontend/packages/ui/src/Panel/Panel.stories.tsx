import type { Meta, StoryObj } from "@storybook/react";
import { Panel } from "./Panel";

const meta: Meta<typeof Panel> = {
  title: "GiaPha/Panel",
  component: Panel,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Panel>;

export const Default: Story = {
  args: {
    title: "Tự khai của con cháu — chờ duyệt",
    action: "Mở hàng đợi →",
    children: (
      <div style={{ padding: "14px 18px", fontSize: 13.5, color: "var(--color-text-muted)" }}>
        3 yêu cầu đang chờ xử lý…
      </div>
    ),
  },
};

export const NoAction: Story = {
  args: {
    title: "Hoạt động gần đây",
    children: (
      <ul style={{ listStyle: "none", padding: "6px 18px 12px", margin: 0, fontSize: 12.5 }}>
        <li style={{ padding: "9px 0", borderBottom: "1px dashed var(--color-border-default)", color: "var(--color-text-muted)" }}>
          <strong style={{ color: "var(--color-text-primary)" }}>Thư ký Tuấn</strong> nhập 14 người từ file Excel
        </li>
        <li style={{ padding: "9px 0", color: "var(--color-text-muted)" }}>
          <strong style={{ color: "var(--color-text-primary)" }}>Hệ thống</strong> phát hiện trùng "Hoàng Tảo Lạc" ×2
        </li>
      </ul>
    ),
  },
};
