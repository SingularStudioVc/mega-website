import * as THREE from 'three';

export function addMountainsToScene(scene: THREE.Scene) {
  const mountainColors = [0x888888, 0x6d6d6d, 0x9a8c7a, 0x7c6f57];
  for (let i = 0; i < 15; i++) {
    const t = i / 14;
    // Arc from (-50, -50) to (0, -50) to (-50, 0)
    let x, z;
    if (t < 0.5) {
      x = -50 + t * 100;
      z = -50;
    } else {
      x = -50;
      z = -50 + (t - 0.5) * 100;
    }
    x += (Math.random() - 0.5) * 4;
    z += (Math.random() - 0.5) * 4;
    const height = 10 + Math.random() * 12;
    const radius = 7 + Math.random() * 5;
    const geo = new THREE.ConeGeometry(radius, height, 7 + Math.floor(Math.random() * 4));
    const mat = new THREE.MeshStandardMaterial({
      color: mountainColors[Math.floor(Math.random() * mountainColors.length)],
      flatShading: true,
    });
    const mountain = new THREE.Mesh(geo, mat);
    mountain.position.set(x, height / 2 - 0.5, z);
    mountain.castShadow = true;
    mountain.receiveShadow = true;
    mountain.rotation.y = Math.random() * Math.PI * 2;
    scene.add(mountain);
  }
} 