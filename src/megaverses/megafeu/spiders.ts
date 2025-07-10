import * as THREE from 'three';
import { createRoboticSpider, extinguishFlamesNear } from './forest';
import type { RoboticSpiderInstance } from './forest';

export interface SpiderState {
  from: THREE.Vector3;
  to: THREE.Vector3;
  t: number;
  speed: number;
  direction: 1 | -1;
  phase: 'toTree' | 'spray' | 'toLake' | 'wait';
  sprayTime: number;
  waitTime: number;
  water: number;
  needsResupply: boolean;
}

export interface SpiderInstance {
  instance: RoboticSpiderInstance;
  state: SpiderState;
}

export class SpiderManager {
  private spiders: SpiderInstance[] = [];
  private treeCanopies: THREE.Vector3[] = [];
  private groundPlane: THREE.Mesh | null = null;
  private readonly SPIDER_WATER_CAPACITY = 3;

  constructor() {
    this.spiders = [];
    this.treeCanopies = [];
  }

  public setTreeCanopies(canopies: THREE.Vector3[]): void {
    this.treeCanopies = canopies;
  }

  public setGroundPlane(plane: THREE.Mesh): void {
    this.groundPlane = plane;
  }

  public createSpiders(scene: THREE.Scene, count: number = 3): void {
    for (let i = 0; i < count; i++) {
      // Start in the forest (not lake) - ensure they're in the forest area
      let from;
      do {
        from = this.treeCanopies[Math.floor(Math.random() * this.treeCanopies.length)].clone();
      } while (from.x <= 20 && from.z <= 20); // More restrictive to avoid lake area
      from.y = 1.1;
      
      // Pick a random tree as target (also in forest)
      let to;
      do {
        to = this.treeCanopies[Math.floor(Math.random() * this.treeCanopies.length)].clone();
      } while (to.distanceTo(from) < 8 || (to.x <= 20 && to.z <= 20)); // Ensure target is also in forest
      to.y = 1.1;
      
      const instance = createRoboticSpider(3);
      
      // Position spider at the correct ground height immediately
      if (this.groundPlane) {
        const raycaster = new THREE.Raycaster();
        const origin = new THREE.Vector3(from.x, 100, from.z);
        const direction = new THREE.Vector3(0, -1, 0);
        raycaster.set(origin, direction);

        const intersects = raycaster.intersectObject(this.groundPlane, true);
        if (intersects.length > 0) {
          from.y = intersects[0].point.y + 2.3;
        }
      }
      
      instance.group.position.copy(from);
      scene.add(instance.group);
      
      this.spiders.push({
        instance,
        state: {
          from,
          to,
          t: 0, // Start immediately
          speed: 0.3 + Math.random() * 0.2, // Even faster speed
          direction: 1,
          phase: 'wait', // Start in wait mode instead of toTree
          sprayTime: 0,
          waitTime: 0,
          water: 0, // Start with no water
          needsResupply: true, // Immediately need resupply
        }
      });
      
      // Since spiders start in wait mode with no water, they don't need a target yet
      // The target will be set when they get resupplied and start moving to trees
    }
  }

