import * as THREE from 'three';
import { Building } from './building';

export class CityBuilder {
  private scene: THREE.Scene;
  private buildingBlockSize: number;
  private citySize: number;
  private buildings: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildingBlockSize = 40;
    this.citySize = 200;
  }

  createCity() {
    const numBlocks = this.citySize / this.buildingBlockSize;
    
    // Roads are at the center of each block, so buildings go in the corners
    // Each corner area is between two roads
    for (let i = -numBlocks / 2; i < numBlocks / 2; i++) {
      for (let j = -numBlocks / 2; j < numBlocks / 2; j++) {
        // Calculate the center of this corner area
        const cornerX = (i * this.buildingBlockSize) + (this.buildingBlockSize / 2);
        const cornerZ = (j * this.buildingBlockSize) + (this.buildingBlockSize / 2);
        
        // Create buildings in this corner area
        this.createCornerBuildings(cornerX, cornerZ);
      }
    }

    return this.buildings;
  }

  private createCornerBuildings(cornerX: number, cornerZ: number) {
    const numBuildings = Math.floor(Math.random() * 3) + 1; // 1-3 buildings per corner
    const cornerSize = this.buildingBlockSize / 2; // Half the block size for the corner area
    
    for (let i = 0; i < numBuildings; i++) {
      // Place buildings randomly within the corner area, avoiding roads
      const buildingX = cornerX + (Math.random() - 0.5) * (cornerSize - 8); // Leave 4 units margin from roads
      const buildingZ = cornerZ + (Math.random() - 0.5) * (cornerSize - 8);
      
      // Ensure building doesn't get too close to roads
      const maxWidth = Math.min(12, cornerSize - 8);
      const maxDepth = Math.min(12, cornerSize - 8);

      this.createRandomBuilding(buildingX, buildingZ, maxWidth, maxDepth);
    }
  }

  private createRandomBuilding(x: number, z: number, maxWidth: number, maxDepth: number) {
    const width = Math.random() * (maxWidth - 4) + 4;
    const depth = Math.random() * (maxDepth - 4) + 4;
    const height = Math.random() * 20 + 8; // 8-28 units tall
    
    const buildingColors = [
      0x888888, // Gray
      0x666666, // Dark gray
      0xaaaaaa, // Light gray
      0x444444, // Very dark gray
      0x999999, // Medium gray
    ];
    
    const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
    const hasWindows = Math.random() > 0.1; // 90% chance of having windows

    const building = new Building(width, height, depth, color, hasWindows);
    building.position.set(x, 0, z);
    
    // Add some random rotation for variety
    building.rotation.y = Math.random() * Math.PI * 2;
    
    this.scene.add(building);
    
    // Store building meshes for collision detection
    building.children.forEach(child => {
      if (child instanceof THREE.Mesh) {
        this.buildings.push(child);
      }
    });
  }
} 