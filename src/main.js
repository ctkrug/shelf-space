import { createScene } from "./render/scene.js";
import { initPastePanel } from "./ui/panel.js";
import { createAudioController } from "./audio/sfx.js";
import { computeAllShelfStates } from "./core/shelf.js";
import { MODELS } from "./core/models.js";

const container = document.getElementById("app");
const { resize, tick, books } = createScene(container);

window.addEventListener("resize", resize);

const audio = createAudioController();
const muteToggle = document.getElementById("mute-toggle");
muteToggle.setAttribute("aria-pressed", String(audio.isMuted()));
muteToggle.addEventListener("click", () => {
  const muted = audio.toggleMuted();
  muteToggle.setAttribute("aria-pressed", String(muted));
});

let previousStates = computeAllShelfStates("", MODELS);

// Mutated in place each frame so the lamp's reactive glow reads the
// latest occupancy without re-allocating on every paste.
const occupancy = { avgFillRatio: 0, anyOverflowing: false };

function applyStates(states) {
  const totalBooksBefore = Object.values(previousStates).reduce((sum, s) => sum + s.totalBooks, 0);
  const totalBooksAfter = Object.values(states).reduce((sum, s) => sum + s.totalBooks, 0);
  const newlyOverflowing = MODELS.some(
    (m) => states[m.id].overflowing && !previousStates[m.id].overflowing,
  );

  if (totalBooksAfter > totalBooksBefore) audio.playThunk();
  if (newlyOverflowing) audio.playClatter();

  books.update(states);
  readout.renderReadout(states, MODELS);

  occupancy.avgFillRatio = MODELS.reduce((sum, m) => sum + states[m.id].fillRatio, 0) / MODELS.length;
  occupancy.anyOverflowing = MODELS.some((m) => states[m.id].overflowing);

  previousStates = states;
}

const readout = initPastePanel({
  onInput: (text) => applyStates(computeAllShelfStates(text, MODELS)),
});

applyStates(previousStates);

let lastTime = performance.now();
function loop(now) {
  const deltaSeconds = (now - lastTime) / 1000;
  lastTime = now;
  tick(deltaSeconds, occupancy);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
