import { describe, expect, it } from "vitest";
import { computeShelfState, TOKENS_PER_BOOK } from "../src/core/shelf.js";
import { MODELS } from "../src/core/models.js";

const gpt = MODELS.find((m) => m.id === "gpt-5.6");
const claude = MODELS.find((m) => m.id === "claude");
const kimi = MODELS.find((m) => m.id === "kimi-k3");

describe("computeShelfState", () => {
  it("puts nothing on the shelf or floor for empty input", () => {
    const state = computeShelfState("", gpt);
    expect(state.totalBooks).toBe(0);
    expect(state.booksOnShelf).toBe(0);
    expect(state.booksOnFloor).toBe(0);
    expect(state.overflowing).toBe(false);
  });

  it("does not overflow a huge-context model on a normal paste", () => {
    const state = computeShelfState("a reasonably short paragraph of pasted text", kimi);
    expect(state.booksOnFloor).toBe(0);
    expect(state.overflowing).toBe(false);
  });

  it("spills onto the floor once a small shelf's capacity is exceeded", () => {
    const wordsNeeded = Math.ceil((claude.contextWindow / TOKENS_PER_BOOK) * TOKENS_PER_BOOK * 3);
    const hugeText = "word ".repeat(wordsNeeded);
    const state = computeShelfState(hugeText, claude);
    expect(state.overflowing).toBe(true);
    expect(state.booksOnFloor).toBeGreaterThan(0);
    expect(state.booksOnShelf).toBe(state.shelfCapacityBooks);
  });

  it("never exceeds a shelf's own capacity of books", () => {
    const hugeText = "word ".repeat(200_000);
    const state = computeShelfState(hugeText, claude);
    expect(state.booksOnShelf).toBeLessThanOrEqual(state.shelfCapacityBooks);
  });

  it("fillRatio is between 0 and 1 inclusive", () => {
    const state = computeShelfState("word ".repeat(200_000), gpt);
    expect(state.fillRatio).toBeGreaterThanOrEqual(0);
    expect(state.fillRatio).toBeLessThanOrEqual(1);
  });
});
