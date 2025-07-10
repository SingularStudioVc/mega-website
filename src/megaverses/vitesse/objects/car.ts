import * as THREE from 'three';

export class Car extends THREE.Group {
  private speed: number;
  private path: THREE.Vector3[];
  private pathIndex: number;
  private targetPosition: THREE.Vector3;

  constructor(color: number, speed: number, path: THREE.Vector3[]) {
    super();
    this.speed = speed;
    this.path = path;
    this.pathIndex = 0;
    this.targetPosition = this.path[0].clone();

    this.createCarBody(color);
    this.createWheels();
    
    this.position.copy(this.path[0]);
    this.lookAt(this.path[1]);
  }

  // Public methods to set initial state
  setInitialState(offsetIndex: number) {
    this.pathIndex = offsetIndex;
    this.targetPosition = this.path[(offsetIndex + 1) % this.path.length].clone();
    this.lookAt(this.targetPosition);
  }

  private createCarBody(color: number) {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1, 4),
      new THREE.MeshStandardMaterial({ color: color })
    );
    body.position.y = 0.5;
    body.castShadow = true;
    body.receiveShadow = true;
    this.add(body);

    // Add car details
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.8, 2),
      new THREE.MeshStandardMaterial({ color: color * 0.8 })
    );
    roof.position.set(0, 1.4, -0.5);
    roof.castShadow = true;
    this.add(roof);

    // Headlights
    const headlightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const headlightMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffcc,
      emissive: 0xffffcc,
      emissiveIntensity: 0.3
    });

    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-0.8, 0.6, 2.2);
    this.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(0.8, 0.6, 2.2);
    this.add(rightHeadlight);
  }

  private createWheels() {
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 8);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

    const wheelPositions = [
      [-1, 0.5, 1.5],   // front left
      [1, 0.5, 1.5],    // front right
      [-1, 0.5, -1.5],  // back left
      [1, 0.5, -1.5]    // back right
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      this.add(wheel);
    });
  }

  update(deltaTime: number) {
    const distanceToTarget = this.position.distanceTo(this.targetPosition);
    const moveDistance = this.speed * deltaTime;

    if (distanceToTarget <= moveDistance) {
      this.position.copy(this.targetPosition);
      this.pathIndex = (this.pathIndex + 1) % this.path.length;
      this.targetPosition = this.path[this.pathIndex].clone();
      this.lookAt(this.targetPosition);
    } else {
      this.translateZ(moveDistance);
    }
  }
} 