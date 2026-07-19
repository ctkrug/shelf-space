/**
 * Pure grid-placement math for turning a book count into (col, row)
 * coordinates. Kept free of Three.js so the render layer's placement
 * logic is unit-testable without a WebGL context — it just maps these
 * coordinates onto real-world units.
 */
export function gridPositions(count, columns) {
  const cols = Math.max(1, Math.floor(columns));
  if (!Number.isFinite(count) || count <= 0) return [];

  return Array.from({ length: Math.floor(count) }, (_, i) => ({
    col: i % cols,
    row: Math.floor(i / cols),
  }));
}

/** How many rows a grid of `count` items needs at a given column width. */
export function gridRowCount(count, columns) {
  const cols = Math.max(1, Math.floor(columns));
  if (!Number.isFinite(count) || count <= 0) return 0;
  return Math.ceil(count / cols);
}
