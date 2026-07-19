import * as THREE from "three";
import { THEME } from "./theme.js";
import { createBookcase } from "./bookcase.js";
import { createLamp } from "./lamp.js";

/**
 * Builds the reading-room scene: camera, ambient lighting, resize
 * handling, the static walnut bookcase, and the signature hanging lamp.
 * Dynamic content (books) is added by callers against the bay layout
 * this returns.
 */
export function createScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(THEME.bg);
  scene.fog = new THREE.Fog(THEME.bg, 4, 11);

  const camera = new THREE.PerspectiveCamera(
    42,
    container.clientWidth / container.clientHeight,
    0.1,
    100,
  );
  camera.position.set(0, 1.55, 4.7);
  camera.lookAt(0, 1.15, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0x3a2c1e, 0.7);
  const fill = new THREE.DirectionalLight(0x8a6a4a, 0.35);
  fill.position.set(-3, 3, 4);
  scene.add(ambient, fill);

  const bookcase = createBookcase();
  scene.add(bookcase.group);

  const lamp = createLamp(bookcase.caseTopY);
  scene.add(lamp.group);

  function resize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function tick(deltaSeconds, occupancy) {
    lamp.update(deltaSeconds, occupancy);
    renderer.render(scene, camera);
  }

  return { scene, camera, resize, tick, bookcase, lamp };
}
