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
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { exportTreePdf, exportTreePng, exportTreeSvg, resolveExportBackground } from "./exportCanvas";
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
  exportPdf: () => Promise<void>;
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
  const { fitView, getNodes } = useReactFlow();
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
    const map = new Map<number, { labelY: number; lineY: number; gen: number }>();
    for (const n of layout.nodes) {
      if (n.kind !== "person" || !n.person) continue;
      if (!map.has(n.depth)) {
        map.set(n.depth, {
          labelY: n.y + 4,
          lineY: n.y + n.height,
          gen: n.person.generation,
        });
      }
    }
    return [...map.values()].sort((a, b) => a.labelY - b.labelY);
  }, [layout]);

  const guideLeft = layout.bounds.minX - 120;
  const guideWidth = Math.max(
    480,
    layout.bounds.maxX - layout.bounds.minX + 240,
  );
  const bandLeft = guideLeft + 8;

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

  /** Xuất theo bounds node — ổn định hơn chụp cả `.react-flow` (tránh lỗi CSS/font). */
  const captureViewport = useCallback(
    async (kind: "png" | "svg" | "pdf") => {
      const viewport = containerRef.current?.querySelector(
        ".react-flow__viewport",
      ) as HTMLElement | null;
      if (!viewport) throw new Error("Không tìm thấy viewport phả đồ.");

      const rfNodes = getNodes().filter((n) => n.type === "person" || n.type === "union");
      if (!rfNodes.length) throw new Error("Chưa có node để xuất.");

      const bounds = getNodesBounds(rfNodes);
      const imageWidth = 1600;
      const aspect = bounds.width > 0 ? bounds.height / bounds.width : 0.7;
      const imageHeight = Math.max(900, Math.round(imageWidth * aspect));
      const vb = getViewportForBounds(bounds, imageWidth, imageHeight, 0.15, 1.2, 0.18);
      const bg = resolveExportBackground();
      const common = {
        backgroundColor: bg,
        width: imageWidth,
        height: imageHeight,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${vb.x}px, ${vb.y}px) scale(${vb.zoom})`,
        },
      };
      const base = `pha-do-${rootId}-d${maxDepth}`;

      setExporting(true);
      try {
        if (kind === "png") {
          await exportTreePng(viewport, { ...common, fileName: `${base}.png` });
        } else if (kind === "svg") {
          await exportTreeSvg(viewport, { ...common, fileName: `${base}.svg` });
        } else {
          await exportTreePdf(viewport, { ...common, fileName: `${base}.pdf` });
        }
      } finally {
        setExporting(false);
      }
    },
    [getNodes, rootId, maxDepth],
  );

  const onExportPng = useCallback(() => captureViewport("png"), [captureViewport]);
  const onExportSvg = useCallback(() => captureViewport("svg"), [captureViewport]);
  const onExportPdf = useCallback(() => captureViewport("pdf"), [captureViewport]);

  useImperativeHandle(
    ref,
    () => ({
      fitView: doFit,
      exportPng: onExportPng,
      exportSvg: onExportSvg,
      exportPdf: onExportPdf,
    }),
    [doFit, onExportPng, onExportSvg, onExportPdf],
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
          <div className={styles.genLayer} aria-hidden>
            {genBands.map((b) => (
              <div key={`guide-${b.gen}-${b.lineY}`}>
                <div
                  className={styles.genGuide}
                  style={{
                    top: b.lineY,
                    left: guideLeft,
                    width: guideWidth,
                  }}
                />
                <div
                  className={styles.genBand}
                  style={{ top: b.labelY, left: bandLeft }}
                >
                  Đời {b.gen}
                </div>
              </div>
            ))}
          </div>
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
