import * as THREE from "three";
import { THEME } from "./theme.js";
import { createBookcase } from "./bookcase.js";
import { createLamp } from "./lamp.js";
import { createBookRenderers } from "./books.js";
import { TOTAL_WIDTH } from "./layout3d.js";
import { createOrbitController } from "./orbit.js";

const BASE_VFOV_DEG = 42;
const MAX_VFOV_DEG = 56;
const DESKTOP_DISTANCE = 4.7;
const FOG_NEAR = 4;
const LOOK_AT = new THREE.Vector3(0, 1.15, 0);
const HALF_WIDTH_WITH_MARGIN = TOTAL_WIDTH / 2 + 0.5;
// The horizontal half-angle the desktop framing already provides -
// narrower aspects (phones) need to reproduce this same coverage.
const TARGET_HALF_H_ANGLE_RAD = Math.atan(HALF_WIDTH_WITH_MARGIN / DESKTOP_DISTANCE);

/**
 * At any aspect ratio, first try widening the vertical FOV (capped, so it
 * never turns fisheye) to keep all four bays in frame; only if that's not
 * enough does the camera move back, with fog pushed out to match. This is
 * what lets a portrait phone viewport show the same shelf width the
 * desktop framing does, per DESIGN.md's "camera angle flattens slightly"
 * phone layout intent.
 */
function framingFor(aspect) {
  const neededVFovRad = 2 * Math.atan(Math.tan(TARGET_HALF_H_ANGLE_RAD) / aspect);
  const vFovDeg = Math.min(MAX_VFOV_DEG, Math.max(BASE_VFOV_DEG, (neededVFovRad * 180) / Math.PI));
  const vFovRad = (vFovDeg * Math.PI) / 180;
  const distance = Math.max(
    DESKTOP_DISTANCE,
    HALF_WIDTH_WITH_MARGIN / (Math.tan(vFovRad / 2) * aspect),
  );
  return { vFovDeg, distance };
}

/**
 * Builds the reading-room scene: camera, ambient lighting, resize
 * handling, the static walnut bookcase, the signature hanging lamp, and
 * the book piles/floor spill for all four bays. Callers drive content
 * by calling the returned `books.update(shelfStatesByModelId)`.
 */
export function createScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(THEME.bg);
  scene.fog = new THREE.Fog(THEME.bg, FOG_NEAR, 11);

  const camera = new THREE.PerspectiveCamera(
    BASE_VFOV_DEG,
    container.clientWidth / container.clientHeight,
    0.1,
    100,
  );
  camera.position.set(0, 1.55, DESKTOP_DISTANCE);
  camera.lookAt(LOOK_AT);

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

  const books = createBookRenderers(bookcase.bays);
  scene.add(books.group);
  const orbit = createOrbitController(renderer.domElement, camera, LOOK_AT);

  function resize() {
    const aspect = container.clientWidth / container.clientHeight;
    const { vFovDeg, distance } = framingFor(aspect);
    camera.aspect = aspect;
    camera.fov = vFovDeg;
    camera.position.z = distance;
    camera.lookAt(LOOK_AT);
    camera.updateProjectionMatrix();
    scene.fog.far = Math.max(11, distance + 6);
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  resize();

  function tick(deltaSeconds, occupancy) {
    lamp.update(deltaSeconds, occupancy);
    books.animate(deltaSeconds);
    renderer.render(scene, camera);
  }

  return { scene, camera, resize, tick, bookcase, lamp, books, orbit };
}
