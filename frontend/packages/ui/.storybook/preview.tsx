import type { Decorator, Preview } from "@storybook/react";
import { useEffect } from "react";
import "@giapha/tokens/tokens.css";
import { applyTheme } from "../src/Theme/applyTheme";
import type { ColorMode, PaletteId } from "../src/Theme/themeTypes";

const withThemeAttrs: Decorator = (Story, context) => {
  const palette = (context.globals.palette as PaletteId) || "bang-vang";
  const mode = (context.globals.colorMode as ColorMode) || "light";

  useEffect(() => {
    applyTheme(palette, mode);
  }, [palette, mode]);

  return (
    <div
      style={{
        minHeight: "100%",
        padding: 16,
        background: "var(--color-surface-page)",
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-body)",
      }}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  tags: ["autodocs"],
  globalTypes: {
    palette: {
      description: "Bộ màu",
      toolbar: {
        title: "Palette",
        icon: "paintbrush",
        items: [
          { value: "bang-vang", title: "Bảng vàng" },
          { value: "co", title: "Cổ (son đỏ)" },
        ],
        dynamicTitle: true,
      },
    },
    colorMode: {
      description: "Sáng / tối",
      toolbar: {
        title: "Mode",
        icon: "contrast",
        items: [
          { value: "light", title: "Sáng" },
          { value: "dark", title: "Tối" },
          { value: "system", title: "Hệ thống" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    palette: "bang-vang",
    colorMode: "light",
  },
  decorators: [withThemeAttrs],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i } },
    a11y: { test: "todo" },
    docs: {
      description: {
        component:
          "Xem USAGE.md cạnh source. Chỉ dùng token `@giapha/tokens`. Toolbar: Palette × Mode.",
      },
    },
  },
};

export default preview;
