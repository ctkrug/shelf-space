const MIN_DISTANCE = 3.8;
const MAX_DISTANCE = 8.5;
const MIN_POLAR = 0.8;
const MAX_POLAR = 1.65;

export function clampOrbitState({ azimuth, polar, distance }) {
  return {
    azimuth,
    polar: Math.min(MAX_POLAR, Math.max(MIN_POLAR, polar)),
    distance: Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, distance)),
  };
}

/** Adds lightweight mouse/touch orbiting without intercepting UI overlay events. */
export function createOrbitController(element, camera, target) {
  let state = { azimuth: 0, polar: 1.28, distance: camera.position.distanceTo(target) };
  let pointer = null;

  function apply() {
    state = clampOrbitState(state);
    const sinPolar = Math.sin(state.polar);
    camera.position.set(
      target.x + state.distance * sinPolar * Math.sin(state.azimuth),
      target.y + state.distance * Math.cos(state.polar),
      target.z + state.distance * sinPolar * Math.cos(state.azimuth),
    );
    camera.lookAt(target);
  }

  function onPointerDown(event) {
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    element.setPointerCapture?.(event.pointerId);
  }
  function onPointerMove(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    state.azimuth -= (event.clientX - pointer.x) * 0.008;
    state.polar += (event.clientY - pointer.y) * 0.008;
    pointer = { ...pointer, x: event.clientX, y: event.clientY };
    apply();
  }
  function onPointerUp(event) {
    if (pointer?.id === event.pointerId) pointer = null;
  }
  function onWheel(event) {
    event.preventDefault();
    state.distance += event.deltaY * 0.006;
    apply();
  }

  element.addEventListener("pointerdown", onPointerDown);
  element.addEventListener("pointermove", onPointerMove);
  element.addEventListener("pointerup", onPointerUp);
  element.addEventListener("pointercancel", onPointerUp);
  element.addEventListener("wheel", onWheel, { passive: false });
  apply();

  return { apply, dispose: () => {
    element.removeEventListener("pointerdown", onPointerDown);
    element.removeEventListener("pointermove", onPointerMove);
    element.removeEventListener("pointerup", onPointerUp);
    element.removeEventListener("pointercancel", onPointerUp);
    element.removeEventListener("wheel", onWheel);
  } };
}
