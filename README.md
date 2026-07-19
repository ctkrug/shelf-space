# Shelf Space

Paste any text — a paragraph, a book, a whole repo's worth of source files — and watch it get
sawn into "books" and physically stacked onto shelves. Each shelf is labeled with a current
frontier model (**GPT-5.6**, **Claude**, **Gemini**, and this week's brand-new **Kimi K3**) and
sized to that model's real context window. Paste in *War and Peace* and watch it pile onto the
GPT-5.6 shelf, spill onto the floor for the smaller-context models, and barely dent Kimi K3's.

No bar charts. No spreadsheets. A shelf either has room or it doesn't, and you can *see* it.

## Why

Context-window comparisons are usually a table of numbers nobody feels. Shelf Space turns token
counts into a physical metaphor everyone already understands — shelf space — so the difference
between a 128K-token model and a 2M-token model is something you watch happen, not something you
read.

## How it works

1. You paste or drop in text (or point it at a public repo — flattened file-by-file).
2. Real tokenizer math estimates the token count per model (each frontier model tokenizes
   differently, so the same text produces a different book count on every shelf).
3. Each shelf's capacity is that model's published context window. Books render as literal 3D
   book meshes and stack left-to-right, spine-out, shelf by shelf.
4. Once a shelf is full, overflow books spill onto the floor in front of it — a visceral "this
   didn't fit" moment with no reading of numbers required.

## Features

- Paste-box input, tokenized live as you type (debounced), stacking books onto all four shelves
  within about a second.
- Four shelves: GPT-5.6, Claude, Gemini, Kimi K3 — capacities and tokenizer approximations kept
  in one config module so new models are a data change, not a code change.
- Books ease into their resting slot, spill onto the floor once a shelf's capacity is exceeded,
  and each shelf's live token count and book fill are always visible in the readout.
- A hanging banker's lamp whose glow and shadow reach respond to overall shelf occupancy, with a
  synth thunk/clatter (mute persisted) on placement and overflow.

## Planned

- File/repo drop input (`.txt`, flattened public GitHub repos).
- Camera orbit around the bookcase; click a book to see which chunk of source text it represents.
- Shareable state via URL so a paste + its shelf outcome can be linked to someone else.

## Stack

- [Three.js](https://threejs.org/) for the 3D bookcase/book rendering.
- [Vite](https://vitejs.dev/) for dev server + static production build.
- Vanilla JS (no framework) — the whole app is a rendering pipeline over a small state module,
  which doesn't need React/Vue overhead.
- [Vitest](https://vitest.dev/) for the tokenizer-math and stacking-logic unit tests.

## Getting started

```bash
npm install
npm run dev      # local dev server with hot reload
npm test         # run the test suite
npm run build    # production build to dist/
```

## Status

The core wow moment is built and working: paste text, watch it stack. See
[`docs/VISION.md`](docs/VISION.md) for the full design, [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
for how the code is organized, and [`docs/BACKLOG.md`](docs/BACKLOG.md) for what's done vs. planned.
