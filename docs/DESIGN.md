# Design

## Aesthetic direction

**Shelf Space is a warm, tactile reading room:** dark walnut shelving, brass fixtures, and the
amber pool of a banker's lamp, with books that feel like objects, not icons. The theme is
literally a bookshelf, so the direction leans into that instead of the default dark-tech-product
look — this should feel like a cozy library corner at dusk, not a SaaS dashboard.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#17120d` | page background — near-black walnut |
| `--surface-1` | `#241a12` | shelf wood / panel base |
| `--surface-2` | `#332415` | raised panel / hover surface |
| `--text` | `#f3e6d0` | primary text — warm parchment |
| `--text-muted` | `#b9a68c` | secondary text, captions |
| `--accent` | `#d98a3d` | brass/amber — lamp glow, primary actions, fill indicators |
| `--accent-support` | `#4f7a5c` | library-lamp green — secondary actions, Kimi K3's "plenty of room" state |
| `--success` | `#6fae66` | shelf comfortably under capacity |
| `--danger` | `#d1543f` | overflow / floor spill state |

- **Display font:** [Fraunces](https://fonts.google.com/specimen/Fraunces) (variable, wght
  400–600) — an editorial serif with enough character for a wordmark and shelf labels, with
  `Georgia, serif` fallback.
- **UI font:** [Inter](https://fonts.google.com/specimen/Inter) for body copy, the paste panel,
  and buttons, with `system-ui, sans-serif` fallback.
- **Spacing unit:** 8px scale (8/16/24/32/48/64).
- **Corner radius:** 6px on panels/buttons — soft, not pill-shaped; books themselves render with
  crisp physical edges (0 radius) since they're 3D objects, not UI chrome.
- **Shadow/glow:** layered warm shadows (two stacked `box-shadow`s, `rgba(0,0,0,.4)` far +
  `rgba(217,138,61,.15)` near) on panels; the lamp casts a soft amber bloom onto nearby geometry
  in the 3D scene rather than a flat ambient light.
- **Motion:** UI transitions 160ms ease-out; in-scene feedback (book landing, spill) 90–140ms.

## Layout intent

The hero **is** the bookcase: a full-bleed Three.js canvas fills the viewport behind everything
else, four shelves labeled GPT-5.6 / Claude / Gemini / Kimi K3 running left to right, lit by a
hanging brass lamp whose glow brightens as the nearest shelf fills up.

- **1440×900 desktop:** canvas fills the full viewport (100vh). The paste panel floats as a
  translucent walnut card docked bottom-left (~360px wide, ~30% of viewport), so the shelves
  keep the visual majority. A slim top bar holds the wordmark and mute toggle only.
- **390×844 phone:** canvas takes the top ~55vh (shelves still readable, camera angle flattens
  slightly to keep all four shelves in frame), the paste panel becomes a bottom sheet that's
  peekable (collapsed to an input affordance) and expands on tap — no dead space, no
  side-by-side squeeze.

## Signature detail

The hanging banker's lamp above the shelves is animated: its amber glow intensity and the length
of its cast shadows respond live to overall shelf occupancy — the fuller the shelves, the warmer
and higher-contrast the scene gets, peaking in a brief warm flare the instant any shelf first
overflows. It's the one piece of ambient storytelling that makes the scene feel alive even before
you've pasted anything.

## Juice plan (paste → stack is the core interaction, treated like a toy)

- **Movement tween:** each book eases from an off-shelf spawn point into its resting slot over
  110–140ms (ease-out), never popping into place.
- **Impact feedback:** a landing book gives its shelf a 2–3px vertical settle-shake and a brief
  brass-colored rim-light flash on its spine.
- **Goal/success feedback:** a shelf crossing ~90% capacity gets a slow amber pulse along its
  front edge; hitting exactly full triggers one soft glow ring.
- **Overflow "win" moment:** the first book that can't fit tumbles off the shelf edge with a
  small physics arc and settles on the floor at a slight lean — camera gets a 1-frame micro-shake
  and the lamp briefly flares warmer.
- **Synth SFX (WebAudio-generated, no audio files):** a soft wooden "thunk" (short filtered noise
  burst) per book placed; a slightly lower, longer "clatter" for a floor spill; a gentle rising
  two-note chime when a shelf first reaches full; a faint paper-rustle tick while text is being
  typed/pasted (rate-throttled). All subtle in volume, with a mute toggle (top bar) persisted to
  `localStorage`, and the `AudioContext` created lazily on first user gesture.
- Respect `prefers-reduced-motion`: keep book placement and overflow functionally identical, drop
  the camera micro-shake and settle-shake.
