# Vision

## The problem

Context-window comparisons are a table of numbers: "128K vs. 1M vs. 2M tokens." Nobody feels the
difference between those numbers — they're too abstract, and every vendor's marketing page
renders them the same way (a bar chart, or worse, a bullet list). Meanwhile new frontier models
ship with wildly different context budgets almost every week, and the comparison goes stale
before anyone internalizes it.

## Who it's for

Anyone who's ever wondered "could I just paste my whole codebase / book / doc set into this
model," and developers deciding which model's context window actually fits their use case,
without doing the division themselves. Also just a fun, shareable toy — the kind of thing that
gets dropped in a Slack channel because watching books avalanche off a shelf is satisfying in a
way a chart never is.

## The core idea

Turn "tokens" into "books" and "context window" into "shelf space." Paste any text — an essay, a
whole novel, a flattened repo — and the app estimates its token count per model, chunks that
count into literal book meshes, and stacks them onto that model's shelf. If the shelf runs out
of room, the excess books spill onto the floor in front of it. The metaphor does all the
explaining: you don't need to read "213,904 tokens vs. a 150,000 token limit" to understand that
Claude's shelf just overflowed — you watch books tumble onto the floor.

## Key design decisions

- **Physical metaphor over data visualization.** No bar charts, no gauges. A shelf is either
  full or it isn't, and overflow is rendered as literal spillage, not a red number. This is the
  entire reason the project exists over "just show a table."
- **Token math lives in plain, tested modules, decoupled from rendering.** `src/core/` (tokenizer
  estimate, shelf occupancy) has zero Three.js dependency and is fully unit-tested; `src/render/`
  consumes that data to build meshes. This keeps the "is the math right" question answerable
  without a browser, and keeps the rendering code free to get as fancy as it wants.
- **Four shelves, one config module.** `src/core/models.js` is the single source of truth for
  which models exist, their context windows, and their tokenizer ratios. Swapping in next week's
  new model (the whole point of "this week's brand-new Kimi K3") is a data edit, not a rewrite.
- **Approximate tokenizer math, honestly presented.** Real per-vendor tokenizers are proprietary
  and not all shippable client-side. Shelf Space uses a blended char/word estimate per model
  (see `docs/BACKLOG.md` for the tuning story) and is upfront in the UI that counts are estimates
  — the metaphor doesn't need forensic accuracy, it needs to be roughly right and consistently
  applied.
- **Static, self-contained, servable from a subpath.** No backend. The whole app is a Vite build
  that runs entirely in the browser, so it can be dropped at `apps.charliekrug.com/shelf-space`
  with relative asset paths and nothing to deploy but static files.

## What "v1 done" looks like

- Paste a block of text (or drop a `.txt`/repo export) and see it turn into stacked book meshes
  on all four shelves within a second or two, no page reload.
- Overflow visibly spills books onto the floor in front of the shelf that ran out of room.
- The wow moment works end to end: pasting the full text of *War and Peace* piles books high on
  the GPT-5.6 shelf, spills onto the floor for Claude and Gemini, and barely dents Kimi K3.
- The scene is orbitable, responsive from phone to desktop width, and matches the direction and
  tokens in `docs/DESIGN.md` — not just functional, but something someone would screenshot.
- `npm test` and `npm run build` are green in CI on every push.
