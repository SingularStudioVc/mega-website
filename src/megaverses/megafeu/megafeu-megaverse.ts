import * as THREE from 'three';
import { addForestToScene, animateForestFlames } from './forest';
import { addLakeToScene } from './lake';
import { addMountainsToScene } from '../shared/objects/mountains';
import { createDrone } from './drone';
import { createMegaBall, createBallShadow } from '../shared/objects/ball';
import { createGround } from '../shared/objects/ground';
import { SpiderManager } from './spiders';

let mega3DActive = false;
let threeContainer: HTMLDivElement | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let animationId: number | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let scene: THREE.Scene | null = null;
let plane: THREE.Mesh | null = null; // Make plane globally accessible

// Ball position, velocity, and heading
let ballPosition = new THREE.Vector3(0, 1, 0); // y=1 so it sits on the plane
let ballVelocity = new THREE.Vector3(0, 0, 0);
let ballHeading = 0; // radians, 0 = forward (negative Z)
const ballRadius = 1;
const ballMaxSpeed = 180; // units per second (Mario Kart speed)
const ballAcceleration = 400; // units per second^2 (responsive acceleration)
const ballFriction = 8; // friction per second
const ballTurnSpeed = Math.PI * 1.2; // radians per second (responsive turning)
const keys: { [key: string]: boolean } = {};
const planeSize = 100;
let ballRollAngle = 0; // accumulated roll angle for smooth rotation

// Camera follow and speed effects
let cameraShake = 0;

// Spider manager
const spiderManager = new SpiderManager();

// Store tree canopy positions for spider targets
let treeCanopies: THREE.Vector3[] = [];

// Drone state
const drones: Array<{
  group: THREE.Group,
  state: {
    phase: 'idle' | 'toSpider' | 'resupply' | 'toLake' | 'descend' | 'ascend' | 'toLakeHigh',
    spiderIdx: number | null,
    t: number,
    speed: number,
    from: THREE.Vector3,
    to: THREE.Vector3,
    waitTime: number,
    lakePos: THREE.Vector3,
    baseY: number,
  }
}> = [];
const DRONE_COUNT = 10;

