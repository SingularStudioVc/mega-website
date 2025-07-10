import * as THREE from 'three';

export class Building extends THREE.Group {
  constructor(
    width: number, 
    height: number, 
    depth: number, 
    color: number = 0x888888,
    hasWindows: boolean = true
  ) {
    super();

    this.createBuildingBody(width, height, depth, color);
    
    if (hasWindows) {
      this.addWindows(width, height, depth);
    }

    this.castShadow = true;
    this.receiveShadow = true;
  }

  private createBuildingBody(width: number, height: number, depth: number, color: number) {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color: color })
    );
    body.position.y = height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    this.add(body);
  }

  private addWindows(width: number, height: number, depth: number) {
    const windowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x87ceeb,
      emissive: 0x87ceeb,
      emissiveIntensity: 0.1
    });

    const windowSize = 1.5;
    const windowSpacing = 3;
    const windowDepth = 0.1;

    // Front and back windows
    for (let x = -width/2 + windowSpacing; x < width/2; x += windowSpacing) {
      for (let y = windowSpacing; y < height - windowSpacing; y += windowSpacing) {
        // Front windows
        const frontWindow = new THREE.Mesh(
          new THREE.BoxGeometry(windowSize, windowSize, windowDepth),
          windowMaterial
        );
        frontWindow.position.set(x, y, depth/2 + windowDepth/2);
        this.add(frontWindow);

        // Back windows
        const backWindow = new THREE.Mesh(
          new THREE.BoxGeometry(windowSize, windowSize, windowDepth),
          windowMaterial
        );
        backWindow.position.set(x, y, -depth/2 - windowDepth/2);
        this.add(backWindow);
      }
    }

    // Left and right windows
    for (let z = -depth/2 + windowSpacing; z < depth/2; z += windowSpacing) {
      for (let y = windowSpacing; y < height - windowSpacing; y += windowSpacing) {
        // Left windows
        const leftWindow = new THREE.Mesh(
          new THREE.BoxGeometry(windowDepth, windowSize, windowSize),
          windowMaterial
        );
        leftWindow.position.set(-width/2 - windowDepth/2, y, z);
        this.add(leftWindow);

        // Right windows
        const rightWindow = new THREE.Mesh(
          new THREE.BoxGeometry(windowDepth, windowSize, windowSize),
          windowMaterial
        );
        rightWindow.position.set(width/2 + windowDepth/2, y, z);
        this.add(rightWindow);
      }
    }
  }
} 