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
  const { fitView: _fitViewUnused, getNodes, setViewport } = useReactFlow();
  void _fitViewUnused;
  const [exporting, setExporting] = useState(false);
  const fitKey = `${rootId}:${maxDepth}:${graph.persons.length}:${graph.unions.length}`;
  const lastFitKey = useRef("");

  /** Lề trái cho chữ «Đời N» — fitView mặc định chỉ ôm node nên chữ bị cắt */
  const LABEL_GUTTER = 168;

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
          labelY: n.y + 8,
          lineY: n.y + n.height,
          gen: n.person.generation,
        });
      }
    }
    return [...map.values()].sort((a, b) => a.labelY - b.labelY);
  }, [layout]);

  const guideLeft = layout.bounds.minX - LABEL_GUTTER;
  const guideWidth = Math.max(
    480,
    layout.bounds.maxX - layout.bounds.minX + LABEL_GUTTER + 80,
  );
  /** Neo mép phải chữ ngay trước cột node trái nhất */
  const bandRightEdge = layout.bounds.minX - 20;

  const fitToTree = useCallback(
    (duration = 0) => {
      const rfNodes = getNodes().filter((n) => n.type === "person" || n.type === "union");
      if (!rfNodes.length) return;
      const b = getNodesBounds(rfNodes);
      const expanded = {
        x: b.x - LABEL_GUTTER,
        y: b.y - 28,
        width: b.width + LABEL_GUTTER + 56,
        height: b.height + 56,
      };
      const rect = containerRef.current?.getBoundingClientRect();
      const w = Math.max(320, rect?.width ?? 800);
      const h = Math.max(240, rect?.height ?? 560);
      const vp = getViewportForBounds(expanded, w, h, 0.12, 1.05, 0.08);
      void setViewport(vp, { duration });
    },
    [getNodes, setViewport],
  );

  useEffect(() => {
    if (lastFitKey.current === fitKey) return;
    lastFitKey.current = fitKey;
    const id = window.setTimeout(() => fitToTree(0), 50);
    return () => window.clearTimeout(id);
  }, [fitKey, fitToTree, nodes.length]);

  const doFit = useCallback(() => fitToTree(200), [fitToTree]);

  /** Xuất theo bounds node + lề chữ đời */
  const captureViewport = useCallback(
    async (kind: "png" | "svg" | "pdf") => {
      const viewport = containerRef.current?.querySelector(
        ".react-flow__viewport",
      ) as HTMLElement | null;
      if (!viewport) throw new Error("Không tìm thấy viewport phả đồ.");

      const rfNodes = getNodes().filter((n) => n.type === "person" || n.type === "union");
      if (!rfNodes.length) throw new Error("Chưa có node để xuất.");

      const b = getNodesBounds(rfNodes);
      const bounds = {
        x: b.x - LABEL_GUTTER,
        y: b.y - 28,
        width: b.width + LABEL_GUTTER + 56,
        height: b.height + 56,
      };
      const imageWidth = 1600;
      const aspect = bounds.width > 0 ? bounds.height / bounds.width : 0.7;
      const imageHeight = Math.max(900, Math.round(imageWidth * aspect));
      const vb = getViewportForBounds(bounds, imageWidth, imageHeight, 0.12, 1.2, 0.08);
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
                  style={{ top: b.labelY, left: bandRightEdge }}
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
