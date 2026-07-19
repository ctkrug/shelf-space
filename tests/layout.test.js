import { describe, expect, it } from "vitest";
import { gridPositions, gridRowCount } from "../src/core/layout.js";

describe("gridPositions", () => {
  it("returns an empty array for zero or negative count", () => {
    expect(gridPositions(0, 4)).toEqual([]);
    expect(gridPositions(-3, 4)).toEqual([]);
  });

  it("fills a single row when count is within the column width", () => {
    expect(gridPositions(3, 4)).toEqual([
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 2, row: 0 },
    ]);
  });

  it("wraps into a new row once columns are exceeded", () => {
    expect(gridPositions(5, 4)).toEqual([
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 2, row: 0 },
      { col: 3, row: 0 },
      { col: 0, row: 1 },
    ]);
  });

  it("stacks straight up with a single column", () => {
    const positions = gridPositions(4, 1);
    expect(positions.map((p) => p.row)).toEqual([0, 1, 2, 3]);
    expect(positions.every((p) => p.col === 0)).toBe(true);
  });

  it("treats a non-positive column count as a single column", () => {
    expect(gridPositions(2, 0)).toEqual([
      { col: 0, row: 0 },
      { col: 0, row: 1 },
    ]);
  });

  it("truncates a fractional count to whole items", () => {
    expect(gridPositions(2.9, 4)).toHaveLength(2);
  });
});

describe("gridRowCount", () => {
  it("is zero for zero or negative count", () => {
    expect(gridRowCount(0, 4)).toBe(0);
    expect(gridRowCount(-1, 4)).toBe(0);
  });

  it("is one row when count fits exactly in the column width", () => {
    expect(gridRowCount(4, 4)).toBe(1);
  });

  it("rounds up to a partial extra row", () => {
    expect(gridRowCount(5, 4)).toBe(2);
  });

  it("matches the number of distinct rows gridPositions produces", () => {
    const count = 37;
    const columns = 6;
    const positions = gridPositions(count, columns);
    const distinctRows = new Set(positions.map((p) => p.row)).size;
    expect(gridRowCount(count, columns)).toBe(distinctRows);
  });
});
