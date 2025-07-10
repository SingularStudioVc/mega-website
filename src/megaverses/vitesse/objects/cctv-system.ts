import * as THREE from 'three';
import { CCTVCamera } from './cctv-camera';

export class CCTVSystem {
  private scene: THREE.Scene;
  private cameras: CCTVCamera[] = [];
  private buildingBlockSize: number;
  private citySize: number;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildingBlockSize = 40;
    this.citySize = 200;
  }

  createCCTVSystem() {
    const numBlocks = this.citySize / this.buildingBlockSize;
    
    // Place cameras at intersections on poles
    for (let i = -numBlocks / 2; i < numBlocks / 2; i++) {
      for (let j = -numBlocks / 2; j < numBlocks / 2; j++) {
        const x = i * this.buildingBlockSize;
        const z = j * this.buildingBlockSize;
        
        // Place camera at intersection
        this.createIntersectionCamera(x, z);
      }
    }

    // Place additional cameras along roads on poles
    this.createRoadCameras();

    return this.cameras;
  }

  private createIntersectionCamera(x: number, z: number) {
    const camera = new CCTVCamera();
    
    // Position camera pole near the intersection (close to road)
    const cameraX = x + 6; // 6 units from road center
    const cameraZ = z + 6; // 6 units from road center
    const cameraY = 0; // Pole starts at ground level
    
    camera.position.set(cameraX, cameraY, cameraZ);
    
    // Make camera look towards the intersection
    const target = new THREE.Vector3(x, 2, z); // Look at intersection at car height
    camera.lookAtTarget(target);
    
    // Add some random rotation for variety
    camera.rotation.y += (Math.random() - 0.5) * 0.3;
    
    this.scene.add(camera);
    this.cameras.push(camera);
  }

  private createRoadCameras() {
    const numBlocks = this.citySize / this.buildingBlockSize;
    
    // Place cameras along horizontal roads
    for (let i = -numBlocks / 2; i < numBlocks / 2; i++) {
      const roadZ = i * this.buildingBlockSize;
      
      // Place cameras at regular intervals along the road
      for (let j = -2; j <= 2; j++) {
        const cameraX = j * 40; // Every 40 units
        const cameraZ = roadZ + 6; // 6 units from road center
        
        if (Math.abs(cameraX) <= this.citySize / 2) {
          this.createRoadCamera(cameraX, cameraZ, 0); // 0 = horizontal road
        }
      }
    }
    
    // Place cameras along vertical roads
    for (let i = -numBlocks / 2; i < numBlocks / 2; i++) {
      const roadX = i * this.buildingBlockSize;
      
      // Place cameras at regular intervals along the road
      for (let j = -2; j <= 2; j++) {
        const cameraZ = j * 40; // Every 40 units
        const cameraX = roadX + 6; // 6 units from road center
        
        if (Math.abs(cameraZ) <= this.citySize / 2) {
          this.createRoadCamera(cameraX, cameraZ, 1); // 1 = vertical road
        }
      }
    }
  }

  private createRoadCamera(x: number, z: number, roadType: number) {
    const camera = new CCTVCamera();
    
    const cameraY = 0; // Pole starts at ground level
    camera.position.set(x, cameraY, z);
    
    // Make camera look along the road
    if (roadType === 0) {
      // Horizontal road - look along X axis
      const target = new THREE.Vector3(x + 20, 2, z);
      camera.lookAtTarget(target);
    } else {
      // Vertical road - look along Z axis
      const target = new THREE.Vector3(x, 2, z + 20);
      camera.lookAtTarget(target);
    }
    
    // Add some random rotation for variety
    camera.rotation.y += (Math.random() - 0.5) * 0.2;
    
    this.scene.add(camera);
    this.cameras.push(camera);
  }

  update() {
    // Update all cameras (blinking lights, etc.)
    this.cameras.forEach(camera => {
      camera.update();
    });
  }
} 