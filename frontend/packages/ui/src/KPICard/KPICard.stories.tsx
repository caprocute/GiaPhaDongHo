import type { Meta, StoryObj } from "@storybook/react";
import { KPICard } from "./KPICard";

const meta: Meta<typeof KPICard> = {
  title: "GiaPha/KPICard",
  component: KPICard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof KPICard>;

export const TrendUp: Story = {
  args: { label: "Thành viên trong phả", value: "1.586", delta: "+12 người tháng này", trend: "up" },
};

export const TrendWarn: Story = {
  args: { label: "Chờ duyệt", value: "7", delta: "3 tự khai quá 48 giờ", trend: "neutral" },
};

export const NoTrend: Story = {
  args: { label: "Giỗ trong 30 ngày", value: "8" },
};

export const Row: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, width: 860 }}>
      <KPICard label="Thành viên trong phả" value="1.586" delta="+12 người tháng này" trend="up" />
      <KPICard label="Chờ duyệt" value="7" delta="3 tự khai quá 48 giờ" trend="neutral" />
      <KPICard label="Giỗ trong 30 ngày" value="8" delta="Gần nhất: 04/6 ÂL" />
      <KPICard label="Quỹ tôn tạo lăng mộ" value="182,5tr" delta="73% mục tiêu 250tr" trend="up" />
    </div>
  ),
};
