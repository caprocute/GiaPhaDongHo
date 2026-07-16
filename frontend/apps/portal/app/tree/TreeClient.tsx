"use client";

import { useEffect, useMemo, useState } from "react";
import { demoFamilyGraph, FamilyTreeCanvas } from "@giapha/tree-viz";
import { Badge, FormField, Select } from "@giapha/ui";
import { fetchPersons } from "../../src/lib/api";
import { personsToFamilyGraph } from "../../src/lib/toFamilyGraph";

export function TreeClient() {
  const [graph, setGraph] = useState(demoFamilyGraph());
  const [source, setSource] = useState<"api" | "demo">("demo");
  const [rootId, setRootId] = useState(graph.persons[0]?.id ?? "p1");
  const [maxDepth, setMaxDepth] = useState(3);

  useEffect(() => {
    let cancelled = false;
    void fetchPersons(undefined, 200).then((list) => {
      if (cancelled || !list.length) return;
      const g = personsToFamilyGraph(list);
      if (!g.persons.length) return;
      setGraph(g);
      setSource("api");
      setRootId(g.persons[0]?.id ?? "p1");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const rootOptions = useMemo(
    () =>
      graph.persons.map((p) => ({
        value: p.id,
        label: `${p.code} — ${p.fullName}`,
      })),
    [graph],
  );

  const depthOptions = [0, 1, 2, 3, 4, 5, 6].map((d) => ({
    value: String(d),
    label: d === 0 ? "Chỉ đời gốc" : `${d} đời hậu duệ`,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-md)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Phả đồ</h1>
        {source === "demo" ? <Badge>Demo graph</Badge> : <Badge tone="success">API</Badge>}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--spacing-md)",
          maxWidth: 720,
        }}
      >
        <FormField label="Gốc phả đồ (root)">
          <Select value={rootId} options={rootOptions} onChange={(e) => setRootId(e.target.value)} />
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
