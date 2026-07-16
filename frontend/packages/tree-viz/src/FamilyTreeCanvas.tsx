"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type Ref,
} from "react";
import {
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  ViewportPortal,
  useReactFlow,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { exportTreePng, exportTreeSvg } from "./exportCanvas";
import { demoFamilyGraph, layoutFamily } from "./layoutFamily";
import { PersonNode } from "./nodes/PersonNode";
import { UnionNode } from "./nodes/UnionNode";
import { toReactFlowElements } from "./toReactFlow";
import type { FamilyGraph, PersonNodeData } from "./types";
import styles from "./FamilyTreeCanvas.module.css";

const nodeTypes: NodeTypes = {
  person: PersonNode,
  union: UnionNode,
};

export type FamilyTreeCanvasHandle = {
  fitView: () => void;
  exportPng: () => Promise<void>;
  exportSvg: () => Promise<void>;
};

export interface FamilyTreeCanvasProps {
  graph?: FamilyGraph;
  rootId?: string;
  maxDepth?: number;
  height?: number | string;
  showMiniMap?: boolean;
  /** Ẩn toolbar export nội bộ — dùng toolbar trang (mockup pd-tools) */
  showExport?: boolean;
  showFrame?: boolean;
  selectedId?: string | null;
  onSelectPerson?: (person: PersonNodeData | null) => void;
  className?: string;
}

type InnerProps = Required<Pick<FamilyTreeCanvasProps, "graph" | "rootId" | "maxDepth">> &
  Omit<FamilyTreeCanvasProps, "graph" | "rootId" | "maxDepth">;

function CanvasInner(
  {
    graph,
    rootId,
    maxDepth,
    height,
    showMiniMap,
    showFrame = true,
    selectedId = null,
    onSelectPerson,
    className,
  }: InnerProps,
  ref: Ref<FamilyTreeCanvasHandle>,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();
  const [exporting, setExporting] = useState(false);
  const fitKey = `${rootId}:${maxDepth}:${graph.persons.length}:${graph.unions.length}`;
  const lastFitKey = useRef("");

  const layout = useMemo(
    () => layoutFamily(graph, { rootId, maxDepth }),
    [graph, rootId, maxDepth],
  );

  const { nodes, edges } = useMemo(
    () => toReactFlowElements(layout, { selectedId, showFrame }),
    [layout, selectedId, showFrame],
  );

  const genBands = useMemo(() => {
    const map = new Map<number, { y: number; gen: number }>();
    for (const n of layout.nodes) {
      if (n.kind !== "person" || !n.person) continue;
      if (!map.has(n.depth)) {
        map.set(n.depth, { y: n.y + 4, gen: n.person.generation });
      }
    }
    return [...map.values()];
  }, [layout]);

  const bandLeft = Math.min(layout.bounds.minX - 100, -20);

  useEffect(() => {
    if (lastFitKey.current === fitKey) return;
    lastFitKey.current = fitKey;
    const id = window.setTimeout(() => {
      void fitView({ padding: 0.16, duration: 0, maxZoom: 1 });
    }, 50);
    return () => window.clearTimeout(id);
  }, [fitKey, fitView, nodes.length]);

  const doFit = useCallback(() => {
    void fitView({ padding: 0.16, duration: 200, maxZoom: 1 });
  }, [fitView]);

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

  useImperativeHandle(
    ref,
    () => ({
      fitView: doFit,
      exportPng: onExportPng,
      exportSvg: onExportSvg,
    }),
    [doFit, onExportPng, onExportSvg],
  );

  const onNodeClick = useCallback(
    (_: MouseEvent, node: Node) => {
      if (node.type !== "person") return;
      onSelectPerson?.(node.data as unknown as PersonNodeData);
    },
    [onSelectPerson],
  );

  const onPaneClick = useCallback(() => {
    onSelectPerson?.(null);
  }, [onSelectPerson]);

  return (
    <div
      ref={containerRef}
      className={`${styles.shell}${className ? ` ${className}` : ""}`}
      style={{ height: height ?? "100%" }}
      data-tree-canvas
      data-exporting={exporting ? "1" : "0"}
    >
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
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        aria-label="Sơ đồ phả hệ"
      >
        <ViewportPortal>
          {genBands.map((b) => (
            <div
              key={`gen-${b.gen}-${b.y}`}
              className={styles.genBand}
              style={{ top: b.y, left: bandLeft }}
            >
              Đời {b.gen}
            </div>
          ))}
        </ViewportPortal>
        <Controls showInteractive={false} showFitView={false} position="bottom-left" />
        {showMiniMap !== false && (
          <MiniMap
            pannable
            zoomable
            position="bottom-right"
            maskColor="color-mix(in srgb, var(--color-action-primary-bg) 12%, transparent)"
            nodeColor={(n) => {
              if (n.type === "union") return "transparent";
              const g = (n.data as { gender?: string })?.gender;
              return g === "F" ? "var(--color-heritage-accent)" : "var(--color-heritage-frame)";
            }}
          />
        )}
      </ReactFlow>
    </div>
  );
}

const CanvasInnerForward = forwardRef(CanvasInner);

export const FamilyTreeCanvas = forwardRef<FamilyTreeCanvasHandle, FamilyTreeCanvasProps>(
  function FamilyTreeCanvas(props, ref) {
    const graph = props.graph ?? demoFamilyGraph();
    const rootId = props.rootId ?? graph.persons.find((p) => p.code === "A22")?.id ?? graph.persons[0]?.id ?? "";
    const maxDepth = props.maxDepth ?? 4;

    return (
      <ReactFlowProvider>
        <CanvasInnerForward {...props} ref={ref} graph={graph} rootId={rootId} maxDepth={maxDepth} />
      </ReactFlowProvider>
    );
  },
);
