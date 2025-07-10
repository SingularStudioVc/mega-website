import * as THREE from 'three';

export function createGround(lakeCenter?: THREE.Vector3, lakeSize?: number): THREE.Mesh {
  // Add a large ground plane
  const planeGeometry = new THREE.PlaneGeometry(100, 100, 120, 120); // Increased segments for more detail
  
  // Modify vertices to create a depression for the lake
  if (lakeCenter && lakeSize) {
    const positions = planeGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3().fromBufferAttribute(positions, i);
      const worldVertex = new THREE.Vector3(vertex.x, vertex.y, 0); // Plane is XY before rotation
      
      const dist = worldVertex.distanceTo(new THREE.Vector3(lakeCenter.x, lakeCenter.z, 0));
      
      if (dist < lakeSize / 2) {
        // Inside the lake, push it down
        const depth = (lakeSize / 2 - dist) * 0.8; // Much deeper depression
        positions.setZ(i, vertex.z - depth);
      } else if (dist < lakeSize / 2 + 15) {
        // Create a steeper transition (shoreline)
        const transitionFactor = (dist - lakeSize / 2) / 15;
        const depth = (1 - transitionFactor) * (lakeSize / 2 - dist) * 0.5;
        positions.setZ(i, vertex.z - depth * (1 - Math.pow(transitionFactor, 3)));
      }
    }
    planeGeometry.attributes.position.needsUpdate = true;
    planeGeometry.computeVertexNormals();
  }
  
  // Create a grid texture for speed effect
  const gridCanvas = document.createElement('canvas');
  gridCanvas.width = 512;
  gridCanvas.height = 512;
  const gridCtx = gridCanvas.getContext('2d')!;
  gridCtx.fillStyle = '#222244';
  gridCtx.fillRect(0, 0, 512, 512);
  gridCtx.strokeStyle = '#4048f3';
  gridCtx.lineWidth = 2;
  for (let i = 0; i <= 512; i += 64) {
    gridCtx.beginPath();
    gridCtx.moveTo(i, 0);
    gridCtx.lineTo(i, 512);
    gridCtx.stroke();
    gridCtx.beginPath();
    gridCtx.moveTo(0, i);
    gridCtx.lineTo(512, i);
    gridCtx.stroke();
  }
  const gridTexture = new THREE.CanvasTexture(gridCanvas);
  gridTexture.wrapS = gridTexture.wrapT = THREE.RepeatWrapping;
  gridTexture.repeat.set(10, 10);
  
  const planeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x222244, 
    map: gridTexture,
    roughness: 0.8,
    metalness: 0.2
  });
  
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0;
  plane.receiveShadow = true;
  
  return plane;
} 