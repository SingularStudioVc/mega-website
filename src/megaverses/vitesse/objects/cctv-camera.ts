import * as THREE from 'three';

export class CCTVCamera extends THREE.Group {
  private cameraBody!: THREE.Mesh;
  private cameraLens!: THREE.Mesh;
  private pole!: THREE.Mesh;
  private light!: THREE.PointLight;

  constructor() {
    super();

    this.createPole();
    this.createCameraBody();
    this.createCameraLens();
    this.createLight();
    
    this.castShadow = true;
  }

  private createPole() {
    // Street pole (tall and thin)
    const poleGeometry = new THREE.CylinderGeometry(0.2, 0.3, 8, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    this.pole = new THREE.Mesh(poleGeometry, poleMaterial);
    this.pole.position.set(0, 4, 0); // Pole extends from ground to 8 units high
    this.pole.castShadow = true;
    this.add(this.pole);

    // Pole base (wider at bottom)
    const baseGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.5, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, 0.25, 0);
    base.castShadow = true;
    this.add(base);
  }

  private createCameraBody() {
    // Main camera body (black box)
    const bodyGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    this.cameraBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.cameraBody.position.set(0, 7.5, 0); // At top of pole
    this.cameraBody.castShadow = true;
    this.add(this.cameraBody);

    // Camera housing (dome)
    const domeGeometry = new THREE.SphereGeometry(0.3, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x111111,
      transparent: true,
      opacity: 0.8
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.set(0, 7.7, 0);
    dome.castShadow = true;
    this.add(dome);
  }

  private createCameraLens() {
    // Camera lens (dark circle)
    const lensGeometry = new THREE.CircleGeometry(0.12, 8);
    const lensMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x000000,
      emissive: 0x111111,
      emissiveIntensity: 0.1
    });
    this.cameraLens = new THREE.Mesh(lensGeometry, lensMaterial);
    this.cameraLens.position.set(0, 7.7, 0.4);
    this.cameraLens.rotation.x = -Math.PI / 2;
    this.add(this.cameraLens);

    // Lens ring (metallic)
    const ringGeometry = new THREE.RingGeometry(0.12, 0.16, 8);
    const ringMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x888888,
      metalness: 0.8,
      roughness: 0.2
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(0, 7.7, 0.4);
    ring.rotation.x = -Math.PI / 2;
    this.add(ring);
  }

  private createLight() {
    // Red recording light
    this.light = new THREE.PointLight(0xff0000, 0.4, 3);
    this.light.position.set(0, 7.8, 0.6);
    this.add(this.light);
  }

  update() {
    // Make the recording light blink
    const blinkSpeed = 2; // blinks per second
    const time = Date.now() * 0.001;
    const blink = Math.sin(time * blinkSpeed * Math.PI) > 0;
    
    if (this.light) {
      this.light.intensity = blink ? 0.4 : 0;
    }
  }

  setRotation(x: number, y: number, z: number) {
    this.rotation.set(x, y, z);
  }

  lookAtTarget(target: THREE.Vector3) {
    this.lookAt(target);
  }
} 