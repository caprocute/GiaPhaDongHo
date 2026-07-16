import { AppShell } from "./AppShell";

export default { title: "AppShell", component: AppShell };

export const Default = {
  args: {
    header: <header style={{ padding: "var(--spacing-md)", borderBottom: "1px solid var(--color-border-subtle)" }}>Admin</header>,
    sidebar: <nav>Menu</nav>,
    children: <p>Nội dung chính</p>,
  },
};
