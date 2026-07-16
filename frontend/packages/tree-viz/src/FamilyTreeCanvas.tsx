"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { exportTreePng, exportTreeSvg } from "./exportCanvas";
import { demoFamilyGraph, layoutFamily } from "./layoutFamily";
import { PersonNode } from "./nodes/PersonNode";
import { UnionNode } from "./nodes/UnionNode";
import { toReactFlowElements } from "./toReactFlow";
import type { FamilyGraph } from "./types";

const nodeTypes: NodeTypes = {
  person: PersonNode,
  union: UnionNode,
};

export interface FamilyTreeCanvasProps {
  graph?: FamilyGraph;
  /** Person id gốc — mặc định person đầu tiên */
  rootId?: string;
  /** Số đời hậu duệ tối đa từ root (FR-04) */
  maxDepth?: number;
  height?: number | string;
  showMiniMap?: boolean;
  showExport?: boolean;
  className?: string;
}

function CanvasInner({
  graph,
  rootId,
  maxDepth,
  height,
  showMiniMap,
  showExport,
  className,
}: Required<Pick<FamilyTreeCanvasProps, "graph" | "rootId" | "maxDepth">> &
  Omit<FamilyTreeCanvasProps, "graph" | "rootId" | "maxDepth">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();
  const [exporting, setExporting] = useState(false);

  const layout = useMemo(
    () => layoutFamily(graph, { rootId, maxDepth }),
    [graph, rootId, maxDepth],
  );

  const { nodes, edges } = useMemo(() => toReactFlowElements(layout), [layout]);

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      void fitView({ padding: 0.2, duration: 300 });
    });
    return () => cancelAnimationFrame(t);
  }, [nodes, edges, fitView]);

  const onExportPng = useCallback(async () => {
    const el = containerRef.current?.querySelector(".react-flow") as HTMLElement | null;
    if (!el) return;
    setExporting(true);
    try {
      await exportTreePng(el, { fileName: `pha-do-${rootId}-d${maxDepth}.png` });
    } finally {
      setExporting(false);
    }
  }, [rootId, maxDepth]);

  const onExportSvg = useCallback(async () => {
    const el = containerRef.current?.querySelector(".react-flow") as HTMLElement | null;
    if (!el) return;
    setExporting(true);
    try {
      await exportTreeSvg(el, { fileName: `pha-do-${rootId}-d${maxDepth}.svg` });
    } finally {
      setExporting(false);
    }
  }, [rootId, maxDepth]);

  const shell: CSSProperties = {
    height: height ?? 520,
    width: "100%",
    background: "var(--color-surface-page)",
    border: "1px solid var(--color-border-subtle, var(--color-heritage-frame))",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    position: "relative",
  };

  const toolbar: CSSProperties = {
    position: "absolute",
    zIndex: 5,
    top: "var(--spacing-sm)",
    right: "var(--spacing-sm)",
    display: "flex",
    gap: "var(--spacing-sm)",
  };

  const btn: CSSProperties = {
    minHeight: 36,
    padding: "0 var(--spacing-md)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--color-heritage-frame)",
    background: "var(--color-surface-card)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--font-size-sm)",
    cursor: exporting ? "wait" : "pointer",
  };

  return (
    <div ref={containerRef} style={shell} className={className}>
      {showExport !== false && (
        <div style={toolbar}>
          <button type="button" style={btn} onClick={() => void fitView({ padding: 0.2, duration: 300 })}>
            Vừa khung
          </button>
          <button type="button" style={btn} disabled={exporting} onClick={() => void onExportPng()}>
            PNG
          </button>
          <button type="button" style={btn} disabled={exporting} onClick={() => void onExportSvg()}>
            SVG
          </button>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        aria-label="Sơ đồ phả đồ gia phả"
      >
        <Background color="var(--color-heritage-accent)" gap={20} size={1} />
        <Controls showInteractive={false} />
        {showMiniMap !== false && (
          <MiniMap
            pannable
            zoomable
            maskColor="color-mix(in srgb, var(--color-ink-900) 40%, transparent)"
            nodeColor="var(--color-heritage-frame)"
          />
        )}
      </ReactFlow>
    </div>
  );
}

export function FamilyTreeCanvas(props: FamilyTreeCanvasProps) {
  const graph = props.graph ?? demoFamilyGraph();
  const rootId = props.rootId ?? graph.persons[0]?.id ?? "";
  const maxDepth = props.maxDepth ?? 6;

  return (
    <ReactFlowProvider>
      <CanvasInner
        {...props}
        graph={graph}
        rootId={rootId}
        maxDepth={maxDepth}
      />
    </ReactFlowProvider>
  );
}
