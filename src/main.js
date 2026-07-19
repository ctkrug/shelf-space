import { createScene } from "./render/scene.js";

const container = document.getElementById("app");
const { resize, tick } = createScene(container);

window.addEventListener("resize", resize);

const clock = { start: performance.now() };
function loop(now) {
  tick((now - clock.start) / 1000);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
