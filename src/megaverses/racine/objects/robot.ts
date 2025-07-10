import * as THREE from 'three';

export function createRobot(x: number, y: number, z: number): THREE.Group {
  const robotGroup = new THREE.Group();
  
  // Robot body
  const bodyGeometry = new THREE.BoxGeometry(0.8, 0.6, 1.2);
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.3;
  body.castShadow = true;
  robotGroup.add(body);
  
  // Robot head
  const headGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.6);
  const headMaterial = new THREE.MeshLambertMaterial({ color: 0x34495e });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 0.7;
  head.castShadow = true;
  robotGroup.add(head);
  
  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 6);
  const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.3 });
  
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.15, 0.75, 0.25);
  robotGroup.add(leftEye);
  
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.15, 0.75, 0.25);
  robotGroup.add(rightEye);
  
  // Arms
  const armGeometry = new THREE.BoxGeometry(0.15, 0.8, 0.15);
  const armMaterial = new THREE.MeshLambertMaterial({ color: 0x34495e });
  
  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.5, 0.4, 0);
  leftArm.castShadow = true;
  robotGroup.add(leftArm);
  
  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.5, 0.4, 0);
  rightArm.castShadow = true;
  robotGroup.add(rightArm);
  
  // Hands
  const handGeometry = new THREE.SphereGeometry(0.1, 8, 6);
  const handMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
  
  const leftHand = new THREE.Mesh(handGeometry, handMaterial);
  leftHand.position.set(-0.5, 0, 0);
  leftHand.castShadow = true;
  robotGroup.add(leftHand);
  
  const rightHand = new THREE.Mesh(handGeometry, handMaterial);
  rightHand.position.set(0.5, 0, 0);
  rightHand.castShadow = true;
  robotGroup.add(rightHand);
  
  // Legs
  const legGeometry = new THREE.BoxGeometry(0.2, 0.4, 0.2);
  const legMaterial = new THREE.MeshLambertMaterial({ color: 0x34495e });
  
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.2, -0.2, 0);
  leftLeg.castShadow = true;
  robotGroup.add(leftLeg);
  
  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.2, -0.2, 0);
  rightLeg.castShadow = true;
  robotGroup.add(rightLeg);
  
  // Wheels
  const wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8);
  const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  
  const leftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  leftWheel.rotation.z = Math.PI / 2;
  leftWheel.position.set(-0.2, -0.4, 0.15);
  leftWheel.castShadow = true;
  robotGroup.add(leftWheel);
  
  const rightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  rightWheel.rotation.z = Math.PI / 2;
  rightWheel.position.set(0.2, -0.4, 0.15);
  rightWheel.castShadow = true;
  robotGroup.add(rightWheel);
  
  // Tool attachment (watering nozzle)
  const nozzleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
  const nozzleMaterial = new THREE.MeshLambertMaterial({ color: 0x7f8c8d });
  const nozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
  nozzle.position.set(0, 0.3, 0.7);
  nozzle.castShadow = true;
  robotGroup.add(nozzle);
  
  // Position the robot
  robotGroup.position.set(x, y, z);
  
  // Add simple movement animation
  let time = 0;
  const originalY = y;
  
  function animate() {
    time += 0.02;
    robotGroup.position.y = originalY + Math.sin(time) * 0.05;
    robotGroup.rotation.y = Math.sin(time * 0.5) * 0.1;
  }
  
  // Store animation function on the group for external access
  (robotGroup as any).animate = animate;
  
  return robotGroup;
} 