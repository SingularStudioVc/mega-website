import * as THREE from 'three';

export function createUVLight(x: number, y: number, z: number, length: number) {
  const group = new THREE.Group();
  // Tube
  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, length, 16),
    new THREE.MeshStandardMaterial({ color: 0x7f5fff, emissive: 0x7f5fff, emissiveIntensity: 1, metalness: 0.2, roughness: 0.3 })
  );
  tube.position.set(0, 0, 0);
  tube.rotation.z = Math.PI / 2;
  group.add(tube);
  // Glow (sprite or mesh)
  const glow = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, length * 1.1, 16),
    new THREE.MeshBasicMaterial({ color: 0x7f5fff, transparent: true, opacity: 0.18 })
  );
  glow.position.set(0, 0, 0);
  glow.rotation.z = Math.PI / 2;
  group.add(glow);
  group.position.set(x, y, z);
  return group;
} 