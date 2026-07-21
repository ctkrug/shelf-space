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
export function framingFor(aspect) {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 16 / 9;
  const neededVFovRad = 2 * Math.atan(Math.tan(TARGET_HALF_H_ANGLE_RAD) / safeAspect);
  const vFovDeg = Math.min(MAX_VFOV_DEG, Math.max(BASE_VFOV_DEG, (neededVFovRad * 180) / Math.PI));
  const vFovRad = (vFovDeg * Math.PI) / 180;
  const distance = Math.max(
    DESKTOP_DISTANCE,
    HALF_WIDTH_WITH_MARGIN / (Math.tan(vFovRad / 2) * safeAspect),
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
  function viewportSize() {
    return {
      width: Math.max(1, container.clientWidth),
      height: Math.max(1, container.clientHeight),
    };
  }

  const initialSize = viewportSize();
  const scene = new THREE.Scene();
  scene.background = null;
  scene.fog = new THREE.Fog(THEME.bg, FOG_NEAR, 11);

  const camera = new THREE.PerspectiveCamera(
    BASE_VFOV_DEG,
    initialSize.width / initialSize.height,
    0.1,
    100,
  );
  camera.position.set(0, 1.55, DESKTOP_DISTANCE);
  camera.lookAt(LOOK_AT);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(THEME.bg, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(initialSize.width, initialSize.height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0x7a5a3a, 1.05);
  const fill = new THREE.DirectionalLight(0xd0a574, 0.65);
  fill.position.set(-3, 3, 4);
  scene.add(ambient, fill);

  const bookcase = createBookcase();
  scene.add(bookcase.group);

  const lamp = createLamp(bookcase.caseTopY);
  scene.add(lamp.group);

  const books = createBookRenderers(bookcase.bays);
  scene.add(books.group);
  const orbit = createOrbitController(renderer.domElement, camera, LOOK_AT);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function resize() {
    const { width, height } = viewportSize();
    const aspect = width / height;
    const { vFovDeg, distance } = framingFor(aspect);
    camera.aspect = aspect;
    camera.fov = vFovDeg;
    orbit.setFramingDistance(distance);
    camera.updateProjectionMatrix();
    scene.fog.far = Math.max(11, distance + 6);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
  }

  resize();

  function tick(deltaSeconds, occupancy) {
    lamp.update(deltaSeconds, occupancy);
    books.animate(deltaSeconds);
    renderer.render(scene, camera);
  }

  function pickBookAt(clientX, clientY) {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    return books.pick(raycaster);
  }

  return {
    scene, camera, canvas: renderer.domElement, resize, tick, pickBookAt, bookcase, lamp, books, orbit,
  };
}
