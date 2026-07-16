import { describe, expect, it } from "vitest";
import { demoFamilyGraph, layoutFamily } from "../layoutFamily";

describe("layoutFamily", () => {
  const graph = demoFamilyGraph();

  it("đặt root + spouse + con trong depth", () => {
    const result = layoutFamily(graph, { rootId: "p1", maxDepth: 2 });
    const ids = new Set(result.nodes.map((n) => n.id));
    expect(ids.has("p1")).toBe(true);
    expect(ids.has("p2")).toBe(true);
    expect(ids.has("u1")).toBe(true);
    expect(ids.has("p3")).toBe(true);
    expect(ids.has("p4")).toBe(true);
    // depth 2 từ p1: cháu A4/A5 (depth 2) có khi maxDepth=2
    expect(ids.has("p6")).toBe(true);
  });

  it("giới hạn maxDepth=0 chỉ còn đời gốc (+ phối)", () => {
    const result = layoutFamily(graph, { rootId: "p1", maxDepth: 0 });
    const personIds = result.nodes.filter((n) => n.kind === "person").map((n) => n.id);
    expect(personIds).toContain("p1");
    expect(personIds).toContain("p2");
    expect(personIds).not.toContain("p3");
  });

  it("root A2 chỉ subtree nhánh trưởng", () => {
    const result = layoutFamily(graph, { rootId: "p3", maxDepth: 3 });
    const ids = new Set(result.nodes.map((n) => n.id));
    expect(ids.has("p3")).toBe(true);
    expect(ids.has("p6")).toBe(true);
    expect(ids.has("p1")).toBe(false);
  });

  it("con giữ thứ tự childIds (trái→phải theo order)", () => {
    const result = layoutFamily(graph, { rootId: "p1", maxDepth: 1 });
    const p3 = result.nodes.find((n) => n.id === "p3");
    const p4 = result.nodes.find((n) => n.id === "p4");
    expect(p3 && p4).toBeTruthy();
    expect(p3!.x).toBeLessThan(p4!.x);
  });

  it("hàng đời: depth lớn hơn có y lớn hơn", () => {
    const result = layoutFamily(graph, { rootId: "p1", maxDepth: 3 });
    const root = result.nodes.find((n) => n.id === "p1")!;
    const child = result.nodes.find((n) => n.id === "p3")!;
    expect(child.y).toBeGreaterThan(root.y);
  });
});
