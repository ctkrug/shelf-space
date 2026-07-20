import { describe, expect, it } from "vitest";
import { sourceChunkForBook } from "../src/core/chunks.js";

describe("sourceChunkForBook", () => {
  it("partitions a source string into contiguous, exact book slices", () => {
    const chunks = [0, 1, 2].map((index) => sourceChunkForBook("abcdefg", index, 3));

    expect(chunks).toEqual([
      { start: 0, end: 2, text: "ab" },
      { start: 2, end: 4, text: "cd" },
      { start: 4, end: 7, text: "efg" },
    ]);
    expect(chunks.map((chunk) => chunk.text).join("")).toBe("abcdefg");
  });

  it("handles a single book and more books than characters", () => {
    expect(sourceChunkForBook("whole", 0, 1)).toEqual({ start: 0, end: 5, text: "whole" });
    expect(sourceChunkForBook("x", 0, 3)).toEqual({ start: 0, end: 0, text: "" });
    expect(sourceChunkForBook("x", 2, 3)).toEqual({ start: 0, end: 1, text: "x" });
  });

  it("rejects empty, out-of-range, and malformed inputs", () => {
    expect(sourceChunkForBook("", 0, 1)).toBeNull();
    expect(sourceChunkForBook("text", -1, 2)).toBeNull();
    expect(sourceChunkForBook("text", 2, 2)).toBeNull();
    expect(sourceChunkForBook("text", 0, 0)).toBeNull();
    expect(sourceChunkForBook(null, 0, 1)).toBeNull();
    expect(sourceChunkForBook("text", 0.5, 2)).toBeNull();
  });
});
