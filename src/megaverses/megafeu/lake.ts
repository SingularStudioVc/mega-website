import * as THREE from 'three';

export function addLakeToScene(scene: THREE.Scene) {
  // Medium square lake in the (-50, -50) corner, size 40x40
  const lakeSize = 60; // Increased lake size
  const lakePosition = new THREE.Vector3(-30, 0.02, -30);
  const cornerRadius = 15;

  // Create a rounded rectangle shape for the lake
  const lakeShape = new THREE.Shape();
  lakeShape.moveTo(-lakeSize / 2 + cornerRadius, -lakeSize / 2);
  lakeShape.lineTo(lakeSize / 2 - cornerRadius, -lakeSize / 2);
  lakeShape.quadraticCurveTo(lakeSize / 2, -lakeSize / 2, lakeSize / 2, -lakeSize / 2 + cornerRadius);
  lakeShape.lineTo(lakeSize / 2, lakeSize / 2 - cornerRadius);
  lakeShape.quadraticCurveTo(lakeSize / 2, lakeSize / 2, lakeSize / 2 - cornerRadius, lakeSize / 2);
  lakeShape.lineTo(-lakeSize / 2 + cornerRadius, lakeSize / 2);
  lakeShape.quadraticCurveTo(-lakeSize / 2, lakeSize / 2, -lakeSize / 2, lakeSize / 2 - cornerRadius);
  lakeShape.lineTo(-lakeSize / 2, -lakeSize / 2 + cornerRadius);
  lakeShape.quadraticCurveTo(-lakeSize / 2, -lakeSize / 2, -lakeSize / 2 + cornerRadius, -lakeSize / 2);

  const lakeGeometry = new THREE.ShapeGeometry(lakeShape);
  
  // Deep water layer (bottom of lake)
  const deepWaterMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x1a4b6e, // Deep blue color
    transparent: true,
    opacity: 0.9,
    roughness: 0.05, // Smoother
    metalness: 0.5,  // More reflective
    clearcoat: 1.0,  // Stronger clearcoat
    clearcoatRoughness: 0.05,
    transmission: 0.3, // More light transmission
    ior: 1.33,
  });
  const deepWater = new THREE.Mesh(lakeGeometry, deepWaterMaterial);
  deepWater.rotation.x = -Math.PI / 2;
  deepWater.position.set(lakePosition.x, -2, lakePosition.z); // Deep below surface
  deepWater.receiveShadow = false;
  scene.add(deepWater);

  // Mid-depth water layer
  const midWaterMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x2d7da0, // Medium blue color
    transparent: true,
    opacity: 0.8,
    roughness: 0.1, // Smoother
    metalness: 0.6,  // More reflective
    clearcoat: 0.9,  // Stronger clearcoat
    clearcoatRoughness: 0.08,
    transmission: 0.5, // More light transmission
    ior: 1.33,
  });
  const midWater = new THREE.Mesh(lakeGeometry, midWaterMaterial);
  midWater.rotation.x = -Math.PI / 2;
  midWater.position.set(lakePosition.x, -1, lakePosition.z); // Mid depth
  midWater.receiveShadow = false;
  scene.add(midWater);

  // Surface water layer (top)
  const lakeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x3bb6e6, // Light blue surface
    transparent: true,
    opacity: 0.7,
    roughness: 0.15, // Smoother
    metalness: 0.9,  // Highly reflective
    clearcoat: 1.0,  // Strongest clearcoat
    clearcoatRoughness: 0.05,
    transmission: 0.7, // High light transmission
    ior: 1.33,
  });
  const lake = new THREE.Mesh(lakeGeometry, lakeMaterial);
  lake.rotation.x = -Math.PI / 2;
  lake.position.set(lakePosition.x, lakePosition.y, lakePosition.z); // Surface level
  lake.receiveShadow = false;
  scene.add(lake);
  scene.userData.lake = lake;

  

  // Add underwater terrain (lake bottom)
  const bottomGeometry = new THREE.PlaneGeometry(lakeSize * 0.9, lakeSize * 0.9, 20, 20);
  // Add some variation to the lake bottom
  const bottomPos = bottomGeometry.attributes.position;
  for (let i = 0; i < bottomPos.count; i++) {
    const x = bottomPos.getX(i);
    const z = bottomPos.getZ(i);
    const depth = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.5 + 
                  Math.sin(x * 0.05) * Math.cos(z * 0.05) * 1.0;
    bottomPos.setY(i, -3 - depth); // Varies between -2.5 and -4.5
  }
  bottomGeometry.attributes.position.needsUpdate = true;
  bottomGeometry.computeVertexNormals();
  
  const bottomMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1a3a4a, // Dark blue-green bottom
    roughness: 0.8, 
    metalness: 0.1 
  });
  const lakeBottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
  lakeBottom.rotation.x = -Math.PI / 2;
  lakeBottom.position.set(lakePosition.x, -3, lakePosition.z);
  lakeBottom.receiveShadow = true;
  scene.add(lakeBottom);

  // Add some underwater particles for depth effect
  const particleCount = 50;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSizes = new Float32Array(particleCount);
  
  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * lakeSize * 0.8;
    const z = (Math.random() - 0.5) * lakeSize * 0.8;
    const y = -Math.random() * 2 - 0.5; // Between -0.5 and -2.5
    
    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;
    
    particleSizes[i] = Math.random() * 0.1 + 0.05;
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
    transparent: true,
    opacity: 0.3,
    sizeAttenuation: true
  });
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particles.position.set(lakePosition.x, 0, lakePosition.z);
  scene.add(particles);
} 