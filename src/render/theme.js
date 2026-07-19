/**
 * Three.js-facing mirror of docs/DESIGN.md's token table. Kept as one
 * module (like core/models.js is for the shelf roster) so the palette
 * used by the bookcase, lamp, and book materials can't drift from the
 * design doc in one file without the others noticing.
 */
export const THEME = {
  bg: 0x17120d,
  surface1: 0x241a12,
  surface2: 0x332415,
  text: 0xf3e6d0,
  textMuted: 0xb9a68c,
  accent: 0xd98a3d,
  accentSupport: 0x4f7a5c,
  success: 0x6fae66,
  danger: 0xd1543f,
};

/** Muted library-shelf book spine colors, cycled per instance by index. */
export const BOOK_PALETTE = [
  0x8a3b2e, // brick
  0x4f7a5c, // library green (accent-support)
  0xd98a3d, // brass/amber (accent)
  0x5b6a8a, // dusty blue
  0x9c7a3c, // ochre
  0x6e3b52, // plum
  0xb9a68c, // parchment
  0x3f5a4a, // deep pine
];

export function bookColorFor(index) {
  return BOOK_PALETTE[index % BOOK_PALETTE.length];
}
