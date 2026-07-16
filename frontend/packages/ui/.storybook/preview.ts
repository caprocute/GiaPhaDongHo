import type { Preview } from "@storybook/react";
import "@giapha/tokens/tokens.css";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i } },
    a11y: { test: "todo" },
  },
};

export default preview;
