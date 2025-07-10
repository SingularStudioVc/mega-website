import * as THREE from 'three';

export function createDrone(scale = 1): THREE.Group {
  const group = new THREE.Group();

  // Main body - more realistic quadcopter shape
  const bodyGeo = new THREE.BoxGeometry(0.4, 0.15, 0.6);
  const bodyMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a2e, 
    metalness: 0.8, 
    roughness: 0.2 
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  group.add(body);

  // Top cover with rounded edges
  const topGeo = new THREE.BoxGeometry(0.35, 0.08, 0.55);
  const topMat = new THREE.MeshStandardMaterial({ 
    color: 0x16213e, 
    metalness: 0.6, 
    roughness: 0.3 
  });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = 0.115;
  top.castShadow = true;
  group.add(top);

  // Water tank - more realistic cylindrical tank
  const tankGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.4, 16);
  const tankMat = new THREE.MeshStandardMaterial({ 
    color: 0x00b4d8, 
    metalness: 0.4, 
    roughness: 0.1, 
    transparent: true, 
    opacity: 0.8 
  });
  const tank = new THREE.Mesh(tankGeo, tankMat);
  tank.position.set(0, -0.35, 0);
  tank.castShadow = true;
  group.add(tank);

  // Tank cap
  const capGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.05, 16);
  const capMat = new THREE.MeshStandardMaterial({ 
    color: 0x0077b6, 
    metalness: 0.7, 
    roughness: 0.2 
  });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.set(0, -0.55, 0);
  cap.castShadow = true;
  group.add(cap);

  // Arms - more realistic with better proportions
  for (let i = 0; i < 4; i++) {
    const angle = i * Math.PI / 2;
    const armLength = 0.8;
    
    // Main arm
    const armGeo = new THREE.CylinderGeometry(0.025, 0.025, armLength, 8);
    const armMat = new THREE.MeshStandardMaterial({ 
      color: 0x4a4a4a, 
      metalness: 0.9, 
      roughness: 0.1 
    });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(
      Math.cos(angle) * 0.25, 
      0, 
      Math.sin(angle) * 0.25
    );
    arm.rotation.x = Math.PI / 2;
    arm.rotation.y = angle;
    arm.castShadow = true;
    group.add(arm);

    // Motor housing
    const motorGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 12);
    const motorMat = new THREE.MeshStandardMaterial({ 
      color: 0x2d2d2d, 
      metalness: 0.8, 
      roughness: 0.2 
    });
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.position.set(
      Math.cos(angle) * (0.25 + armLength/2), 
      0, 
      Math.sin(angle) * (0.25 + armLength/2)
    );
    motor.rotation.x = Math.PI / 2;
    motor.castShadow = true;
    group.add(motor);

    // Propeller (will be animated)
    const propGeo = new THREE.BoxGeometry(0.02, 0.3, 0.02);
    const propMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a, 
      metalness: 0.5, 
      roughness: 0.4 
    });
    const propeller = new THREE.Mesh(propGeo, propMat);
    propeller.position.set(
      Math.cos(angle) * (0.25 + armLength/2), 
      0, 
      Math.sin(angle) * (0.25 + armLength/2)
    );
    propeller.rotation.x = Math.PI / 2;
    propeller.rotation.z = Math.PI / 4; // Offset for visual interest
    propeller.castShadow = true;
    group.add(propeller);

    // Landing gear
    const gearGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8);
    const gearMat = new THREE.MeshStandardMaterial({ 
      color: 0x666666, 
      metalness: 0.7, 
      roughness: 0.3 
    });
    const gear = new THREE.Mesh(gearGeo, gearMat);
    gear.position.set(
      Math.cos(angle) * 0.15, 
      -0.25, 
      Math.sin(angle) * 0.15
    );
    gear.castShadow = true;
    group.add(gear);
  }

  // Camera/sensor array
  const sensorGeo = new THREE.BoxGeometry(0.1, 0.05, 0.15);
  const sensorMat = new THREE.MeshStandardMaterial({ 
    color: 0x000000, 
    metalness: 0.9, 
    roughness: 0.1 
  });
  const sensor = new THREE.Mesh(sensorGeo, sensorMat);
  sensor.position.set(0, 0.2, 0.3);
  sensor.castShadow = true;
  group.add(sensor);

  // LED indicators
  const ledGeo = new THREE.SphereGeometry(0.02, 8, 8);
  const ledMat = new THREE.MeshStandardMaterial({ 
    color: 0x00ff00, 
    emissive: 0x00ff00,
    emissiveIntensity: 0.3
  });
  
  // Front LED
  const frontLed = new THREE.Mesh(ledGeo, ledMat);
  frontLed.position.set(0, 0.2, 0.35);
  group.add(frontLed);
  
  // Back LED
  const backLed = new THREE.Mesh(ledGeo, ledMat);
  backLed.position.set(0, 0.2, -0.35);
  backLed.material = ledMat.clone();
  (backLed.material as THREE.MeshStandardMaterial).color.setHex(0xff0000);
  (backLed.material as THREE.MeshStandardMaterial).emissive.setHex(0xff0000);
  group.add(backLed);

  // GPS antenna
  const antennaGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 8);
  const antennaMat = new THREE.MeshStandardMaterial({ 
    color: 0x888888, 
    metalness: 0.8, 
    roughness: 0.2 
  });
  const antenna = new THREE.Mesh(antennaGeo, antennaMat);
  antenna.position.set(0, 0.25, 0);
  antenna.castShadow = true;
  group.add(antenna);

  // Add subtle ambient light to the drone
  const droneLight = new THREE.PointLight(0xffffff, 0.1, 2);
  droneLight.position.set(0, 0, 0);
  group.add(droneLight);

  group.scale.setScalar(scale);
  return group;
} 