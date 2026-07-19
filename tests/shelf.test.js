import { describe, expect, it } from "vitest";
import { computeShelfState, computeAllShelfStates, TOKENS_PER_BOOK } from "../src/core/shelf.js";
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

describe("computeAllShelfStates", () => {
  it("returns one state per model, keyed by model id", () => {
    const states = computeAllShelfStates("a short paste", MODELS);
    expect(Object.keys(states).sort()).toEqual(MODELS.map((m) => m.id).sort());
  });

  it("produces the War and Peace wow moment: GPT-5.6 near capacity, smaller shelves overflow, Kimi barely dents", () => {
    // ~587,000 words is roughly War and Peace's length.
    const warAndPeace = "word ".repeat(587_000);
    const states = computeAllShelfStates(warAndPeace, MODELS);

    expect(states["gpt-5.6"].fillRatio).toBeGreaterThan(0.8);
    expect(states["gpt-5.6"].overflowing).toBe(false);

    expect(states.claude.overflowing).toBe(true);
    expect(states.claude.booksOnFloor).toBeGreaterThan(0);

    expect(states.gemini.overflowing).toBe(true);
    expect(states.gemini.booksOnFloor).toBeGreaterThan(0);

    expect(states["kimi-k3"].overflowing).toBe(false);
    expect(states["kimi-k3"].fillRatio).toBeLessThan(0.2);
  });

  it("returns an empty-books state for every model on empty input", () => {
    const states = computeAllShelfStates("", MODELS);
    for (const model of MODELS) {
      expect(states[model.id].totalBooks).toBe(0);
      expect(states[model.id].overflowing).toBe(false);
    }
  });
});
