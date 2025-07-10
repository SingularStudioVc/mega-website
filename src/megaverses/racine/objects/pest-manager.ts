import * as THREE from 'three';

export function createPestManager(x: number, y: number, z: number) {
  const group = new THREE.Group();
  // Main body
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x8d5524, metalness: 0.3, roughness: 0.7 })
  );
  body.position.set(0, 0.09, 0);
  group.add(body);
  // Dispenser tube
  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.18, 8),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
  );
  tube.position.set(0, 0.18, 0);
  group.add(tube);
  group.position.set(x, y, z);
  return group;
} 