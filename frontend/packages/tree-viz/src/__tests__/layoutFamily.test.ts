import { describe, expect, it } from "vitest";
import { demoFamilyGraph, layoutFamily } from "../layoutFamily";

describe("layoutFamily", () => {
  const graph = demoFamilyGraph();

  it("đặt root + phối + con trong depth", () => {
    const result = layoutFamily(graph, { rootId: "a7", maxDepth: 2 });
    const ids = new Set(result.nodes.map((n) => n.id));
    expect(ids.has("a7")).toBe(true);
    expect(ids.has("a7sp")).toBe(true);
    expect(ids.has("u1")).toBe(true);
    expect(ids.has("a22")).toBe(true);
    expect(ids.has("a18")).toBe(true);
    // depth 2 từ a7: cháu đời 7
    expect(ids.has("a36")).toBe(true);
  });

  it("giới hạn maxDepth=0 chỉ còn đời gốc (+ phối)", () => {
    const result = layoutFamily(graph, { rootId: "a7", maxDepth: 0 });
    const personIds = result.nodes.filter((n) => n.kind === "person").map((n) => n.id);
    expect(personIds).toContain("a7");
    expect(personIds).toContain("a7sp");
    expect(personIds).not.toContain("a22");
  });

  it("root A22 chỉ subtree nhánh Thạch", () => {
    const result = layoutFamily(graph, { rootId: "a22", maxDepth: 3 });
    const ids = new Set(result.nodes.map((n) => n.id));
    expect(ids.has("a22")).toBe(true);
    expect(ids.has("a55")).toBe(true);
    expect(ids.has("a7")).toBe(false);
  });

  it("con giữ thứ tự childIds (trái→phải theo order)", () => {
    const result = layoutFamily(graph, { rootId: "a7", maxDepth: 1 });
    const a18 = result.nodes.find((n) => n.id === "a18");
    const a22 = result.nodes.find((n) => n.id === "a22");
    expect(a18 && a22).toBeTruthy();
    expect(a18!.x).toBeLessThan(a22!.x);
  });

  it("hàng đời: depth lớn hơn có y lớn hơn", () => {
    const result = layoutFamily(graph, { rootId: "a7", maxDepth: 3 });
    const root = result.nodes.find((n) => n.id === "a7")!;
    const child = result.nodes.find((n) => n.id === "a22")!;
    expect(child.y).toBeGreaterThan(root.y);
  });
});
