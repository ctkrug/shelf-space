import * as THREE from "three";

/**
 * Minimal scaffold scene: proves the render pipeline (camera, lights,
 * resize handling, animation loop) works end to end. The real bookcase
 * and book meshes replace the placeholder cube during BUILD.
 */
export function createScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x14110f);

  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    100,
  );
  camera.position.set(2.5, 2, 3.5);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  const key = new THREE.DirectionalLight(0xffd8a8, 1.2);
  key.position.set(3, 4, 2);
  scene.add(ambient, key);

  const placeholder = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.9, 0.15),
    new THREE.MeshStandardMaterial({ color: 0xb5482a }),
  );
  scene.add(placeholder);

  function resize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function tick(elapsedSeconds) {
    placeholder.rotation.y = elapsedSeconds * 0.6;
    renderer.render(scene, camera);
  }

  return { resize, tick };
}
