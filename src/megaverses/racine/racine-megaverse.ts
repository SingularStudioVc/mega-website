// Entry point for the new, compact, modular Racine Megaverse
// All legacy code removed. New modules will be imported and integrated here.

// TODO: Import and integrate new modules as they are created.

import * as THREE from 'three';
import { createFarmEnvironment } from './objects/farm-environment';
import { createPlantRack } from './objects/plant-rack';
import { createRobot } from './objects/robot';
import { createUVLight } from './objects/uv-light';
import { createWaterSystem } from './objects/water-system';
import { createPestManager } from './objects/pest-manager';
import { setupCameraControls } from './objects/camera-controls';

let racine3DActive = false;
let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let threeContainer: HTMLElement | null = null;

export function showRacineMegaverse() {
  if (racine3DActive) return;
  racine3DActive = true;

  // Container
  threeContainer = document.createElement('div');
  threeContainer.style.position = 'fixed';
  threeContainer.style.top = '0';
  threeContainer.style.left = '0';
  threeContainer.style.width = '100vw';
  threeContainer.style.height = '100vh';
  threeContainer.style.zIndex = '1000';
  threeContainer.style.background = '#000';
  document.body.appendChild(threeContainer);
  document.body.style.overflow = 'hidden';

  // Scene and camera
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x10131a);
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  // Place camera inside the box, slightly above ground, looking at center
  camera.position.set(0, 3, 8);
  camera.lookAt(0, 3, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);
  threeContainer.appendChild(renderer.domElement);

  // Environment
  const { width, depth, height } = createFarmEnvironment(scene);

  // Water system
  createWaterSystem(-width/2+1, 0, depth/2-2, scene);

  // Plant racks (3 racks, 4 levels, 6 plants per level)
  const rackCount = 3;
  const rackSpacing = width / (rackCount + 1);
  for (let i = 0; i < rackCount; i++) {
    const x = -width/2 + rackSpacing * (i+1);
    createPlantRack(x, 0, 4, 6, 0.5, scene);
    // UV light above each rack
    scene.add(createUVLight(x, height-0.5, 0, 3));
  }

  // Robots (one per rack, moving along z)
  for (let i = 0; i < rackCount; i++) {
    const x = -width/2 + rackSpacing * (i+1);
    scene.add(createRobot(x, 0.18, -depth/2+2));
  }

  // Pest manager (optional, near one rack)
  scene.add(createPestManager(width/2-1, 0.18, 0));

  // Lighting (ambient + one shadow-casting directional)
  const ambient = new THREE.AmbientLight(0x404040, 0.8);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(20, 40, 20);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  scene.add(dirLight);

  // Camera controls
  setupCameraControls(camera, renderer, renderer.domElement);

  // Animation loop
  let animationId: number | null = null;
  function animate() {
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
    animationId = requestAnimationFrame(animate);
  }
  animate();

  // Close on click or Escape
  function close3D() {
    if (!racine3DActive) return;
    racine3DActive = false;
    if (animationId) cancelAnimationFrame(animationId);
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
    }
    if (threeContainer) {
      document.body.removeChild(threeContainer);
      threeContainer = null;
    }
    document.body.style.overflow = '';
    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', onKey);
  }
  threeContainer.addEventListener('click', close3D);
  function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close3D(); }
  window.addEventListener('keydown', onKey);
  function onResize() {
    if (camera && renderer) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
  window.addEventListener('resize', onResize);
}
