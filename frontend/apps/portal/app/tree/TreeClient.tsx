"use client";

import { useMemo, useState } from "react";
import { demoFamilyGraph, FamilyTreeCanvas } from "@giapha/tree-viz";
import { FormField, Select } from "@giapha/ui";

export function TreeClient() {
  const graph = useMemo(() => demoFamilyGraph(), []);
  const [rootId, setRootId] = useState(graph.persons[0]?.id ?? "p1");
  const [maxDepth, setMaxDepth] = useState(3);

  const rootOptions = graph.persons.map((p) => ({
    value: p.id,
    label: `${p.code} — ${p.fullName}`,
  }));

  const depthOptions = [0, 1, 2, 3, 4, 5, 6].map((d) => ({
    value: String(d),
    label: d === 0 ? "Chỉ đời gốc" : `${d} đời hậu duệ`,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--spacing-md)",
          maxWidth: 720,
        }}
      >
        <FormField label="Gốc phả đồ (root)">
          <Select
            value={rootId}
            options={rootOptions}
            onChange={(e) => setRootId(e.target.value)}
          />
        </FormField>
        <FormField label="Độ sâu (depth)">
          <Select
            value={String(maxDepth)}
            options={depthOptions}
            onChange={(e) => setMaxDepth(Number(e.target.value))}
          />
        </FormField>
      </div>
      <FamilyTreeCanvas graph={graph} rootId={rootId} maxDepth={maxDepth} height={560} />
    </div>
  );
}