  public update(deltaTime: number, currentTime: number, scene: THREE.Scene): number {
    let sprayingSpider = -1;
    
    for (let s = 0; s < this.spiders.length; s++) {
      const spiderObj = this.spiders[s];
      const { instance, state } = spiderObj;
      
      // Move spider along its path
      if (state.phase === 'toTree') {
        state.t += state.speed * deltaTime;
        if (state.t >= 1) {
          state.t = 1;
          if (state.water > 0) {
            state.phase = 'spray';
            state.sprayTime = 0;
            sprayingSpider = s;
            instance.spray.visible = true;
          } else {
            state.phase = 'wait';
            state.waitTime = 9999; // Wait for drone
            state.needsResupply = true;
          }
        }
        // Ensure spider is actually moving
        if (state.t < 1) {
          instance.group.position.lerpVectors(state.from, state.to, state.t);
        } else {
          // Spider reached target, ensure it's at the correct position
          instance.group.position.copy(state.to);
        }
      } else if (state.phase === 'spray') {
        state.sprayTime += deltaTime;
        sprayingSpider = s;
        instance.spray.visible = true;
        
        // Animate spray drops
        for (const drop of instance.spray.children) {
          if (drop instanceof THREE.Mesh && drop.material instanceof THREE.MeshStandardMaterial) {
            drop.position.z -= deltaTime * 3.5;
            drop.material.opacity = 0.6 * (1 - state.sprayTime / 1.2);
          }
        }
        
        if (state.sprayTime > 1.2) {
          state.water--;
          extinguishFlamesNear(instance.group.position, 4, scene);
          if (state.water <= 0) {
            state.phase = 'wait';
            state.waitTime = 9999;
            state.needsResupply = true;
          } else {
            state.phase = 'wait';
            state.waitTime = 0.3 + Math.random() * 0.8; // Shorter wait time
          }
          instance.spray.visible = false;
          
          // Reset spray drops
          for (const drop of instance.spray.children) {
            if (drop instanceof THREE.Mesh && drop.material instanceof THREE.MeshStandardMaterial) {
              drop.position.z = -1.2 - Math.random() * 1.2;
              drop.material.opacity = 0.6;
            }
          }
        }
      } else if (state.phase === 'wait') {
        if (!state.needsResupply) {
          state.waitTime -= deltaTime;
          if (state.waitTime <= 0) {
            // Pick a new random tree
            if (this.treeCanopies.length > 0) {
              let to;
              do {
                to = this.treeCanopies[Math.floor(Math.random() * this.treeCanopies.length)].clone();
              } while (to.distanceTo(state.from) < 8 || (to.x <= 20 && to.z <= 20));
              to.y = state.from.y; // Use the corrected Y position
              state.to = to;
              state.from = instance.group.position.clone();
              state.t = 0;
              state.phase = 'toTree';
            }
          }
        }
        // If needs resupply, just wait for drone (no movement)
      }
      
      // Interpolate position (fallback)
      if (state.phase === 'toTree' && state.t < 1) {
        instance.group.position.lerpVectors(state.from, state.to, state.t);
      }
      
      // Adjust spider Y position to follow ground
      if (this.groundPlane) {
        const raycaster = new THREE.Raycaster();
        const origin = new THREE.Vector3(instance.group.position.x, 100, instance.group.position.z); // Start high above the spider
        const direction = new THREE.Vector3(0, -1, 0); // Ray points downwards
        raycaster.set(origin, direction);

        const intersects = raycaster.intersectObject(this.groundPlane, true);
        if (intersects.length > 0) {
          instance.group.position.y = intersects[0].point.y + 2.3; // Adjusted offset to prevent clipping
        }
      }
      
      // Face movement direction
      const dir = state.to.clone().sub(state.from).setY(0).normalize();
      if (dir.lengthSq() > 0.001) {
        const angle = Math.atan2(dir.x, dir.z);
        instance.group.rotation.y = angle;
      }
      
      // Animate legs with a walking gait (only when moving)
      const walkPhase = (state.t * Math.PI * 2 * 2 + currentTime * 0.003) * (state.phase === 'toTree' ? 1 : 0);
      for (let i = 0; i < instance.legs.length; i++) {
        const leg = instance.legs[i];
        // Swing legs in pairs
        const phase = walkPhase + (i % 2 === 0 ? 0 : Math.PI);
        leg.rotation.x = Math.sin(phase) * 0.5;
        leg.rotation.z = Math.cos(phase + i) * 0.3 + (i - 3.5) * 0.18;
      }
    }
    
    return sprayingSpider;
  }

  public getSpiders(): SpiderInstance[] {
    return this.spiders;
  }

  public resupplySpider(spiderIndex: number): void {
    if (spiderIndex >= 0 && spiderIndex < this.spiders.length) {
      const spider = this.spiders[spiderIndex];
      spider.state.water = this.SPIDER_WATER_CAPACITY;
      spider.state.needsResupply = false;
      spider.state.phase = 'wait';
      spider.state.waitTime = 0.4 + Math.random() * 0.8; // Faster response after resupply
    }
  }
}
 