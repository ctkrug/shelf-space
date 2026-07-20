/**
 * Returns the slice of source text represented by a zero-based book index.
 * Text is divided by character boundary rather than token boundary because the
 * visual token estimate is model-specific while the inspected source must stay
 * an exact, copyable slice of the user's input.
 */
export function sourceChunkForBook(text, bookIndex, bookCount) {
  if (typeof text !== "string" || !Number.isInteger(bookIndex) || !Number.isInteger(bookCount)) {
    return null;
  }
  if (text.length === 0 || bookCount <= 0 || bookIndex < 0 || bookIndex >= bookCount) {
    return null;
  }

  const start = Math.floor((bookIndex * text.length) / bookCount);
  const end = Math.floor(((bookIndex + 1) * text.length) / bookCount);
  return { start, end, text: text.slice(start, end) };
}
