# Architecture

A concise map of the codebase for anyone (human or a later build run) picking this up cold.
See [`VISION.md`](VISION.md) for why, [`DESIGN.md`](DESIGN.md) for the visual direction, and
[`BACKLOG.md`](BACKLOG.md) for what's built vs. planned.

## Data flow

```
textarea / dropped .txt / public GitHub URL (src/ui/panel.js)
  -> computeAllShelfStates(text, MODELS)   [src/core/shelf.js]
       -> per model: estimateTokens(text, model)   [src/core/tokenizer.js]
       -> shelfCapacityBooksFor(model), booksOnShelf/booksOnFloor/fillRatio/overflowing
  -> books.update(statesByModelId)   [src/render/books.js]
       -> gridPositions/gridRowCount   [src/core/layout.js]  decide (col, row) per book
       -> positions instanced meshes using bay geometry   [src/render/layout3d.js]
  -> readout.renderReadout(states, MODELS)   [src/ui/panel.js]  updates the token/book legend
  -> occupancy (avgFillRatio, anyOverflowing) feeds lamp.update() every frame [src/render/lamp.js]
  -> audio.playThunk()/playClatter() on book-count/overflow transitions [src/audio/sfx.js]
```

`src/main.js` is the only place that wires these together; every other module is either pure
data (core/) or a self-contained render/UI piece that takes data in and mutates its own meshes/DOM.

## `src/core/` — zero Three.js, fully unit-tested

- **`models.js`** — the shelf roster (`MODELS`): id, label, context window, tokenizer ratios.
  Adding next week's model is a data edit here, nothing else.
- **`tokenizer.js`** — `estimateTokens(text, model)`: blended char/word estimate per model.
- **`shelf.js`** — `shelfCapacityBooksFor(model)` (capacity from context window alone, no text
  needed — lets the render layer size buffers up front) and `computeShelfState(text, model)` /
  `computeAllShelfStates(text, models)` (the occupancy math: tokens → books → shelf vs. floor
  counts → fill ratio → overflow flag). This is the single source of truth the render layer reads;
  it never re-derives occupancy itself.
- **`layout.js`** — `gridPositions(count, columns)` / `gridRowCount(count, columns)`: pure
  (col, row) grid placement, used for both shelf piles and floor spill so the placement math is
  testable without a WebGL context.
- **`file-input.js`** — validates browser file boundaries and reads supported text files with
  designed errors for missing, empty, unsupported, or unreadable input.
- **`github-repo.js`** — strictly parses public GitHub repository URLs, then flattens a bounded
  set of supported text files through the public GitHub API.

## `src/render/` — Three.js, consumes core/ data, not unit-tested (no DOM/WebGL in Vitest)

- **`theme.js`** — mirrors `DESIGN.md`'s token table as Three.js color ints, plus the cycling
  book-spine palette. Single source so bookcase/lamp/books can't drift from the design doc
  independently.
- **`layout3d.js`** — shared real-world (Three.js unit) bay geometry: `bayCenterX`/`bayLayout`,
  shelf/floor dimensions, book-grid column count. Both `bookcase.js` and `books.js` position
  themselves from this so the static structure and the dynamic books always agree on where each
  model's bay sits.
- **`bookcase.js`** — builds the static walnut structure once: back/end panels, bay dividers, one
  shelf board + engraved nameplate per model, and the floor. Returns `{ group, bays, caseTopY }`.
- **`lamp.js`** — the signature hanging banker's lamp. `update(deltaSeconds, { avgFillRatio,
  anyOverflowing })` drives glow intensity and light height (lower = longer shadows) from overall
  occupancy, with a brief flare the instant any shelf first overflows.
- **`books.js`** — the dynamic heart of the wow moment. Per model bay: one `InstancedMesh` for the
  shelf pile and one for floor spill. Book height per model is calibrated so a full shelf capacity
  exactly fills the bay's max pile height — that calibration alone is what makes the same paste
  look dramatically different across a 150K vs. 8M token context window. New instances spawn at
  near-zero scale and ease up over 120ms (`animate(deltaSeconds)`, called every frame) instead of
  popping in. **Gotcha:** `InstancedMesh.frustumCulled` must be disabled — Three.js caches its
  bounding sphere from the *first* culling test (count=0, before any paste) and never recomputes
  it, so a mesh that starts empty silently stops rendering forever once real instances exist.
- **`scene.js`** — camera, renderer, lighting, fog, and orchestration: builds the bookcase, lamp,
  and books, and exposes `resize()` / `tick(deltaSeconds, occupancy)`. Also owns the portrait-aspect
  camera-framing fix: a fixed vertical FOV loses horizontal coverage on narrow viewports, so
  `framingFor(aspect)` widens the FOV first (capped, to avoid fisheye) and only pushes the camera
  back as a last resort, extending `fog.far` to match.
- **`orbit.js`** — canvas-only pointer drag orbit and wheel zoom, with restrained elevation and
  distance limits so a user can explore the shelf without losing the bookcase.

## `src/ui/` and `src/audio/` — DOM/WebAudio, not unit-tested

- **`panel.js`** — wires the textarea (debounced 120ms), `.txt` drop/picker, public GitHub URL
  hydration, clear button, mobile bottom-sheet toggle, and inline input status; exposes
  `renderReadout(states, models)` for the per-shelf token/book legend.
- **`sfx.js`** — WebAudio-synthesized thunk/clatter SFX (oscillators only, no audio files); mute
  state persists to `localStorage`; `AudioContext` is created lazily so it only ever spins up
  inside a user-gesture-driven call.

## Entry point

`src/main.js` creates the scene, wires the paste panel's `onInput` to
`computeAllShelfStates` → `books.update` + `readout.renderReadout`, maintains the `occupancy`
object the render loop reads every frame, and triggers SFX on book-count/overflow transitions.

## Running it

```bash
npm install
npm run dev      # local dev server, hot reload
npm test         # vitest — core/ math only, runs in Node, no browser needed
npm run lint     # eslint over src + tests
npm run build    # static production build to dist/ (base: "./", subpath-servable)
```
