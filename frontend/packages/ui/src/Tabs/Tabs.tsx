"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
}

export function Tabs({ items, defaultTabId }: TabsProps) {
  const [active, setActive] = useState(defaultTabId ?? items[0]?.id);

  const listStyle: CSSProperties = {
    display: "flex",
    gap: "var(--spacing-sm)",
    borderBottom: "1px solid var(--color-border-subtle)",
    marginBottom: "var(--spacing-md)",
  };

  const tabStyle = (selected: boolean): CSSProperties => ({
    padding: "var(--spacing-sm) var(--spacing-md)",
    border: "none",
    background: "transparent",
    color: selected ? "var(--color-action-primary-bg)" : "var(--color-text-muted)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--font-size-md)",
    borderBottom: selected ? "2px solid var(--color-action-primary-bg)" : "2px solid transparent",
    cursor: "pointer",
  });

  const activeItem = items.find((item) => item.id === active);

  return (
    <div>
      <div role="tablist" style={listStyle}>
        {items.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={active === item.id}
            style={tabStyle(active === item.id)}
            onClick={() => setActive(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{activeItem?.content}</div>
    </div>
  );
}
