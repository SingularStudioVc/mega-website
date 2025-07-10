import * as THREE from 'three';

export function createFarmEnvironment(scene: THREE.Scene) {
  const width = 20;
  const depth = 16;
  const height = 8;
  const wallThickness = 0.2;

  // Floor
  const floorGeometry = new THREE.PlaneGeometry(width, depth);
  const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x2d4a3e });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Ceiling
  const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
  const ceilingMaterial = new THREE.MeshLambertMaterial({ color: 0x1a2a1e });
  const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
  ceiling.position.y = height;
  ceiling.rotation.x = Math.PI / 2;
  scene.add(ceiling);

  // Walls
  const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x3a5a4e });
  
  // Back wall
  const backWallGeometry = new THREE.BoxGeometry(width, height, wallThickness);
  const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
  backWall.position.set(0, height/2, -depth/2);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  scene.add(backWall);

  // Front wall (with opening for entrance)
  const frontWallGeometry = new THREE.BoxGeometry(width, height, wallThickness);
  const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
  frontWall.position.set(0, height/2, depth/2);
  frontWall.castShadow = true;
  frontWall.receiveShadow = true;
  scene.add(frontWall);

  // Left wall
  const leftWallGeometry = new THREE.BoxGeometry(wallThickness, height, depth);
  const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
  leftWall.position.set(-width/2, height/2, 0);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  // Right wall
  const rightWallGeometry = new THREE.BoxGeometry(wallThickness, height, depth);
  const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
  rightWall.position.set(width/2, height/2, 0);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  scene.add(rightWall);

  return { width, depth, height };
} 