import * as THREE from 'three';

export function createMegaBall(): THREE.Mesh {
  // Create a single ball (sphere) with MEGA logo
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  
  // Create a canvas texture with the MEGA SVG logo
  const ballCanvas = document.createElement('canvas');
  ballCanvas.width = 256;
  ballCanvas.height = 256;
  const ballCtx = ballCanvas.getContext('2d')!;
  
  // Fill base color
  ballCtx.fillStyle = '#ffffff';
  ballCtx.fillRect(0, 0, 256, 256);
  
  // Draw MEGA SVG logo centered and scaled
  const img = new window.Image();
  img.onload = () => {
    // Draw the SVG logo in the center, scaled to about 60% of the ball
    const logoSize = 140;
    ballCtx.drawImage(img, (256 - logoSize) / 2, (256 - logoSize) / 2, logoSize, logoSize);
    ballTexture.needsUpdate = true;
  };
  img.src = '/src/svg/mega.svg';
  
  const ballTexture = new THREE.CanvasTexture(ballCanvas);
  ballTexture.wrapS = ballTexture.wrapT = THREE.ClampToEdgeWrapping;
  ballTexture.repeat.set(1, 1);
  
  const material = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    map: ballTexture,
    roughness: 0.1,
    metalness: 0.2
  });
  
  const sphere = new THREE.Mesh(geometry, material);
  sphere.castShadow = true;
  
  return sphere;
}

export function createBallShadow(): THREE.Mesh {
  // Add a shadow under the ball
  const shadowGeometry = new THREE.CircleGeometry(1.1, 32);
  const shadowMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x000000, 
    opacity: 0.25, 
    transparent: true 
  });
  const shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.01;
  
  return shadowMesh;
} 