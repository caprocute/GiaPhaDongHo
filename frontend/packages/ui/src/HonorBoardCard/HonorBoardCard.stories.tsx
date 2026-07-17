import type { Meta, StoryObj } from "@storybook/react";
import { HonorBoardCard } from "./HonorBoardCard";

const meta: Meta<typeof HonorBoardCard> = {
  title: "GiaPha/HonorBoardCard",
  component: HonorBoardCard,
};
export default meta;

type Story = StoryObj<typeof HonorBoardCard>;

export const Default: Story = {
  args: {
    name: "Lê Thị Thùy Vy",
    detail: "Học viên xuất sắc · ĐTH 9.2",
    emblem: "學",
  },
};

export const CongDucOnDark: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 20,
        padding: 32,
        background: "var(--color-heritage-frame)",
      }}
    >
      <HonorBoardCard onDark name="Ông Hoàng Văn A" detail="Hiến 200m² đất xây nhà thờ họ" emblem="壽" />
      <HonorBoardCard onDark name="Bà Hoàng Thị B" detail="Tài trợ quỹ khuyến học dòng họ" emblem="德" />
      <HonorBoardCard onDark name="Ông Hoàng Văn C" detail="Sưu tầm, biên soạn gia phả 13 đời" emblem="心" />
    </div>
  ),
};
