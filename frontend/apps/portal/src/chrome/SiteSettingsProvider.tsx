"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { TreeSettings } from "../lib/treeSettings";

const Ctx = createContext<TreeSettings | null>(null);

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: TreeSettings;
  children: ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSiteSettings(): TreeSettings {
  const v = useContext(Ctx);
  if (!v) {
    return {
      displayName: "Họ Hoàng Trung Bính",
      tree: {
        maxNodesDefault: 43,
        publicTree: true,
        allowSelfDeclare: true,
        allowTreeExport: false,
      },
    };
  }
  return v;
}
