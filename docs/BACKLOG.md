# Backlog

Stories are marked `[ ]` until done. Every story lists acceptance criteria a later run can check
true/false against — no "works well" vibes checks.

## Epic 1 — Core stack pipeline (the wow moment)

- [x] **1.1 Paste text and watch it stack across all four shelves — WOW MOMENT**
  - Pasting text into the input renders book meshes stacking onto the GPT-5.6, Claude, Gemini,
    and Kimi K3 shelves within 2 seconds, with no page reload.
  - Pasting the full text of *War and Peace* fills the GPT-5.6 shelf near capacity, overflows
    Claude and Gemini onto the floor, and leaves Kimi K3 mostly empty.
  - Clearing the input empties all four shelves back to zero books.

- [x] **1.2 Shelves overflow onto the floor when a model's context window is exceeded**
  - Once a shelf's book count reaches its capacity, additional books render on the floor in
    front of that shelf instead of stacking further.
  - `computeShelfState` remains the single source of truth for shelf/floor counts — no duplicate
    occupancy math added in the render layer.

- [x] **1.3 Live per-shelf token/book readout**
  - Each shelf label shows its estimated token count and "N / capacity books," updating on every
    input change.
  - A shelf that's currently overflowing shows a distinct (danger-colored) readout state, not
    just an overflow in the 3D scene.

- [x] **1.4 Design polish: bookcase scene matches `docs/DESIGN.md`**
  - Scene lighting, wood/brass materials, and shelf-label typography match the tokens in
    `docs/DESIGN.md` (no default Three.js gray materials).
  - The banker's-lamp signature detail is present and its glow visibly responds to overall
    shelf occupancy.

## Epic 2 — Input & interaction

- [x] **2.1 File-drop input for `.txt` files**
  - Dragging a `.txt` file onto the paste panel loads its contents into the input and triggers
    a re-stack.
  - Dropping a non-text file shows an inline error state, not a crash or silent no-op.

- [x] **2.2 Public GitHub repo input, flattened**
  - Pasting a public GitHub repo URL fetches and concatenates its text-file contents (via
    GitHub's API) and feeds that into the tokenizer/stacking pipeline.
  - A private or nonexistent repo URL shows an inline error state, not a crash.

- [x] **2.3 Orbit camera around the bookcase**
  - Dragging (mouse) or one-finger-dragging (touch) orbits the camera around the shelves;
    scroll/pinch zooms within sane min/max bounds.
  - Camera controls don't intercept the paste panel's own scroll/touch targets.

- [x] **2.4 Click a book to see its source text chunk**
  - Clicking/tapping a book mesh highlights it and opens a small panel showing which slice of
    the pasted text it represents.
  - Clicking empty space or pressing Escape closes the panel.

- [ ] **2.5 Design polish: paste panel responsive states**
  - At 390px width the paste panel behaves as the bottom-sheet described in `docs/DESIGN.md`
    (collapsed affordance, expands on tap) with no horizontal scroll.
  - Focus, hover, and active states are themed — no unstyled native textarea/button.

## Epic 3 — Feel, accessibility & ship

- [x] **3.1 Book placement/spill animation and synth SFX**
  - Each book eases into its resting slot over 110–140ms rather than appearing instantly.
  - A distinct synth "thunk" plays on placement and a "clatter" plays on floor spill; a mute
    toggle in the top bar persists across reloads via `localStorage`.

- [ ] **3.2 Shareable URL state**
  - After pasting text, the URL updates (e.g. a compressed query param) such that opening that
    URL in a fresh tab reproduces the same shelf/floor state.
  - Very large pastes that would exceed a reasonable URL length degrade gracefully (e.g. a
    "too long to share" notice) instead of breaking navigation.

- [ ] **3.3 Responsive layout across phone/tablet/desktop**
  - Layout is verified with no horizontal scroll or overlap at 390px, 768px, and 1440px widths.
  - The canvas resizes and re-renders correctly (no stretched/cropped scene) on window resize
    and orientation change.

- [x] **3.4 Accessibility and brand-asset pass**
  - A generated favicon (accent-colored monogram, not the default globe) is present, and the
    mute button and other icon-only controls have `aria-label`s.
  - Shelf token/overflow status updates are announced via an `aria-live` region for
    screen-reader users.