export function showMegafeuMegaverse() {
  if (mega3DActive) return;
  mega3DActive = true;

  // Create overlay container
  threeContainer = document.createElement('div');
  threeContainer.id = 'mega-3d-overlay';
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
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 10, 15);
  camera.lookAt(0, 1, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  threeContainer.appendChild(renderer.domElement);

  // Define lake properties
  const lakePosition = new THREE.Vector3(-30, 0, 30); // Keep depression here
  const lakeSize = 60;

  // Add the ground plane with a depression for the lake
  plane = createGround(lakePosition, lakeSize);
  scene.add(plane);

  // Add the lake
  addLakeToScene(scene);

  // Add the forest and collect tree canopies
  addForestToScene(scene);
  // Collect tree canopies for spider targets
  treeCanopies = [];
  scene.traverse(obj => {
    if (!(obj instanceof THREE.Mesh)) return;
    const mat = obj.material as THREE.Material | THREE.Material[];
    if (Array.isArray(mat)) return;
    if ('color' in mat && (mat as any).color.getHex() === 0x2d6a4f) {
      treeCanopies.push(obj.position.clone());
    }
  });

  // Add drones at the lake
  for (let i = 0; i < DRONE_COUNT; i++) {
    const group = createDrone(2.2);
    const from = new THREE.Vector3(-40 + Math.random() * 20, 7 + Math.random() * 2, -40 + Math.random() * 20);
    group.position.copy(from);
    scene.add(group);
    drones.push({
      group,
      state: {
        phase: 'toLake',
        spiderIdx: null,
        t: 0,
        speed: 0.22 + Math.random() * 0.08,
        from,
        to: from.clone(),
        waitTime: 0,
        lakePos: new THREE.Vector3(-40 + Math.random() * 20, 1.5, -40 + Math.random() * 20),
        baseY: from.y,
      }
    });
  }

  // Add 3 robotic spiders in the forest
  spiderManager.setTreeCanopies(treeCanopies);
  spiderManager.createSpiders(scene, 6);
  if (plane) {
    spiderManager.setGroundPlane(plane);
  }

  // Add the mountains
  addMountainsToScene(scene);

  // Add the MEGA ball and shadow
  const sphere = createMegaBall();
  sphere.position.copy(ballPosition);
  scene.add(sphere);

  const shadowMesh = createBallShadow();
  scene.add(shadowMesh);

  // Basic lighting
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

  // Input event listeners
  function onKeyDown(e: KeyboardEvent) {
    keys[e.key.toLowerCase()] = true;
  }
  function onKeyUp(e: KeyboardEvent) {
    keys[e.key.toLowerCase()] = false;
  }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // Animation loop
  let lastTime = 0;
  function animate(currentTime: number) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Mario Kart-like controls
    let accelerating = false;
    let braking = false;
    if (keys['arrowup'] || keys['w']) accelerating = true;
    if (keys['arrowdown'] || keys['s']) braking = true;
    let turnLeft = keys['arrowleft'] || keys['a'];
    let turnRight = keys['arrowright'] || keys['d'];

    // Simple turning
    const speed = Math.hypot(ballVelocity.x, ballVelocity.z);
    if ((accelerating || speed > 0.1) && turnLeft) {
      ballHeading += ballTurnSpeed * deltaTime;
    }
    if ((accelerating || speed > 0.1) && turnRight) {
      ballHeading -= ballTurnSpeed * deltaTime;
    }

    // Forward/backward acceleration
    let forward = new THREE.Vector3(-Math.sin(ballHeading), 0, -Math.cos(ballHeading));
    
    if (accelerating) {
      ballVelocity.x += forward.x * ballAcceleration * deltaTime;
      ballVelocity.z += forward.z * ballAcceleration * deltaTime;
    }
    if (braking) {
      ballVelocity.x -= forward.x * ballAcceleration * 0.7 * deltaTime;
      ballVelocity.z -= forward.z * ballAcceleration * 0.7 * deltaTime;
    }

    // Friction
    ballVelocity.x -= ballVelocity.x * Math.min(1, ballFriction * deltaTime);
    ballVelocity.z -= ballVelocity.z * Math.min(1, ballFriction * deltaTime);
    // Clamp speed
    const newSpeed = Math.hypot(ballVelocity.x, ballVelocity.z);
    if (newSpeed > ballMaxSpeed) {
      ballVelocity.x = (ballVelocity.x / newSpeed) * ballMaxSpeed;
      ballVelocity.z = (ballVelocity.z / newSpeed) * ballMaxSpeed;
    }
    // Update position
    ballPosition.add(ballVelocity.clone().multiplyScalar(deltaTime));
    // Keep ball on the plane
    ballPosition.x = Math.max(-planeSize/2 + ballRadius, Math.min(planeSize/2 - ballRadius, ballPosition.x));
    ballPosition.z = Math.max(-planeSize/2 + ballRadius, Math.min(planeSize/2 - ballRadius, ballPosition.z));

    // Adjust ball Y position to follow ground
    if (plane) {
      const raycaster = new THREE.Raycaster();
      const origin = new THREE.Vector3(ballPosition.x, 100, ballPosition.z); // Start high above the ball
      const direction = new THREE.Vector3(0, -1, 0); // Ray points downwards
      raycaster.set(origin, direction);

      const intersects = raycaster.intersectObject(plane, true);
      if (intersects.length > 0) {
        ballPosition.y = intersects[0].point.y + ballRadius;
      }
    }
    sphere.position.copy(ballPosition);
    // Move shadow under the ball
    shadowMesh.position.x = ballPosition.x;
    shadowMesh.position.z = ballPosition.z;

    // Perfect ball rolling animation
    if (newSpeed > 0.001) {
      // Calculate the direction of movement
      const moveDirection = ballVelocity.clone().normalize();
      
      // Roll axis is perpendicular to movement direction (like a real ball)
      // For a ball rolling on a flat surface, the roll axis should be:
      // - perpendicular to the movement direction
      // - parallel to the ground (y = 0)
      const rollAxis = new THREE.Vector3(-moveDirection.z, 0, moveDirection.x).normalize();
      
      // Accumulate roll angle based on distance traveled
      ballRollAngle += newSpeed * deltaTime / ballRadius;
      
      // Reset sphere rotation and apply accumulated roll
      sphere.rotation.set(0, 0, 0);
      sphere.rotateOnWorldAxis(rollAxis, ballRollAngle);
    } else {
      // Reset roll angle when stopped
      ballRollAngle = 0;
    }
    
    // Simple Mario Kart-style visual effects
    const stretch = 1 + Math.min(0.3, newSpeed / ballMaxSpeed * 0.3);
    const squash = 1 - Math.min(0.15, newSpeed / ballMaxSpeed * 0.15);
    sphere.scale.set(squash, stretch, squash);

    // Simple Mario Kart-style camera system
    const camOffset = new THREE.Vector3(0, 6, 14);
    const speedFactor = Math.min(1, newSpeed / ballMaxSpeed);
    camOffset.z += speedFactor * 3; // Pull back camera at high speeds
    
    const camDir = new THREE.Vector3(-Math.sin(ballHeading), 0, -Math.cos(ballHeading));
    const camPos = ballPosition.clone().add(camDir.clone().multiplyScalar(-camOffset.z)).add(new THREE.Vector3(0, camOffset.y, 0));
    
    // Simple camera shake based on speed
    cameraShake = Math.min(1, newSpeed / ballMaxSpeed) * 0.15;
    camPos.x += (Math.random() - 0.5) * cameraShake;
    camPos.y += (Math.random() - 0.5) * cameraShake * 0.5;
    
    if (camera) {
      // Dynamic FOV for Mario Kart feel
      const baseFov = 60;
      const maxFov = 82;
      const targetFov = baseFov + (maxFov - baseFov) * speedFactor;
      camera.fov += (targetFov - camera.fov) * 0.15;
      camera.updateProjectionMatrix();
      
      // Smooth camera following
      camera.position.lerp(camPos, 0.18);
      camera.lookAt(ballPosition.clone().add(new THREE.Vector3(0, 1, 0)));
    }

    // Simple grid movement for speed sensation
    if (plane) {
      const planeMaterial = plane.material as THREE.MeshStandardMaterial;
      if (planeMaterial.map) {
        planeMaterial.map.offset.x += ballVelocity.x * deltaTime * 0.04;
        planeMaterial.map.offset.y += ballVelocity.z * deltaTime * 0.04;
        planeMaterial.map.needsUpdate = true;
      }
    }

    // Animate burning forest flames
    if (scene) animateForestFlames(scene, currentTime / 1000);

    // Animate spiders
    if (scene) {
      spiderManager.update(deltaTime, currentTime, scene);
    }

    // Animate drones - Smart swarm system
    for (const droneObj of drones) {
      const { group, state } = droneObj;
      if (state.phase === 'idle') {
        // Find all spiders that need resupply
        const spiders = spiderManager.getSpiders();
        const needySpiders = spiders
          .map((s, idx) => ({ spider: s, idx }))
          .filter(({ spider }) => spider.state.needsResupply);
        
        if (needySpiders.length > 0) {
          // Find the closest needy spider to this drone
          let closestSpider = null;
          let closestDistance = Infinity; // Start with max distance
          
          for (const { spider, idx } of needySpiders) {
            const distance = group.position.distanceTo(spider.instance.group.position);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestSpider = { spider, idx };
            }
          }
          
          if (closestSpider) {
            // Check if another drone is already heading to this spider
            const spiderBeingHelped = drones.some(d => 
              d !== droneObj && 
              d.state.phase === 'toSpider' && 
              d.state.spiderIdx === closestSpider.idx
            );
            
            if (!spiderBeingHelped) {
              // This drone will help the closest spider
              state.from = group.position.clone();
              state.to = closestSpider.spider.instance.group.position.clone().add(new THREE.Vector3(0, 2.5, 0));
              state.t = 0;
              state.phase = 'toSpider';
              state.spiderIdx = closestSpider.idx;
            }
          }
        }
      } else if (state.phase === 'toSpider') {
        state.t += state.speed * deltaTime;
        if (state.t >= 1) {
          state.t = 1;
          state.phase = 'resupply';
          state.waitTime = 1.2;
          // Resupply spider
          if (state.spiderIdx !== null) {
            spiderManager.resupplySpider(state.spiderIdx);
          }
        }
        // Interpolate drone position (full 3D)
        group.position.lerpVectors(state.from, state.to, state.t);
      } else if (state.phase === 'resupply') {
        state.waitTime -= deltaTime;
        if (state.waitTime <= 0) {
          // Return to a random position above the lake
          state.from = group.position.clone();
          state.to = new THREE.Vector3(-40 + Math.random() * 20, 12 + Math.random() * 4, -40 + Math.random() * 20);
          state.t = 0;
          state.phase = 'toLake';
          state.spiderIdx = null;
        }
        // Hold position
      } else if (state.phase === 'toLake') {
        state.t += state.speed * deltaTime;
        if (state.t >= 1) {
          state.t = 1;
          // Reached lake area, now descend
          state.phase = 'descend';
          state.waitTime = 1.0; // Time to stay at lake surface
          state.baseY = group.position.y; // Store current height for ascent
        }
        group.position.lerpVectors(state.from, state.to, state.t);
      } else if (state.phase === 'descend') {
        // Descend to lake surface
        group.position.y += (1.5 - group.position.y) * 0.18;
        // Keep X and Z within lake area
        group.position.x = state.lakePos.x;
        group.position.z = state.lakePos.z;
        if (Math.abs(group.position.y - 1.5) < 0.05) {
          group.position.y = 1.5; // Snap to surface
          state.waitTime -= deltaTime;
          if (state.waitTime <= 0) {
            state.phase = 'ascend';
            state.baseY = 12 + Math.random() * 4; // Fly higher after resupply
          }
        }
      } else if (state.phase === 'ascend') {
        // Ascend from lake
        group.position.y += (state.baseY - group.position.y) * 0.18;
        // Keep X and Z within lake area
        group.position.x = state.lakePos.x;
        group.position.z = state.lakePos.z;
        if (Math.abs(group.position.y - state.baseY) < 0.05) {
          group.position.y = state.baseY; // Snap to base height
          state.from = group.position.clone();
          state.to = group.position.clone();
          state.phase = 'idle';
        }
      }
      // Animate propellers (spin)
      for (const child of group.children) {
        if (child instanceof THREE.Mesh && child.geometry && child.geometry.type === 'BoxGeometry' && 
            child.geometry.parameters.width === 0.02 && child.geometry.parameters.height === 0.3) {
          // This is a propeller - spin it
          child.rotation.z += deltaTime * 20;
        }
      }
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
    animationId = requestAnimationFrame(animate);
  }
  animate(0);

  // Close on click or Escape
  function close3D() {
    if (!mega3DActive) return;
    mega3DActive = false;
    if (animationId) cancelAnimationFrame(animationId);
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
    }
    if (threeContainer) {
      document.body.removeChild(threeContainer);
      threeContainer = null;
    }
    document.body.style.overflow = '';
    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  }
  threeContainer.addEventListener('click', close3D);
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') close3D();
  }
  window.addEventListener('keydown', onKey);
  function onResize() {
    if (!renderer || !camera) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);
} 