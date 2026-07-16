import type { Meta, StoryObj } from "@storybook/react";
import { StatCard } from "./StatCard";

const meta: Meta<typeof StatCard> = {
  title: "GiaPha/StatCard",
  component: StatCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: { value: "1.586", label: "Thành viên" },
};

export const Row: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, width: 760 }}>
      <StatCard value="1.586" label="Thành viên" />
      <StatCard value="13"    label="Đời" />
      <StatCard value="769"   label="Nam" />
      <StatCard value="817"   label="Nữ" />
    </div>
  ),
};
