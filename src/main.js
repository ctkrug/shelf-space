import { createScene } from "./render/scene.js";

const container = document.getElementById("app");
const { resize, tick } = createScene(container);

window.addEventListener("resize", resize);

// Mutated in place by the paste-panel input handler once it's wired up.
const occupancy = { avgFillRatio: 0, anyOverflowing: false };

let lastTime = performance.now();
function loop(now) {
  const deltaSeconds = (now - lastTime) / 1000;
  lastTime = now;
  tick(deltaSeconds, occupancy);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
