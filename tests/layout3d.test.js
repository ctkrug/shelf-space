import { describe, expect, it } from "vitest";
import { bayCenterX, bayLayout, TOTAL_WIDTH, BAY_WIDTH } from "../src/render/layout3d.js";

describe("bayCenterX", () => {
  it("centers all four bays symmetrically around x = 0", () => {
    const centers = [0, 1, 2, 3].map(bayCenterX);
    const mean = centers.reduce((a, b) => a + b, 0) / centers.length;
    expect(mean).toBeCloseTo(0, 10);
  });

  it("orders bays left to right with increasing x", () => {
    const centers = [0, 1, 2, 3].map(bayCenterX);
    for (let i = 1; i < centers.length; i += 1) {
      expect(centers[i]).toBeGreaterThan(centers[i - 1]);
    }
  });

  it("spaces adjacent bay centers by exactly one bay width plus one divider", () => {
    const centers = [0, 1, 2, 3].map(bayCenterX);
    const gap = centers[1] - centers[0];
    for (let i = 2; i < centers.length; i += 1) {
      expect(centers[i] - centers[i - 1]).toBeCloseTo(gap, 10);
    }
  });

  it("keeps every bay within the bookcase's total width", () => {
    for (const index of [0, 1, 2, 3]) {
      const center = bayCenterX(index);
      expect(center - BAY_WIDTH / 2).toBeGreaterThanOrEqual(-TOTAL_WIDTH / 2 - 1e-9);
      expect(center + BAY_WIDTH / 2).toBeLessThanOrEqual(TOTAL_WIDTH / 2 + 1e-9);
    }
  });
});

describe("bayLayout", () => {
  it("returns consistent geometry fields for every bay index", () => {
    for (const index of [0, 1, 2, 3]) {
      const layout = bayLayout(index);
      expect(layout.width).toBe(BAY_WIDTH);
      expect(layout.centerX).toBe(bayCenterX(index));
      expect(layout.maxPileHeight).toBeGreaterThan(0);
      expect(layout.floorZ).toBeGreaterThan(0);
    }
  });
});
