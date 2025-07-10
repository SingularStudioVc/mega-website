import * as THREE from 'three';

export type RoboticSpiderInstance = { group: THREE.Group, legs: THREE.Group[], spray: THREE.Group };

function createFlameMesh() {
  // Multi-layered, highly realistic flame
  const group = new THREE.Group();
  // Main body (orange)
  const mainGeo = new THREE.SphereGeometry(0.5 + Math.random() * 0.18, 18, 16);
  const mainMat = new THREE.MeshStandardMaterial({
    color: 0xffa600,
    emissive: 0xff4d00,
    emissiveIntensity: 3.5 + Math.random() * 1.8,
    transparent: true,
    opacity: 0.8,
  });
  const main = new THREE.Mesh(mainGeo, mainMat);
  main.scale.set(1.1 + Math.random() * 0.2, 2.7 + Math.random() * 0.9, 1.1 + Math.random() * 0.2);
  group.add(main);
  // Core (white/yellow)
  const coreGeo = new THREE.SphereGeometry(0.22 + Math.random() * 0.09, 12, 10);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xffffcc,
    emissive: 0xfff6a6,
    emissiveIntensity: 4.5,
    transparent: true,
    opacity: 0.6,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.y = 0.22;
  group.add(core);
  // Add smoke particles
  const smokeGeo = new THREE.BufferGeometry();
  const smokePositions = [];
  for (let i = 0; i < 30; i++) {
    smokePositions.push((Math.random() - 0.5) * 2, Math.random() * 4, (Math.random() - 0.5) * 2);
  }
  smokeGeo.setAttribute('position', new THREE.Float32BufferAttribute(smokePositions, 3));
  const smokeMat = new THREE.PointsMaterial({
    color: 0x222222,
    size: 0.8 + Math.random() * 0.8,
    transparent: true,
    opacity: 0.25 + Math.random() * 0.2,
    blending: THREE.AdditiveBlending,
  });
  const smoke = new THREE.Points(smokeGeo, smokeMat);
  smoke.userData.velocities = Array(30).fill(0).map(() => new THREE.Vector3((Math.random() - 0.5) * 0.1, Math.random() * 0.4 + 0.2, (Math.random() - 0.5) * 0.1));
  group.add(smoke);

  // Add embers
  const emberGeo = new THREE.BufferGeometry();
  const emberPositions = [];
  for (let i = 0; i < 20; i++) {
    emberPositions.push((Math.random() - 0.5) * 1.5, Math.random() * 3, (Math.random() - 0.5) * 1.5);
  }
  emberGeo.setAttribute('position', new THREE.Float32BufferAttribute(emberPositions, 3));
  const emberMat = new THREE.PointsMaterial({
    color: 0xff6600,
    size: 0.08 + Math.random() * 0.08,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  });
  const embers = new THREE.Points(emberGeo, emberMat);
  embers.userData.velocities = Array(20).fill(0).map(() => new THREE.Vector3(0, Math.random() * 0.8 + 0.3, 0));
  group.add(embers);

  // Animate the flame flicker
  group.userData.animate = (t: number) => {
    const flicker = 1.7 + Math.sin(t * 13 + group.position.x * 2 + group.position.z * 2) * 0.55 + Math.sin(t * 33 + group.position.x) * 0.18;
    main.scale.y = (2.7 + Math.random() * 0.9) * flicker;
    main.material.opacity = 0.7 + Math.sin(t * 18 + group.position.x * 3) * 0.28;
    core.material.opacity = 0.5 + Math.sin(t * 22 + group.position.z * 2) * 0.22;
    core.scale.y = 1.1 + Math.sin(t * 24 + group.position.x * 2) * 0.4;
    (core.material as any).emissive.setHSL(0.13, 1, 0.8 + 0.25 * Math.sin(t * 12));

    // Animate smoke
    const smokePos = smoke.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < smokePos.count; i++) {
      smokePos.setY(i, smokePos.getY(i) + smoke.userData.velocities[i].y * (1/60));
      smokePos.setX(i, smokePos.getX(i) + Math.sin(t * 0.5 + i) * 0.05);
      if (smokePos.getY(i) > 5) smokePos.setY(i, 0);
    }
    smokePos.needsUpdate = true;
    smoke.material.opacity = 0.25 + Math.sin(t * 2 + group.position.x) * 0.1;

    // Animate embers
    const emberPos = embers.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < emberPos.count; i++) {
      emberPos.setY(i, emberPos.getY(i) + embers.userData.velocities[i].y * (1/60));
      if (emberPos.getY(i) > 4) emberPos.setY(i, 0);
    }
    emberPos.needsUpdate = true;
    embers.material.opacity = 0.8 + Math.sin(t * 5 + group.position.z) * 0.2;
  };
  return group;
}

