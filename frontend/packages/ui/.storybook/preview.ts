import type { Preview } from "@storybook/react";
import "@giapha/tokens/tokens.css";

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i } },
    a11y: { test: "todo" },
    docs: {
      description: {
        component:
          "Xem USAGE.md cạnh source (spec + mapping Figma/Storybook). Chỉ dùng token `@giapha/tokens`.",
      },
    },
  },
};

export default preview;
