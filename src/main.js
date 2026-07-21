import { createScene } from "./render/scene.js";
import { initPastePanel } from "./ui/panel.js";
import { createAudioController } from "./audio/sfx.js";
import { computeAllShelfStates } from "./core/shelf.js";
import { MODELS } from "./core/models.js";
import { sourceForBookHit } from "./core/book-source.js";
import { sharedTextFromUrl, urlWithShareState } from "./core/share-state.js";

const container = document.getElementById("app");
const { resize, tick, books, canvas, pickBookAt } = createScene(container);

window.addEventListener("resize", resize);

const audio = createAudioController();
window.addEventListener("pointerdown", audio.prime, { once: true, capture: true });
window.addEventListener("keydown", audio.prime, { once: true, capture: true });
const muteToggle = document.getElementById("mute-toggle");
muteToggle.setAttribute("aria-pressed", String(audio.isMuted()));
muteToggle.addEventListener("click", () => {
  const muted = audio.toggleMuted();
  muteToggle.setAttribute("aria-pressed", String(muted));
  muteToggle.setAttribute("aria-label", muted ? "Unmute shelf sounds" : "Mute shelf sounds");
});

let previousStates = computeAllShelfStates("", MODELS);
let sourceText = "";
let tapStart = null;

// Mutated in place each frame so the lamp's reactive glow reads the
// latest occupancy without re-allocating on every paste.
const occupancy = { avgFillRatio: 0, anyOverflowing: false };

function applyStates(states) {
  const totalBooksBefore = Object.values(previousStates).reduce((sum, s) => sum + s.totalBooks, 0);
  const totalBooksAfter = Object.values(states).reduce((sum, s) => sum + s.totalBooks, 0);
  const newlyOverflowing = MODELS.some(
    (m) => states[m.id].overflowing && !previousStates[m.id].overflowing,
  );
  const newlyFull = MODELS.some(
    (m) => states[m.id].fillRatio === 1 && previousStates[m.id].fillRatio < 1,
  );

  if (totalBooksAfter > totalBooksBefore) audio.playThunk();
  if (newlyFull) audio.playChime();
  if (newlyOverflowing) audio.playClatter();

  books.update(states);
  readout.renderReadout(states, MODELS);

  occupancy.avgFillRatio = MODELS.reduce((sum, m) => sum + states[m.id].fillRatio, 0) / MODELS.length;
  occupancy.anyOverflowing = MODELS.some((m) => states[m.id].overflowing);

  previousStates = states;
}

function closeBookInspector() {
  books.clearSelection();
  readout.renderInspector(null);
}

function updateShareUrl(text) {
  const url = urlWithShareState(window.location.href, text);
  if (!url) {
    window.history.replaceState(null, "", urlWithShareState(window.location.href, ""));
    readout.showInputMessage("Stacked locally; this input is too long to share by URL.");
    return;
  }
  window.history.replaceState(null, "", url);
}

const readout = initPastePanel({
  onInput: (text) => {
    if (text !== sourceText) audio.playRustle();
    sourceText = text;
    closeBookInspector();
    applyStates(computeAllShelfStates(text, MODELS));
    updateShareUrl(text);
  },
  onCloseInspector: closeBookInspector,
});

canvas.addEventListener("pointerdown", (event) => {
  tapStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
});
canvas.addEventListener("pointerup", (event) => {
  if (!tapStart || tapStart.id !== event.pointerId) return;
  const moved = Math.hypot(event.clientX - tapStart.x, event.clientY - tapStart.y);
  tapStart = null;
  if (moved > 8) return;

  const hit = pickBookAt(event.clientX, event.clientY);
  const source = sourceForBookHit(sourceText, hit, MODELS);
  if (!source) {
    closeBookInspector();
    return;
  }
  books.select(hit);
  readout.renderInspector(source);
});
canvas.addEventListener("pointercancel", () => { tapStart = null; });
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeBookInspector();
});

const sharedText = sharedTextFromUrl(window.location.href);
if (sharedText !== null) readout.setText(sharedText);
else applyStates(previousStates);

window.addEventListener("popstate", () => {
  const text = sharedTextFromUrl(window.location.href) ?? "";
  if (text !== sourceText) readout.setText(text);
});

let lastTime = performance.now();
function loop(now) {
  const deltaSeconds = (now - lastTime) / 1000;
  lastTime = now;
  tick(deltaSeconds, occupancy);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
