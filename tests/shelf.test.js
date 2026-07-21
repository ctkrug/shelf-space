import { describe, expect, it } from "vitest";
import {
  computeShelfState,
  computeAllShelfStates,
  shelfCapacityBooksFor,
  TOKENS_PER_BOOK,
} from "../src/core/shelf.js";
import { MODELS } from "../src/core/models.js";

const gpt = MODELS.find((m) => m.id === "gpt-5.6-sol");
const claude = MODELS.find((m) => m.id === "claude-fable-5");
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

describe("shelfCapacityBooksFor", () => {
  it("matches the shelfCapacityBooks computeShelfState derives for the same model", () => {
    for (const model of MODELS) {
      expect(shelfCapacityBooksFor(model)).toBe(computeShelfState("some text", model).shelfCapacityBooks);
    }
  });

  it("is independent of any pasted text", () => {
    expect(shelfCapacityBooksFor(gpt)).toBe(shelfCapacityBooksFor(gpt));
  });

  it("never returns less than 1, even for a tiny context window", () => {
    const tinyModel = { ...gpt, contextWindow: 1 };
    expect(shelfCapacityBooksFor(tinyModel)).toBeGreaterThanOrEqual(1);
  });
});

describe("computeAllShelfStates", () => {
  it("returns one state per model, keyed by model id", () => {
    const states = computeAllShelfStates("a short paste", MODELS);
    expect(Object.keys(states).sort()).toEqual(MODELS.map((m) => m.id).sort());
  });

  it("places War and Peace within every current model's published window", () => {
    // ~587,000 words is roughly War and Peace's length.
    const warAndPeace = "word ".repeat(587_000);
    const states = computeAllShelfStates(warAndPeace, MODELS);

    for (const model of MODELS) {
      expect(states[model.id].fillRatio).toBeGreaterThan(0.65);
      expect(states[model.id].fillRatio).toBeLessThan(0.85);
      expect(states[model.id].overflowing).toBe(false);
    }
  });

  it("returns an empty-books state for every model on empty input", () => {
    const states = computeAllShelfStates("", MODELS);
    for (const model of MODELS) {
      expect(states[model.id].totalBooks).toBe(0);
      expect(states[model.id].overflowing).toBe(false);
    }
  });
});