export function addForestToScene(scene: THREE.Scene) {
  const treeCount = 180;
  const burningFraction = 0.6; // 60% of trees burn
  const burningIndices = new Set<number>();
  while (burningIndices.size < Math.floor(treeCount * burningFraction)) {
    burningIndices.add(Math.floor(Math.random() * treeCount));
  }
  for (let i = 0; i < treeCount; i++) {
    let x, z;
    // Place trees only in a tighter band (x > 20 or z > 20, and x < 48, z < 48)
    do {
      x = -48 + Math.random() * 96;
      z = -48 + Math.random() * 96;
    } while ((x <= 20 && z <= 20) || x > 48 || z > 48);
    const trunkHeight = 1.2 + Math.random() * 1.2;
    const trunkRadius = 0.13 + Math.random() * 0.13;
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius * 0.8, trunkRadius, trunkHeight, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x7c5c36 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, trunkHeight / 2, z);
    scene.add(trunk);
    const canopyRadius = 0.9 + Math.random() * 1.1;
    const canopyGeometry = new THREE.SphereGeometry(canopyRadius, 12, 10);
    const canopyMaterial = new THREE.MeshStandardMaterial({ color: 0x2d6a4f });
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
    canopy.position.set(x + (Math.random() - 0.5) * 0.5, trunkHeight + canopyRadius * 0.7, z + (Math.random() - 0.5) * 0.5);
    scene.add(canopy);
    // Add flames to some trees
    if (burningIndices.has(i)) {
      const flame = createFlameMesh();
      flame.position.set(canopy.position.x, canopy.position.y + canopyRadius * 0.7, canopy.position.z);
      scene.add(flame);
      // Animate flames in the main render loop
      if (!scene.userData.flames) scene.userData.flames = [];
      scene.userData.flames.push(flame);
    }
  }
}

// Animate flames in the main render loop (call this from your main animate loop)
export function animateForestFlames(scene: THREE.Scene, t: number) {
  if (scene.userData.flames) {
    for (const flame of scene.userData.flames) {
      if (flame.userData.animate) flame.userData.animate(t);
    }
  }
}

