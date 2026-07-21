# I turned LLM context windows into a Three.js bookshelf

Context window tables are precise and strangely hard to feel. I can read that one model accepts
1,000,000 tokens and another accepts 1,050,000, but those numbers do not immediately tell me how a
repository or long document sits inside either limit. I wanted a comparison that used the source I
actually cared about and made capacity visible without another bar chart.

I built [Shelf Space](https://apps.charliekrug.com/shelf-space/) around one rule: every 2,000
estimated tokens becomes a book. Paste text, drop a text file, or enter a public GitHub repository
URL, and the same source stacks across shelves for GPT-5.6 Sol, Claude Fable 5, Gemini 3.5 Flash,
and Kimi K3. A source that exceeds a published context window leaves books on the floor.

## Keeping the math outside Three.js

The most useful architecture decision was separating occupancy from rendering. The core module
estimates tokens, converts them into books, and returns plain data:

```js
{
  tokens,
  booksOnShelf,
  booksOnFloor,
  fillRatio,
  overflowing
}
```

That module knows nothing about WebGL. Tests can exercise empty input, overflow boundaries, model
capacities, Unicode URL state, and invalid files in Node. The render layer only consumes the state
and places meshes. This made the 3D code smaller and gave the capacity metaphor one source of
truth.

The app currently has separate character and word ratios for each model. Those are estimates, not
vendor billing counts. Exact tokenization would require larger tokenizer assets or remote calls,
both of which work against a fast static page that keeps pasted text in the browser. I chose to be
explicit about that trade instead of presenting an approximation as exact.

## Rendering hundreds of books

Creating a mesh per book worked for a prototype, but it was the wrong shape for shelves with about
500 slots each. The final renderer uses one `THREE.InstancedMesh` for shelf books and another for
floor spill in every bay. Shared geometry and material keep draw calls bounded while per-instance
matrices and colors preserve the physical stack.

One Three.js detail cost more time than expected. An instanced mesh starts with a count of zero.
After the first culling pass, its cached bounding sphere can describe that empty state, so later
instances never appear. Disabling frustum culling for these bounded shelf meshes fixed the silent
failure. It is documented beside the line because deleting it looks like an obvious cleanup.

Responsive framing needed geometry rather than CSS alone. A fixed vertical field of view loses the
outer bays on a portrait screen. The camera now widens its field of view up to a restrained cap,
then increases distance only when necessary. Resize handling preserves the user's orbit angle and
updates the renderer at device-pixel-ratio resolution.

## What I would change next

If I extended the project, I would add optional tokenizer packages loaded on demand for people who
need closer counts and can accept the download. I would also version the model roster separately
from the application so capacity changes could carry a date and source in a small data release.
The current source file is simple, but model limits move quickly enough to deserve a maintenance
path.

The finished project is live at
[apps.charliekrug.com/shelf-space](https://apps.charliekrug.com/shelf-space/), and the complete
source is on [GitHub](https://github.com/ctkrug/shelf-space). I would especially like feedback on
whether the physical scale helps you judge a real repository faster than a table does.
