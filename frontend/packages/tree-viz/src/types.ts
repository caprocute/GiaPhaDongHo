/** Giới tính / trạng thái — map gần với Person BE */
export type Gender = "M" | "F" | "U";
export type LifeStatus = "alive" | "deceased";

export interface PersonNodeData {
  id: string;
  code: string;
  fullName: string;
  /** Đời tuyệt đối trong cây (1 = tổ) */
  generation: number;
  gender?: Gender;
  lifeStatus?: LifeStatus;
}

/**
 * Hôn phối: nối vợ/chồng + danh sách con theo thứ tự.
 * `memberIds[0]` thường là người thuộc dòng chính khi layout từ root.
 */
export interface UnionNodeData {
  id: string;
  memberIds: string[];
  /** Con theo orderNo tăng dần */
  childIds: string[];
}

export interface FamilyGraph {
  persons: PersonNodeData[];
  unions: UnionNodeData[];
}

export interface LayoutOptions {
  /** Person id làm gốc phả đồ */
  rootId: string;
  /** Số đời hậu duệ tối đa kể từ root (parity FR-04) */
  maxDepth: number;
  nodeWidth?: number;
  nodeHeight?: number;
  unionSize?: number;
  hGap?: number;
  vGap?: number;
  /** Khoảng giữa vợ–chồng (mỗi bên nút hôn phối) */
  spouseGap?: number;
}

export type LayoutKind = "person" | "union";

export interface PositionedNode {
  id: string;
  kind: LayoutKind;
  x: number;
  y: number;
  width: number;
  height: number;
  person?: PersonNodeData;
  union?: UnionNodeData;
  /** Đời tương đối so với root (0 = root) */
  depth: number;
}

export interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  /** spouse | child */
  kind: "spouse" | "child";
  sourceHandle?: string;
  targetHandle?: string;
}

export interface LayoutResult {
  nodes: PositionedNode[];
  edges: LayoutEdge[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  rootId: string;
  maxDepth: number;
}

/** @deprecated dùng PersonNodeData + layoutFamily */
export interface TreeNodeInput {
  id: string;
  label: string;
  generation: number;
  parentId?: string;
}
