import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { HonorBoardCard } from "../HonorBoardCard/HonorBoardCard";
import { AppearanceControl } from "./AppearanceControl";
import { ThemeProvider } from "./ThemeProvider";

const meta: Meta = {
  title: "GiaPha/Theme",
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div
          style={{
            padding: 24,
            background: "var(--color-surface-page)",
            color: "var(--color-text-primary)",
            minHeight: 320,
            fontFamily: "var(--font-body)",
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj;

export const Appearance: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 20 }}>
      <AppearanceControl onBrandBar={false} />
      <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
        Đổi palette / mode — Button và thẻ bảng vàng cập nhật theo token semantic.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Button type="button">Nút chính</Button>
        <Button type="button" variant="secondary">
          Phụ
        </Button>
      </div>
      <div style={{ maxWidth: 220 }}>
        <HonorBoardCard name="Hoàng Văn An" detail="Đỗ đại học · 2026" emblem="學" />
      </div>
    </div>
  ),
};
