/**
 * Real-world (Three.js unit) geometry for the bookcase, shared by
 * bookcase.js (static structure) and books.js (dynamic piles/spill) so
 * both agree on where each model's bay sits without duplicating numbers.
 */
export const BAY_WIDTH = 1.0;
export const BAY_DEPTH = 0.42;
export const DIVIDER_WIDTH = 0.06;
export const END_PANEL_WIDTH = 0.09;
export const SHELF_Y = 0.9;
export const MAX_PILE_HEIGHT = 1.15;
export const FLOOR_Y = 0;
export const SHELF_THICKNESS = 0.05;

export const BOOK_COLUMNS = 4;

const bayCount = 4;
export const TOTAL_WIDTH =
  bayCount * BAY_WIDTH + (bayCount - 1) * DIVIDER_WIDTH + 2 * END_PANEL_WIDTH;

/** Center-x of bay `index` (0-based, left to right), origin at bookcase center. */
export function bayCenterX(index) {
  const left = -TOTAL_WIDTH / 2 + END_PANEL_WIDTH;
  const offset = index * (BAY_WIDTH + DIVIDER_WIDTH) + BAY_WIDTH / 2;
  return left + offset;
}

/** Full geometry description for one bay, used by both static and dynamic meshes. */
export function bayLayout(index) {
  return {
    centerX: bayCenterX(index),
    width: BAY_WIDTH,
    depth: BAY_DEPTH,
    shelfY: SHELF_Y,
    maxPileHeight: MAX_PILE_HEIGHT,
    floorZ: BAY_DEPTH / 2,
  };
}
