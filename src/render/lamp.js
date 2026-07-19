import * as THREE from "three";
import { THEME } from "./theme.js";

const BASE_INTENSITY = 1.4;
const MAX_INTENSITY = 3.2;
const BASE_HEIGHT = 2.55;
const MIN_HEIGHT = 2.05; // lower light -> longer, higher-contrast shadows as shelves fill
const FLARE_INTENSITY = 5.5;
const FLARE_DURATION_S = 0.5;

/**
 * The hanging banker's lamp — the signature detail from docs/DESIGN.md.
 * Its glow and shadow-casting height respond to overall shelf
 * occupancy, with a brief warm flare the instant any shelf first
 * overflows.
 */
export function createLamp(caseTopY) {
  const group = new THREE.Group();

  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.9, 8),
    new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.8 }),
  );
  cord.position.set(0, caseTopY + 0.85, 0.1);
  group.add(cord);

  const shadeMaterial = new THREE.MeshStandardMaterial({
    color: THEME.accent,
    emissive: new THREE.Color(THEME.accent),
    emissiveIntensity: 0.4,
    metalness: 0.6,
    roughness: 0.35,
  });
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.22, 24, 1, true), shadeMaterial);
  shade.position.set(0, caseTopY + 0.4, 0.1);
  group.add(shade);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffe6b8 }),
  );
  bulb.position.set(0, caseTopY + 0.32, 0.1);
  group.add(bulb);

  const light = new THREE.PointLight(THEME.accent, BASE_INTENSITY, 9, 2);
  light.position.set(0, BASE_HEIGHT, 0.15);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  group.add(light);

  let flareRemaining = 0;
  let wasOverflowing = false;

  function update(deltaSeconds, { avgFillRatio, anyOverflowing }) {
    const clamped = Math.max(0, Math.min(1, avgFillRatio));

    if (anyOverflowing && !wasOverflowing) {
      flareRemaining = FLARE_DURATION_S;
    }
    wasOverflowing = anyOverflowing;

    if (flareRemaining > 0) {
      flareRemaining = Math.max(0, flareRemaining - deltaSeconds);
      const flareT = flareRemaining / FLARE_DURATION_S;
      light.intensity = FLARE_INTENSITY * flareT + BASE_INTENSITY * (1 - flareT);
    } else {
      light.intensity = BASE_INTENSITY + clamped * (MAX_INTENSITY - BASE_INTENSITY);
    }

    light.position.y = BASE_HEIGHT - clamped * (BASE_HEIGHT - MIN_HEIGHT);
    shadeMaterial.emissiveIntensity = 0.4 + clamped * 0.6;
  }

  return { group, light, update };
}
