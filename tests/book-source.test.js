import { describe, expect, it } from "vitest";
import { sourceForBookHit } from "../src/core/book-source.js";

const models = [{ id: "kimi", label: "Kimi K3" }];

describe("sourceForBookHit", () => {
  it("labels an on-shelf source slice", () => {
    expect(sourceForBookHit("abcdefgh", {
      modelId: "kimi", bookIndex: 1, totalBooks: 4, isFloor: false,
    }, models)).toEqual({
      modelLabel: "Kimi K3", bookNumber: 2, totalBooks: 4, location: "Shelf", start: 2, end: 4, text: "cd",
    });
  });

  it("identifies floor spill slices", () => {
    expect(sourceForBookHit("abcd", {
      modelId: "kimi", bookIndex: 3, totalBooks: 4, isFloor: true,
    }, models)?.location).toBe("Floor spill");
  });

  it("rejects unknown, empty, and malformed selections", () => {
    expect(sourceForBookHit("abc", { modelId: "missing", bookIndex: 0, totalBooks: 1 }, models)).toBeNull();
    expect(sourceForBookHit("", { modelId: "kimi", bookIndex: 0, totalBooks: 1 }, models)).toBeNull();
    expect(sourceForBookHit("abc", null, models)).toBeNull();
    expect(sourceForBookHit("abc", { modelId: "kimi", bookIndex: 0, totalBooks: 1 })).toBeNull();
  });
});
