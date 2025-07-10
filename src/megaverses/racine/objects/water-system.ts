import * as THREE from 'three';

export function createWaterSystem(x: number, y: number, z: number, scene: THREE.Scene) {
  // Tank
  const tank = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.7, 16),
    new THREE.MeshStandardMaterial({ color: 0x6ec6ff, metalness: 0.7, roughness: 0.3 })
  );
  tank.position.set(x, y + 0.35, z);
  scene.add(tank);
  // Pipe
  const pipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 3, 16),
    new THREE.MeshStandardMaterial({ color: 0x6ec6ff, metalness: 0.7, roughness: 0.3 })
  );
  pipe.position.set(x + 1.5, y + 0.35, z);
  pipe.rotation.z = Math.PI / 2;
  scene.add(pipe);
  return { tank, pipe };
} 