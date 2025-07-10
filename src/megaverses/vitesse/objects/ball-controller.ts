import * as THREE from 'three';
import { createMegaBall, createBallShadow } from '../../shared/objects/ball';

export class BallController {
  private ballPosition: THREE.Vector3;
  private ballVelocity: THREE.Vector3;
  private ballHeading: number;
  private ballRadius: number;
  private ballMaxSpeed: number;
  private ballAcceleration: number;
  private ballFriction: number;
  private ballTurnSpeed: number;
  private ballRollAngle: number;
  private keys: { [key: string]: boolean };
  private planeSize: number;
  private sphere: THREE.Mesh | null = null;
  private shadowMesh: THREE.Mesh | null = null;
  private buildings: THREE.Mesh[];
  private stuckTimer: number = 0;
  private lastPosition: THREE.Vector3;

  constructor(buildings: THREE.Mesh[] = []) {
    // Start ball on a road (at intersection where roads cross)
    this.ballPosition = new THREE.Vector3(0, 1, 0); // Center intersection
    this.ballVelocity = new THREE.Vector3(0, 0, 0);
    this.ballHeading = 0;
    this.ballRadius = 1;
    this.ballMaxSpeed = 180;
    this.ballAcceleration = 400;
    this.ballFriction = 8;
    this.ballTurnSpeed = Math.PI * 1.2;
    this.ballRollAngle = 0;
    this.keys = {};
    this.planeSize = 200;
    this.buildings = buildings;
    this.lastPosition = this.ballPosition.clone();
  }

  createBall(scene: THREE.Scene) {
    this.sphere = createMegaBall();
    this.sphere.position.copy(this.ballPosition);
    scene.add(this.sphere);

    this.shadowMesh = createBallShadow();
    scene.add(this.shadowMesh);

    this.setupInputListeners();
  }

