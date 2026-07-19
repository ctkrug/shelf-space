import * as THREE from "three";
import { MODELS } from "../core/models.js";
import { THEME } from "./theme.js";
import {
  BAY_DEPTH,
  DIVIDER_WIDTH,
  END_PANEL_WIDTH,
  FLOOR_Y,
  MAX_PILE_HEIGHT,
  SHELF_THICKNESS,
  SHELF_Y,
  TOTAL_WIDTH,
  bayLayout,
} from "./layout3d.js";

const CASE_TOP_Y = SHELF_Y + MAX_PILE_HEIGHT + 0.2;
const CASE_HEIGHT = CASE_TOP_Y - FLOOR_Y;
const FLOOR_DEPTH = BAY_DEPTH + 2.6;
const FLOOR_WIDTH = TOTAL_WIDTH + 1.4;

function labelTexture(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#00000000";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f3e6d0";
  ctx.font = "600 64px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Builds the static walnut bookcase: back/end panels, bay dividers, one
 * continuous shelf board per bay, a floor for overflow, and an engraved
 * nameplate per model. Returns the group plus per-bay layout so books.js
 * and the lamp can position dynamic content against the same structure.
 */
export function createBookcase() {
  const group = new THREE.Group();

  const woodMaterial = new THREE.MeshStandardMaterial({
    color: THEME.surface1,
    roughness: 0.75,
    metalness: 0.05,
  });
  const shelfMaterial = new THREE.MeshStandardMaterial({
    color: THEME.surface2,
    roughness: 0.65,
    metalness: 0.08,
  });
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: THEME.bg,
    roughness: 0.9,
    metalness: 0.02,
  });

  const backPanel = new THREE.Mesh(
    new THREE.BoxGeometry(TOTAL_WIDTH, CASE_HEIGHT, 0.06),
    woodMaterial,
  );
  backPanel.position.set(0, FLOOR_Y + CASE_HEIGHT / 2, -BAY_DEPTH / 2 - 0.03);
  backPanel.receiveShadow = true;
  group.add(backPanel);

  const endGeometry = new THREE.BoxGeometry(END_PANEL_WIDTH, CASE_HEIGHT, BAY_DEPTH);
  const leftEnd = new THREE.Mesh(endGeometry, woodMaterial);
  leftEnd.position.set(-TOTAL_WIDTH / 2 + END_PANEL_WIDTH / 2, FLOOR_Y + CASE_HEIGHT / 2, 0);
  const rightEnd = new THREE.Mesh(endGeometry, woodMaterial);
  rightEnd.position.set(TOTAL_WIDTH / 2 - END_PANEL_WIDTH / 2, FLOOR_Y + CASE_HEIGHT / 2, 0);
  group.add(leftEnd, rightEnd);

  const dividerGeometry = new THREE.BoxGeometry(DIVIDER_WIDTH, CASE_HEIGHT, BAY_DEPTH);
  for (let i = 1; i < MODELS.length; i += 1) {
    const prevBay = bayLayout(i - 1);
    const nextBay = bayLayout(i);
    const x = (prevBay.centerX + prevBay.width / 2 + (nextBay.centerX - nextBay.width / 2)) / 2;
    const divider = new THREE.Mesh(dividerGeometry, woodMaterial);
    divider.position.set(x, FLOOR_Y + CASE_HEIGHT / 2, 0);
    group.add(divider);
  }

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(FLOOR_WIDTH, FLOOR_DEPTH), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, FLOOR_Y, BAY_DEPTH / 2 + FLOOR_DEPTH / 2 - 0.02);
  floor.receiveShadow = true;
  group.add(floor);

  const bays = MODELS.map((model, index) => {
    const layout = bayLayout(index);

    const shelfBoard = new THREE.Mesh(
      new THREE.BoxGeometry(layout.width - 0.02, SHELF_THICKNESS, BAY_DEPTH),
      shelfMaterial,
    );
    shelfBoard.position.set(layout.centerX, SHELF_Y - SHELF_THICKNESS / 2, 0);
    shelfBoard.receiveShadow = true;
    group.add(shelfBoard);

    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(layout.width * 0.82, 0.16),
      new THREE.MeshBasicMaterial({ map: labelTexture(model.label), transparent: true }),
    );
    label.position.set(layout.centerX, SHELF_Y + 0.12, BAY_DEPTH / 2 - 0.01);
    group.add(label);

    return { model, layout };
  });

  return { group, bays, caseHeight: CASE_HEIGHT, caseTopY: CASE_TOP_Y };
}
