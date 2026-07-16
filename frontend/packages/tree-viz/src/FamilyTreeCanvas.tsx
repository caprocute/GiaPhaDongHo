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
  const fitKey = `${rootId}:${maxDepth}:${graph.persons.length}:${graph.unions.length}`;
  const lastFitKey = useRef("");

  const layout = useMemo(
    () => layoutFamily(graph, { rootId, maxDepth }),
    [graph, rootId, maxDepth],
  );

  const { nodes, edges } = useMemo(() => toReactFlowElements(layout), [layout]);

  /** Chỉ fit khi đổi gốc / độ sâu / graph — không animate liên tục gây nhảy loạn */
  useEffect(() => {
    if (lastFitKey.current === fitKey) return;
    lastFitKey.current = fitKey;
    const id = window.setTimeout(() => {
      void fitView({ padding: 0.18, duration: 0, maxZoom: 1.05 });
    }, 40);
    return () => window.clearTimeout(id);
  }, [fitKey, fitView, nodes.length]);

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
    height: height ?? 560,
    width: "100%",
    background: "var(--color-surface-page)",
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
    flexWrap: "wrap",
    justifyContent: "flex-end",
  };

  const btn: CSSProperties = {
    minHeight: 36,
    padding: "0 var(--spacing-md)",
    border: "1px solid var(--color-border-strong)",
    background: "var(--color-surface-card)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    cursor: exporting ? "wait" : "pointer",
    boxShadow: "var(--shadow-sm)",
  };

  return (
    <div ref={containerRef} style={shell} className={className} data-tree-canvas>
      {showExport !== false && (
        <div style={toolbar}>
          <button
            type="button"
            style={btn}
            onClick={() => void fitView({ padding: 0.18, duration: 200, maxZoom: 1.05 })}
          >
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
        minZoom={0.15}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnScroll
        zoomOnDoubleClick={false}
        onlyRenderVisibleElements
        defaultEdgeOptions={{ focusable: false }}
        aria-label="Sơ đồ phả đồ gia phả"
      >
        <Background color="var(--color-heritage-line)" gap={28} size={1} />
        <Controls showInteractive={false} position="bottom-left" />
        {showMiniMap !== false && (
          <MiniMap
            pannable
            zoomable
            position="bottom-right"
            maskColor="color-mix(in srgb, var(--color-ink-900) 35%, transparent)"
            nodeColor={(n) =>
              n.type === "union"
                ? "var(--color-heritage-accent)"
                : (n.data as { gender?: string })?.gender === "F"
                  ? "var(--color-heritage-accent)"
                  : "var(--color-heritage-frame)"
            }
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
      <CanvasInner {...props} graph={graph} rootId={rootId} maxDepth={maxDepth} />
    </ReactFlowProvider>
  );
}
