import * as THREE from 'three';

export function createPlantRack(x: number, y: number, z: number, levels: number, spacing: number, scene: THREE.Scene) {
  const rackGroup = new THREE.Group();
  
  // Rack frame
  const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
  const frameGeometry = new THREE.BoxGeometry(0.1, levels * spacing + 0.5, 0.1);
  
  // Vertical supports
  const leftSupport = new THREE.Mesh(frameGeometry, frameMaterial);
  leftSupport.position.set(-1.5, (levels * spacing) / 2, 0);
  leftSupport.castShadow = true;
  rackGroup.add(leftSupport);
  
  const rightSupport = new THREE.Mesh(frameGeometry, frameMaterial);
  rightSupport.position.set(1.5, (levels * spacing) / 2, 0);
  rightSupport.castShadow = true;
  rackGroup.add(rightSupport);
  
  // Horizontal shelves
  const shelfGeometry = new THREE.BoxGeometry(3.2, 0.05, 0.8);
  const shelfMaterial = new THREE.MeshLambertMaterial({ color: 0x3a3a3a });
  
  for (let i = 0; i < levels; i++) {
    const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
    shelf.position.set(0, i * spacing + 0.25, 0);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    rackGroup.add(shelf);
    
    // Add plants on each shelf
    createPlantsOnShelf(shelf, rackGroup);
  }
  
  rackGroup.position.set(x, y, z);
  scene.add(rackGroup);
  
  return rackGroup;
}

function createPlantsOnShelf(shelf: THREE.Mesh, rackGroup: THREE.Group) {
  const plantPositions = [
    { x: -1, z: 0 },
    { x: -0.5, z: 0 },
    { x: 0, z: 0 },
    { x: 0.5, z: 0 },
    { x: 1, z: 0 }
  ];
  
  plantPositions.forEach(pos => {
    const plant = createPlant();
    plant.position.set(pos.x, 0.1, pos.z);
    plant.position.add(shelf.position);
    rackGroup.add(plant);
  });
}

function createPlant(): THREE.Group {
  const plantGroup = new THREE.Group();
  
  // Plant pot
  const potGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.2, 8);
  const potMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  const pot = new THREE.Mesh(potGeometry, potMaterial);
  pot.castShadow = true;
  plantGroup.add(pot);
  
  // Plant leaves
  const leafGeometry = new THREE.SphereGeometry(0.2, 8, 6);
  const leafMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
  const leaves = new THREE.Mesh(leafGeometry, leafMaterial);
  leaves.position.y = 0.3;
  leaves.castShadow = true;
  plantGroup.add(leaves);
  
  // Small leaves
  for (let i = 0; i < 3; i++) {
    const smallLeaf = new THREE.Mesh(leafGeometry, leafMaterial);
    smallLeaf.scale.set(0.6, 0.6, 0.6);
    smallLeaf.position.set(
      (Math.random() - 0.5) * 0.3,
      0.25 + i * 0.1,
      (Math.random() - 0.5) * 0.3
    );
    smallLeaf.castShadow = true;
    plantGroup.add(smallLeaf);
  }
  
  return plantGroup;
} 