  private setupInputListeners() {
    const onKeyDown = (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = true;
      
      // Reset ball if stuck and player presses R
      if (e.key.toLowerCase() === 'r') {
        console.log('Manual reset triggered');
        this.resetBall();
      }
      
      // Debug: Show ball position
      if (e.key.toLowerCase() === 'p') {
        console.log(`Ball position: (${this.ballPosition.x.toFixed(1)}, ${this.ballPosition.z.toFixed(1)})`);
        console.log(`Is inside building area: ${this.isInsideBuildingArea()}`);
      }
    };
    
    const onKeyUp = (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Store references for cleanup
    this.onKeyDown = onKeyDown;
    this.onKeyUp = onKeyUp;
  }

  private onKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private onKeyUp: ((e: KeyboardEvent) => void) | null = null;

  private resetBall() {
    // Reset ball to a safe position on a road intersection
    // Roads are at positions like -100, -60, -20, 0, 20, 60, 100
    // So intersections are at (0,0), (20,20), (-20,20), etc.
    const safePositions = [
      new THREE.Vector3(0, 1, 0),      // Center intersection
      new THREE.Vector3(20, 1, 20),    // NE intersection
      new THREE.Vector3(-20, 1, 20),   // NW intersection
      new THREE.Vector3(20, 1, -20),   // SE intersection
      new THREE.Vector3(-20, 1, -20),  // SW intersection
      new THREE.Vector3(60, 1, 0),     // East road
      new THREE.Vector3(-60, 1, 0),    // West road
      new THREE.Vector3(0, 1, 60),     // North road
      new THREE.Vector3(0, 1, -60),    // South road
    ];
    
    // Pick a random safe position
    const randomIndex = Math.floor(Math.random() * safePositions.length);
    this.ballPosition.copy(safePositions[randomIndex]);
    
    this.ballVelocity.set(0, 0, 0);
    this.ballHeading = 0;
    this.stuckTimer = 0;
    
    if (this.sphere) {
      this.sphere.position.copy(this.ballPosition);
    }
    if (this.shadowMesh) {
      this.shadowMesh.position.x = this.ballPosition.x;
      this.shadowMesh.position.z = this.ballPosition.z;
    }
  }

  update(deltaTime: number) {
    // Mario Kart-like controls
    let accelerating = false;
    let braking = false;
    if (this.keys['arrowup'] || this.keys['w']) accelerating = true;
    if (this.keys['arrowdown'] || this.keys['s']) braking = true;
    let turnLeft = this.keys['arrowleft'] || this.keys['a'];
    let turnRight = this.keys['arrowright'] || this.keys['d'];

    // Simple turning
    const speed = Math.hypot(this.ballVelocity.x, this.ballVelocity.z);
    if ((accelerating || speed > 0.1) && turnLeft) {
      this.ballHeading += this.ballTurnSpeed * deltaTime;
    }
    if ((accelerating || speed > 0.1) && turnRight) {
      this.ballHeading -= this.ballTurnSpeed * deltaTime;
    }

    // Forward/backward acceleration
    let forward = new THREE.Vector3(-Math.sin(this.ballHeading), 0, -Math.cos(this.ballHeading));
    
    if (accelerating) {
      this.ballVelocity.x += forward.x * this.ballAcceleration * deltaTime;
      this.ballVelocity.z += forward.z * this.ballAcceleration * deltaTime;
    }
    if (braking) {
      this.ballVelocity.x -= forward.x * this.ballAcceleration * 0.7 * deltaTime;
      this.ballVelocity.z -= forward.z * this.ballAcceleration * 0.7 * deltaTime;
    }

    // Friction
    this.ballVelocity.x -= this.ballVelocity.x * Math.min(1, this.ballFriction * deltaTime);
    this.ballVelocity.z -= this.ballVelocity.z * Math.min(1, this.ballFriction * deltaTime);
    
    // Clamp speed
    const newSpeed = Math.hypot(this.ballVelocity.x, this.ballVelocity.z);
    if (newSpeed > this.ballMaxSpeed) {
      this.ballVelocity.x = (this.ballVelocity.x / newSpeed) * this.ballMaxSpeed;
      this.ballVelocity.z = (this.ballVelocity.z / newSpeed) * this.ballMaxSpeed;
    }
    
    // Update position
    const previousBallPosition = this.ballPosition.clone();
    this.ballPosition.add(this.ballVelocity.clone().multiplyScalar(deltaTime));
    
    // Keep ball on the plane
    this.ballPosition.x = Math.max(-this.planeSize/2 + this.ballRadius, Math.min(this.planeSize/2 - this.ballRadius, this.ballPosition.x));
    this.ballPosition.z = Math.max(-this.planeSize/2 + this.ballRadius, Math.min(this.planeSize/2 - this.ballRadius, this.ballPosition.z));

    // Improved collision detection with buildings
    if (this.sphere) {
      let collisionDetected = false;
      
      // Use a larger collision radius to detect collisions earlier
      const collisionRadius = this.ballRadius + 1;
      
      for (const building of this.buildings) {
        // Get building bounds
        const buildingBox = new THREE.Box3().setFromObject(building);
        const buildingCenter = building.position.clone();
        const buildingSize = buildingBox.getSize(new THREE.Vector3());
        
        // Calculate distance from ball to building center
        const distanceToBuilding = this.ballPosition.distanceTo(buildingCenter);
        const minDistance = collisionRadius + Math.max(buildingSize.x, buildingSize.z) / 2;
        
        if (distanceToBuilding < minDistance) {
          collisionDetected = true;
          
          // Calculate push direction (from building center to ball)
          const pushDirection = this.ballPosition.clone().sub(buildingCenter).normalize();
          
          // Push ball to safe distance from building
          const safeDistance = minDistance + 1; // Extra buffer
          this.ballPosition.copy(buildingCenter).add(pushDirection.multiplyScalar(safeDistance));
          
          // Bounce effect - reverse velocity component towards building
          const velocityTowardsBuilding = this.ballVelocity.dot(pushDirection);
          if (velocityTowardsBuilding < 0) {
            this.ballVelocity.add(pushDirection.multiplyScalar(-velocityTowardsBuilding * 1.5));
          }
          
          // Reduce overall velocity for bounce effect
          this.ballVelocity.multiplyScalar(0.5);
          
          console.log('Collision detected! Ball pushed away from building');
          break;
        }
      }
      
      // Check if ball is stuck (not moving and inside a building area)
      if (newSpeed < 0.5 && this.isInsideBuildingArea()) {
        this.stuckTimer += deltaTime;
        console.log(`Ball stuck for ${this.stuckTimer.toFixed(1)} seconds`);
        if (this.stuckTimer > 2.0) { // Reset after 2 seconds of being stuck
          console.log('Auto-resetting stuck ball');
          this.resetBall();
        }
      } else {
        this.stuckTimer = 0;
      }
      
      // Emergency check: if ball is actually inside a building, force reset
      if (this.isBallInsideBuilding()) {
        console.log('Emergency: Ball detected inside building, forcing reset');
        this.resetBall();
      }
    }

    // Update ball and shadow positions
    if (this.sphere && this.shadowMesh) {
      this.sphere.position.copy(this.ballPosition);
      this.shadowMesh.position.x = this.ballPosition.x;
      this.shadowMesh.position.z = this.ballPosition.z;
    }

    // Perfect ball rolling animation
    if (newSpeed > 0.001 && this.sphere) {
      // Calculate the direction of movement
      const moveDirection = this.ballVelocity.clone().normalize();
      
      // Roll axis is perpendicular to movement direction (like a real ball)
      const rollAxis = new THREE.Vector3(-moveDirection.z, 0, moveDirection.x).normalize();
      
      // Accumulate roll angle based on distance traveled
      this.ballRollAngle += newSpeed * deltaTime / this.ballRadius;
      
      // Reset sphere rotation and apply accumulated roll
      this.sphere.rotation.set(0, 0, 0);
      this.sphere.rotateOnWorldAxis(rollAxis, this.ballRollAngle);
    } else if (this.sphere) {
      // Reset roll angle when stopped
      this.ballRollAngle = 0;
    }
    
    // Simple Mario Kart-style visual effects
    if (this.sphere) {
      const stretch = 1 + Math.min(0.3, newSpeed / this.ballMaxSpeed * 0.3);
      const squash = 1 - Math.min(0.15, newSpeed / this.ballMaxSpeed * 0.15);
      this.sphere.scale.set(squash, stretch, squash);
    }

    this.lastPosition = this.ballPosition.clone();

    return {
      position: this.ballPosition.clone(),
      speed: newSpeed,
      maxSpeed: this.ballMaxSpeed
    };
  }

  private isInsideBuildingArea(): boolean {
    // Check if ball is in a building corner area (not on roads)
    const x = Math.round(this.ballPosition.x / 40) * 40; // Snap to road grid
    const z = Math.round(this.ballPosition.z / 40) * 40;
    
    // Check if ball is close to a road center
    const distanceToRoadX = Math.abs(this.ballPosition.x - x);
    const distanceToRoadZ = Math.abs(this.ballPosition.z - z);
    
    // Ball is inside building area if it's NOT within 8 units of a road center
    return distanceToRoadX > 8 && distanceToRoadZ > 8;
  }

  private isBallInsideBuilding(): boolean {
    // Check if ball is actually inside any building
    for (const building of this.buildings) {
      const buildingBox = new THREE.Box3().setFromObject(building);
      const buildingCenter = building.position.clone();
      const buildingSize = buildingBox.getSize(new THREE.Vector3());
      
      // Check if ball is within building bounds
      const halfWidth = buildingSize.x / 2;
      const halfDepth = buildingSize.z / 2;
      
      const ballX = this.ballPosition.x;
      const ballZ = this.ballPosition.z;
      const buildingX = buildingCenter.x;
      const buildingZ = buildingCenter.z;
      
      // Check if ball is inside building rectangle
      if (Math.abs(ballX - buildingX) < halfWidth && Math.abs(ballZ - buildingZ) < halfDepth) {
        console.log(`Ball inside building at (${buildingX}, ${buildingZ})`);
        return true;
      }
    }
    return false;
  }

  getPosition() {
    return this.ballPosition.clone();
  }

  getHeading() {
    return this.ballHeading;
  }

  cleanup() {
    if (this.onKeyDown) {
      window.removeEventListener('keydown', this.onKeyDown);
    }
    if (this.onKeyUp) {
      window.removeEventListener('keyup', this.onKeyUp);
    }
  }
} 