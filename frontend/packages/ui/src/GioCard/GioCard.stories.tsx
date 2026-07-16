import type { Meta, StoryObj } from "@storybook/react";
import { GioCard } from "./GioCard";

const meta: Meta<typeof GioCard> = {
  title: "GiaPha/GioCard",
  component: GioCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof GioCard>;

export const Default: Story = {
  args: {
    day: "04",
    month: "Tháng Sáu ÂL",
    name: "Ông Hoàng Quang Du",
    tag: "Tháng này",
  },
};

export const Strip: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <GioCard day="04" month="Tháng Sáu ÂL" name="Ông Hoàng Quang Du" tag="Tháng này" />
      <GioCard day="06" month="Tháng Sáu ÂL" name="Bà Lê Thị Lệ Hà" tag="Tháng này" />
      <GioCard day="08" month="Tháng Sáu ÂL" name="Ông Nguyễn Trường Sơn" />
      <GioCard day="03" month="Tháng Bảy ÂL" name="Ông Nguyễn Văn Ninh" tag="Tháng sau" />
    </div>
  ),
};
