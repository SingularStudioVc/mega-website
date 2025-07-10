import * as THREE from 'three';

export class RoadSystem {
  private scene: THREE.Scene;
  private roadWidth: number;
  private sidewalkWidth: number;
  private buildingBlockSize: number;
  private citySize: number;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.roadWidth = 10;
    this.sidewalkWidth = 3;
    this.buildingBlockSize = 40;
    this.citySize = 200;
  }

  createRoadSystem() {
    const numBlocks = this.citySize / this.buildingBlockSize;
    
    // Create base grass plane
    this.createGrassPlane();
    
    // Create roads and sidewalks with proper z-fighting prevention
    for (let i = -numBlocks / 2; i < numBlocks / 2; i++) {
      const offset = i * this.buildingBlockSize;
      this.createRoadSegment(offset, true);  // Horizontal
      this.createRoadSegment(offset, false); // Vertical
    }

    // Add road markings
    this.addRoadMarkings();
  }

  private createGrassPlane() {
    const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
    const grassPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(this.citySize * 1.2, this.citySize * 1.2), 
      grassMaterial
    );
    grassPlane.rotation.x = -Math.PI / 2;
    grassPlane.position.y = 0;
    grassPlane.receiveShadow = true;
    this.scene.add(grassPlane);
  }

  private createRoadSegment(offset: number, isHorizontal: boolean) {
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const sidewalkMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });

    if (isHorizontal) {
      // Horizontal road
      const road = new THREE.Mesh(
        new THREE.PlaneGeometry(this.citySize, this.roadWidth), 
        roadMaterial
      );
      road.rotation.x = -Math.PI / 2;
      road.position.set(0, 0.02, offset);
      road.receiveShadow = true;
      this.scene.add(road);

      // Sidewalks
      const sidewalk1 = new THREE.Mesh(
        new THREE.PlaneGeometry(this.citySize, this.sidewalkWidth), 
        sidewalkMaterial
      );
      sidewalk1.rotation.x = -Math.PI / 2;
      sidewalk1.position.set(0, 0.01, offset + this.roadWidth / 2 + this.sidewalkWidth / 2);
      sidewalk1.receiveShadow = true;
      this.scene.add(sidewalk1);

      const sidewalk2 = new THREE.Mesh(
        new THREE.PlaneGeometry(this.citySize, this.sidewalkWidth), 
        sidewalkMaterial
      );
      sidewalk2.rotation.x = -Math.PI / 2;
      sidewalk2.position.set(0, 0.01, offset - this.roadWidth / 2 - this.sidewalkWidth / 2);
      sidewalk2.receiveShadow = true;
      this.scene.add(sidewalk2);
    } else {
      // Vertical road
      const road = new THREE.Mesh(
        new THREE.PlaneGeometry(this.roadWidth, this.citySize), 
        roadMaterial
      );
      road.rotation.x = -Math.PI / 2;
      road.position.set(offset, 0.02, 0);
      road.receiveShadow = true;
      this.scene.add(road);

      // Sidewalks
      const sidewalk1 = new THREE.Mesh(
        new THREE.PlaneGeometry(this.sidewalkWidth, this.citySize), 
        sidewalkMaterial
      );
      sidewalk1.rotation.x = -Math.PI / 2;
      sidewalk1.position.set(offset + this.roadWidth / 2 + this.sidewalkWidth / 2, 0.01, 0);
      sidewalk1.receiveShadow = true;
      this.scene.add(sidewalk1);

      const sidewalk2 = new THREE.Mesh(
        new THREE.PlaneGeometry(this.sidewalkWidth, this.citySize), 
        sidewalkMaterial
      );
      sidewalk2.rotation.x = -Math.PI / 2;
      sidewalk2.position.set(offset - this.roadWidth / 2 - this.sidewalkWidth / 2, 0.01, 0);
      sidewalk2.receiveShadow = true;
      this.scene.add(sidewalk2);
    }
  }

  private addRoadMarkings() {
    const numBlocks = this.citySize / this.buildingBlockSize;

    // Center lines on all roads
    for (let i = -numBlocks / 2; i < numBlocks / 2; i++) {
      const offset = i * this.buildingBlockSize;
      
      // Horizontal center lines
      this.createCenterLine(offset, true);
      // Vertical center lines
      this.createCenterLine(offset, false);
    }

    // Crosswalks at intersections
    for (let i = -numBlocks / 2; i < numBlocks / 2; i++) {
      for (let j = -numBlocks / 2; j < numBlocks / 2; j++) {
        const x = i * this.buildingBlockSize;
        const z = j * this.buildingBlockSize;
        this.createCrosswalk(x, z);
      }
    }

    // Stop lines before intersections
    this.createStopLines();
  }

  private createCenterLine(offset: number, isHorizontal: boolean) {
    const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const lineWidth = 0.3;
    const lineLength = 2;
    const gapLength = 1;

    if (isHorizontal) {
      // Create dashed center line for horizontal road
      for (let x = -this.citySize / 2; x < this.citySize / 2; x += lineLength + gapLength) {
        const line = new THREE.Mesh(
          new THREE.PlaneGeometry(lineLength, lineWidth),
          lineMaterial
        );
        line.rotation.x = -Math.PI / 2;
        line.position.set(x + lineLength / 2, 0.03, offset);
        this.scene.add(line);
      }
    } else {
      // Create dashed center line for vertical road
      for (let z = -this.citySize / 2; z < this.citySize / 2; z += lineLength + gapLength) {
        const line = new THREE.Mesh(
          new THREE.PlaneGeometry(lineWidth, lineLength),
          lineMaterial
        );
        line.rotation.x = -Math.PI / 2;
        line.position.set(offset, 0.03, z + lineLength / 2);
        this.scene.add(line);
      }
    }
  }

  private createCrosswalk(x: number, z: number) {
    const crosswalkMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const stripeWidth = 0.4;
    const stripeLength = 3;
    const gap = 0.4;

    // Horizontal crosswalk stripes
    for (let i = 0; i < 8; i++) {
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(stripeLength, stripeWidth),
        crosswalkMaterial
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(
        x + (i - 3.5) * (stripeWidth + gap),
        0.04,
        z
      );
      this.scene.add(stripe);
    }

    // Vertical crosswalk stripes
    for (let i = 0; i < 8; i++) {
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(stripeWidth, stripeLength),
        crosswalkMaterial
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(
        x,
        0.04,
        z + (i - 3.5) * (stripeWidth + gap)
      );
      this.scene.add(stripe);
    }
  }

  private createStopLines() {
    const stopLineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const numBlocks = this.citySize / this.buildingBlockSize;

    for (let i = -numBlocks / 2; i < numBlocks / 2; i++) {
      const offset = i * this.buildingBlockSize;
      
      // Stop lines for horizontal roads
      const hStopLine = new THREE.Mesh(
        new THREE.PlaneGeometry(this.roadWidth, 0.4),
        stopLineMaterial
      );
      hStopLine.rotation.x = -Math.PI / 2;
      hStopLine.position.set(0, 0.03, offset - this.roadWidth / 2 - 0.2);
      this.scene.add(hStopLine);

      // Stop lines for vertical roads
      const vStopLine = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, this.roadWidth),
        stopLineMaterial
      );
      vStopLine.rotation.x = -Math.PI / 2;
      vStopLine.position.set(offset - this.roadWidth / 2 - 0.2, 0.03, 0);
      this.scene.add(vStopLine);
    }
  }
} 