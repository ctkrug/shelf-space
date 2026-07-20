import { sourceChunkForBook } from "./chunks.js";

/** Converts a rendered-book hit into display-safe source inspection data. */
export function sourceForBookHit(text, hit, models) {
  if (!hit || !Array.isArray(models)) return null;
  const model = models.find((candidate) => candidate.id === hit.modelId);
  const chunk = sourceChunkForBook(text, hit.bookIndex, hit.totalBooks);
  if (!model || !chunk) return null;

  return {
    modelLabel: model.label,
    bookNumber: hit.bookIndex + 1,
    totalBooks: hit.totalBooks,
    location: hit.isFloor ? "Floor spill" : "Shelf",
    ...chunk,
  };
}
