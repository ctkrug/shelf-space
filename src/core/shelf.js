import { estimateTokens } from "./tokenizer.js";

/** Each "book" mesh represents this many tokens of pasted text. */
export const TOKENS_PER_BOOK = 2000;

/**
 * Turns a token count into shelf occupancy: how many books fit on the
 * shelf before it's full, and how many spill onto the floor in front
 * of it. This is the core of the physical metaphor, so it's kept as
 * pure data (no Three.js) and fully unit-testable.
 */
export function computeShelfState(text, model) {
  const tokens = estimateTokens(text, model);
  const totalBooks = tokens === 0 ? 0 : Math.max(1, Math.ceil(tokens / TOKENS_PER_BOOK));
  const shelfCapacityBooks = Math.max(1, Math.floor(model.contextWindow / TOKENS_PER_BOOK));

  const booksOnShelf = Math.min(totalBooks, shelfCapacityBooks);
  const booksOnFloor = Math.max(0, totalBooks - shelfCapacityBooks);
  const fillRatio = Math.min(1, booksOnShelf / shelfCapacityBooks);

  return {
    modelId: model.id,
    tokens,
    totalBooks,
    shelfCapacityBooks,
    booksOnShelf,
    booksOnFloor,
    fillRatio,
    overflowing: booksOnFloor > 0,
  };
}

/**
 * Runs computeShelfState across every model in one pass, keyed by model id,
 * so callers (UI readouts, the render layer) recompute all four shelves from
 * a single pasted text without re-deriving the per-model loop themselves.
 */
export function computeAllShelfStates(text, models) {
  const byModelId = {};
  for (const model of models) {
    byModelId[model.id] = computeShelfState(text, model);
  }
  return byModelId;
}
