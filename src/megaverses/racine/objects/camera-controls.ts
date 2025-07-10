import * as THREE from 'three';

export function setupCameraControls(camera: THREE.PerspectiveCamera, _renderer: THREE.WebGLRenderer, domElement: HTMLElement) {
  // Minimal orbit controls (no external dependency)
  let isDragging = false;
  let lastX = 0, lastY = 0;
  let theta = 0, phi = Math.PI / 6, radius = 32;
  let target = new THREE.Vector3(0, 5, 0);

  function updateCamera() {
    camera.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = target.y + radius * Math.cos(phi);
    camera.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(target);
  }
  updateCamera();

  domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  domElement.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    theta -= dx * 0.01;
    phi = Math.max(0.1, Math.min(Math.PI / 2, phi + dy * 0.01));
    lastX = e.clientX;
    lastY = e.clientY;
    updateCamera();
  });
  domElement.addEventListener('mouseup', () => { isDragging = false; });
  domElement.addEventListener('mouseleave', () => { isDragging = false; });
  domElement.addEventListener('wheel', (e) => {
    radius = Math.max(8, Math.min(60, radius + e.deltaY * 0.01));
    updateCamera();
  });
} 