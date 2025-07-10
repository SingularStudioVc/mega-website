import * as THREE from 'three';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private cameraShake: number = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  update(ballPosition: THREE.Vector3, ballSpeed: number, ballMaxSpeed: number, ballHeading: number) {
    // Simple Mario Kart-style camera system
    const camOffset = new THREE.Vector3(0, 6, 14);
    const speedFactor = Math.min(1, ballSpeed / ballMaxSpeed);
    camOffset.z += speedFactor * 3; // Pull back camera at high speeds
    
    // Calculate camera direction based on ball heading
    const camDir = new THREE.Vector3(-Math.sin(ballHeading), 0, -Math.cos(ballHeading));
    const camPos = ballPosition.clone().add(camDir.clone().multiplyScalar(-camOffset.z)).add(new THREE.Vector3(0, camOffset.y, 0));
    
    // Simple camera shake based on speed
    this.cameraShake = Math.min(1, ballSpeed / ballMaxSpeed) * 0.15;
    camPos.x += (Math.random() - 0.5) * this.cameraShake;
    camPos.y += (Math.random() - 0.5) * this.cameraShake * 0.5;
    
    // Dynamic FOV for Mario Kart feel
    const baseFov = 60;
    const maxFov = 82;
    const targetFov = baseFov + (maxFov - baseFov) * speedFactor;
    this.camera.fov += (targetFov - this.camera.fov) * 0.15;
    this.camera.updateProjectionMatrix();
    
    // Smooth camera following
    this.camera.position.lerp(camPos, 0.18);
    this.camera.lookAt(ballPosition.clone().add(new THREE.Vector3(0, 1, 0)));
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
} 