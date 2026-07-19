import * as THREE from "three";
import { gridPositions, gridRowCount } from "../core/layout.js";
import { shelfCapacityBooksFor } from "../core/shelf.js";
import { bookColorFor } from "./theme.js";
import { BOOK_COLUMNS, FLOOR_STACK_LAYERS } from "./layout3d.js";

const BOOK_GUTTER = 0.015;
const FLOOR_COLUMNS = BOOK_COLUMNS;
// Rendering-only safety cap: core shelf math is the source of truth for real
// counts, but an absurdly large paste shouldn't ask the GPU for millions of
// instances. Well past anything a real book/repo produces on Kimi's shelf.
const MAX_RENDERED_FLOOR_BOOKS = 6000;

const dummy = new THREE.Object3D();

function applyInstance(mesh, index, position, scale, color) {
  dummy.position.copy(position);
  dummy.scale.copy(scale);
  dummy.rotation.set(0, 0, 0);
  dummy.updateMatrix();
  mesh.setMatrixAt(index, dummy.matrix);
  mesh.setColorAt(index, color);
}

/**
 * One model's dynamic content: an InstancedMesh pile on its shelf and a
 * second InstancedMesh for books that spilled onto the floor. Geometry
 * and instance counts are derived from core/shelf + core/layout so the
 * render layer never re-derives occupancy math.
 */
function createBayBooks(model, layout) {
  const shelfCapacity = shelfCapacityBooksFor(model);
  const shelfRows = gridRowCount(shelfCapacity, BOOK_COLUMNS);
  const bookHeight = layout.maxPileHeight / shelfRows;
  const bookWidth = layout.width / BOOK_COLUMNS - BOOK_GUTTER;
  const bookDepth = layout.depth - 0.04;

  const bookGeometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.05 });

  const shelfMesh = new THREE.InstancedMesh(bookGeometry, material, shelfCapacity);
  shelfMesh.castShadow = true;
  shelfMesh.receiveShadow = true;
  shelfMesh.count = 0;

  const floorCapacity = Math.min(MAX_RENDERED_FLOOR_BOOKS, Math.max(1, shelfCapacity * 4));
  const floorMesh = new THREE.InstancedMesh(bookGeometry, material.clone(), floorCapacity);
  floorMesh.castShadow = true;
  floorMesh.receiveShadow = true;
  floorMesh.count = 0;

  function setShelfCount(count) {
    const rendered = Math.min(count, shelfCapacity);
    const positions = gridPositions(rendered, BOOK_COLUMNS);
    const shelfLeft = layout.centerX - layout.width / 2 + bookWidth / 2 + BOOK_GUTTER / 2;

    positions.forEach((pos, i) => {
      const x = shelfLeft + pos.col * (bookWidth + BOOK_GUTTER);
      const y = layout.shelfY + pos.row * bookHeight + bookHeight / 2;
      const z = 0;
      applyInstance(
        shelfMesh,
        i,
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(bookWidth, bookHeight, bookDepth),
        new THREE.Color(bookColorFor(i)),
      );
    });

    shelfMesh.count = rendered;
    shelfMesh.instanceMatrix.needsUpdate = true;
    if (shelfMesh.instanceColor) shelfMesh.instanceColor.needsUpdate = true;
  }

  function setFloorCount(count) {
    const rendered = Math.min(count, floorCapacity);
    const positions = gridPositions(rendered, FLOOR_COLUMNS);
    const floorLeft = layout.centerX - layout.width / 2 + bookWidth / 2 + BOOK_GUTTER / 2;
    const floorBookHeight = bookDepth * 0.55;

    positions.forEach((pos, i) => {
      const depthStep = Math.floor(pos.row / FLOOR_STACK_LAYERS);
      const stackLayer = pos.row % FLOOR_STACK_LAYERS;
      const x = floorLeft + pos.col * (bookWidth + BOOK_GUTTER);
      const y = floorBookHeight / 2 + stackLayer * (floorBookHeight + 0.01);
      const z = layout.floorZ + 0.08 + depthStep * (bookDepth + 0.03);
      applyInstance(
        floorMesh,
        i,
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(bookWidth, floorBookHeight, bookDepth),
        new THREE.Color(bookColorFor(i + 3)),
      );
    });

    floorMesh.count = rendered;
    floorMesh.instanceMatrix.needsUpdate = true;
    if (floorMesh.instanceColor) floorMesh.instanceColor.needsUpdate = true;
  }

  const group = new THREE.Group();
  group.add(shelfMesh, floorMesh);

  function update(shelfState) {
    setShelfCount(shelfState.booksOnShelf);
    setFloorCount(shelfState.booksOnFloor);
  }

  return { group, update };
}

/** Builds book renderers for every bay and returns a single update(states) entry point. */
export function createBookRenderers(bays) {
  const perBay = bays.map(({ model, layout }) => ({
    modelId: model.id,
    ...createBayBooks(model, layout),
  }));

  const group = new THREE.Group();
  perBay.forEach((bay) => group.add(bay.group));

  function update(shelfStatesByModelId) {
    for (const bay of perBay) {
      const state = shelfStatesByModelId[bay.modelId];
      if (state) bay.update(state);
    }
  }

  return { group, update };
}
