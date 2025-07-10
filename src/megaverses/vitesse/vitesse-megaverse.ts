import * as THREE from 'three';
import { Car } from './objects/car';
import { RoadSystem } from './objects/road-system';
import { CityBuilder } from './objects/city-builder';
import { BallController } from './objects/ball-controller';
import { CameraController } from './objects/camera-controller';
import { CCTVSystem } from './objects/cctv-system';

let vitesse3DActive = false;
let threeContainer: HTMLDivElement | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let animationId: number | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let scene: THREE.Scene | null = null;
let ballController: BallController | null = null;
let cameraController: CameraController | null = null;
let cctvSystem: CCTVSystem | null = null;
let cars: Car[] = [];

export function showVitesseMegaverse() {
  if (vitesse3DActive) return;
  vitesse3DActive = true;

  // Create overlay container
  threeContainer = document.createElement('div');
  threeContainer.id = 'vitesse-3d-overlay';
  Object.assign(threeContainer.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    zIndex: '99999',
    background: 'rgba(0,0,0,0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  });
  document.body.appendChild(threeContainer);
  document.body.style.overflow = 'hidden';

  // Setup Three.js scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x10131a);
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 50, 150);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  threeContainer.appendChild(renderer.domElement);

  // Setup lighting
  setupLighting();

  // Create road system (fixes flickering with proper z-fighting prevention)
  const roadSystem = new RoadSystem(scene);
  roadSystem.createRoadSystem();

  // Create city with buildings
  const cityBuilder = new CityBuilder(scene);
  const buildings = cityBuilder.createCity();

  // Create ball controller
  ballController = new BallController(buildings);
  ballController.createBall(scene);

  // Create camera controller
  cameraController = new CameraController(camera);

  // Create CCTV system
  cctvSystem = new CCTVSystem(scene);
  cctvSystem.createCCTVSystem();

  // Create cars
  createCars();

  // Animation loop
  let lastTime = 0;
  function animate(currentTime: number) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Update ball
    if (ballController) {
      const ballData = ballController.update(deltaTime);
      
      // Update camera
      if (cameraController) {
        cameraController.update(ballData.position, ballData.speed, ballData.maxSpeed, ballController.getHeading());
      }
    }

    // Update cars
    cars.forEach(car => car.update(deltaTime));

    // Update CCTV cameras
    if (cctvSystem) {
      cctvSystem.update(deltaTime);
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
    animationId = requestAnimationFrame(animate);
  }
  animate(0);

  // Setup event listeners
  setupEventListeners();
}

function setupLighting() {
  if (!scene) return;

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);
  
  const dir = new THREE.DirectionalLight(0xffffff, 1.1);
  dir.position.set(8, 18, 10);
  dir.castShadow = true;
  dir.shadow.mapSize.width = 1024;
  dir.shadow.mapSize.height = 1024;
  dir.shadow.camera.near = 1;
  dir.shadow.camera.far = 50;
  dir.shadow.camera.left = -20;
  dir.shadow.camera.right = 20;
  dir.shadow.camera.top = 20;
  dir.shadow.camera.bottom = -20;
  scene.add(dir);
}

function createCars() {
  if (!scene) return;

  const carColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

  // Define a simple square path for cars
  const carPath: THREE.Vector3[] = [
    new THREE.Vector3(-90, 0.5, -90),
    new THREE.Vector3(90, 0.5, -90),
    new THREE.Vector3(90, 0.5, 90),
    new THREE.Vector3(-90, 0.5, 90),
  ];

  for (let i = 0; i < 10; i++) {
    const color = carColors[Math.floor(Math.random() * carColors.length)];
    const speed = Math.random() * 10 + 5; // Random speed between 5 and 15
    const car = new Car(color, speed, carPath);
    
    // Offset initial position to spread cars out
    const offsetIndex = Math.floor(Math.random() * carPath.length);
    car.position.copy(carPath[offsetIndex]);
    car.setInitialState(offsetIndex);
    
    cars.push(car);
    scene.add(car);
  }
}

function setupEventListeners() {
  // Close on click or Escape
  function close3D() {
    if (!vitesse3DActive) return;
    vitesse3DActive = false;
    
    if (animationId) cancelAnimationFrame(animationId);
    if (ballController) ballController.cleanup();
    
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
    }
    if (threeContainer) {
      document.body.removeChild(threeContainer);
      threeContainer = null;
    }
    document.body.style.overflow = '';
    
    // Clean up event listeners
    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', onKey);
  }

  threeContainer?.addEventListener('click', close3D);
  
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') close3D();
  }
  window.addEventListener('keydown', onKey);
  
  function onResize() {
    if (!renderer || !camera || !cameraController) return;
    cameraController.handleResize();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);
}