export function createRoboticSpider(scale = 1): RoboticSpiderInstance {
  const group = new THREE.Group();
  
  // Body: clean white
  const bodyGeometry = new THREE.CapsuleGeometry(0.8, 1.5, 8, 16); // Radius, length, radial segments, height segments
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, // White color
    metalness: 0.1, 
    roughness: 0.3 
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.castShadow = true;
  body.rotation.x = Math.PI / 2; // Rotate to align with spider's forward direction
  group.add(body);

  // Central glowing core (unchanged)
  const coreGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const coreMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 1.5 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.z = 0.1;
  group.add(core);

  // Head: white to match body
  const headGeometry = new THREE.SphereGeometry(0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2); // Sphere segment for rounded look
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.3 });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.set(0, 0.4, -0.8);
  head.rotation.x = -Math.PI / 6; // Slightly tilted forward
  group.add(head);

  // Subtle red sensor lights (non-blinking)
  const sensorGeo = new THREE.SphereGeometry(0.03, 8, 8);
  const sensorMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 3 });
  const sensorLeft = new THREE.Mesh(sensorGeo, sensorMat);
  sensorLeft.position.set(-0.15, 0.4, -1.05);
  group.add(sensorLeft);
  const sensorRight = new THREE.Mesh(sensorGeo, sensorMat);
  sensorRight.position.set(0.15, 0.4, -1.05);
  group.add(sensorRight);

  // Water tank: larger, more explicit, armored - now less transparent, more metallic
  const tankGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 16); // Larger cylinder
  const tankMaterial = new THREE.MeshStandardMaterial({ color: 0x3bb6e6, metalness: 0.8, roughness: 0.1, transparent: false }); // Less transparent, more metallic
  const tank = new THREE.Mesh(tankGeometry, tankMaterial);
  tank.position.set(0, 0.5, 0.8); // Positioned higher and further back
  tank.rotation.x = Math.PI / 2;
  group.add(tank);

  // Water cannon: prominent, articulated - now more metallic
  const cannonGroup = new THREE.Group();
  const cannonBaseGeo = new THREE.CylinderGeometry(0.1, 0.15, 0.3, 12);
  const cannonBaseMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9, roughness: 0.2 }); // Darker, more metallic
  const cannonBase = new THREE.Mesh(cannonBaseGeo, cannonBaseMat);
  cannonBase.position.y = -0.15;
  cannonGroup.add(cannonBase);

  const cannonBarrelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 10);
  const cannonBarrelMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.9, roughness: 0.2 }); // Darker, more metallic
  const cannonBarrel = new THREE.Mesh(cannonBarrelGeo, cannonBarrelMat);
  cannonBarrel.position.y = -0.55;
  cannonGroup.add(cannonBarrel);

  cannonGroup.position.set(0, 0.1, -1.2);
  cannonGroup.rotation.x = Math.PI / 2;
  group.add(cannonGroup);

  // Water spray (particle group, initially invisible)
  const spray = new THREE.Group();
  for (let i = 0; i < 25; i++) {
    const dropGeo = new THREE.SphereGeometry(0.03 + Math.random() * 0.02, 6, 6);
    const dropMat = new THREE.MeshStandardMaterial({ color: 0x3bb6e6, transparent: true, opacity: 0.7 });
    const drop = new THREE.Mesh(dropGeo, dropMat);
    drop.position.set((Math.random() - 0.5) * 0.3, 0.6 + Math.random() * 1.5, -3 - Math.random() * 3);
    spray.add(drop);
  }
  spray.visible = false;
  group.add(spray);

  // Legs (8), articulated, mechanical - now dark grey/black with metallic sheen
  const legs: THREE.Group[] = [];
  const upperLegLength = 1.0;
  const lowerLegLength = 1.2;
  const legThickness = 0.1;

  for (let i = 0; i < 8; i++) {
    const leg = new THREE.Group();
    leg.userData.isSpiderLeg = true;
    leg.userData.legIndex = i;

    // Upper leg segment (cylinder for more robotic look) - now white
    const upperLegGeo = new THREE.CylinderGeometry(legThickness, legThickness, upperLegLength, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.3 }); // White to match body
    const upper = new THREE.Mesh(upperLegGeo, legMaterial);
    upper.position.y = -upperLegLength / 2;
    upper.castShadow = true;
    leg.add(upper);

    // Lower leg segment (cylinder for more robotic look) - now white
    const lowerLegGeo = new THREE.CylinderGeometry(legThickness * 0.8, legThickness * 0.8, lowerLegLength, 8);
    const lower = new THREE.Mesh(lowerLegGeo, legMaterial);
    lower.position.y = -upperLegLength - lowerLegLength / 2;
    lower.castShadow = true;
    leg.add(lower);

    // Place leg around body
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 8; // Offset for better placement
    const radius = 0.7;
    leg.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
    leg.rotation.y = angle;
    group.add(leg);
    legs.push(leg);
  }

  group.scale.setScalar(scale);
  // Raise the body higher
  group.position.y = 0.7;
  return { group, legs, spray };
}

export function extinguishFlamesNear(position: THREE.Vector3, radius: number, scene: THREE.Scene): void {
  if (!scene.userData.flames) return;
  const toRemove: any[] = [];
  for (const flame of scene.userData.flames) {
    if (flame.position.distanceTo(position) < radius) {
      scene.remove(flame);
      toRemove.push(flame);
    }
  }
  scene.userData.flames = scene.userData.flames.filter((f: any) => !toRemove.includes(f));
} 