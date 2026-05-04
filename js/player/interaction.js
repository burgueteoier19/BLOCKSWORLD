import * as THREE from 'three';
import { camera } from '../core/scene.js';
import { scene } from '../core/scene.js';
import { hasBlock, blockKey } from '../core/state.js';
import { blockMap, chunkInstancedMeshes, addBlockImmediate, removeBlock, playerModified, pendingChunkRebuild, worldToChunk, chunkKey } from '../core/state.js';
import { canBreakBlock, BLOCK_TYPES, BLOCK_DROPS } from '../core/game.js';
import { giveItem, getActiveBlock } from '../inventory/inventory.js';
import { buildChunkMesh } from '../world/chunks.js';

// Elementos visuales para highlight y ghost
const highlightMesh = new THREE.Mesh(
  new THREE.BoxGeometry(1.01, 1.01, 1.01),
  new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.35, transparent: true, wireframe: true })
);
highlightMesh.visible = false;
scene.add(highlightMesh);

const ghostMat = new THREE.MeshLambertMaterial({ opacity: 0.4, transparent: true });
const ghostMesh = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.02, 1.02), ghostMat);
ghostMesh.visible = false;
scene.add(ghostMesh);

const raycaster = new THREE.Raycaster();
raycaster.far = 7;
const CENTER = new THREE.Vector2(0, 0);

let targetedBlock = null;

function getBlockMaterialColor(blockType) {
  const info = BLOCK_TYPES[blockType];
  return info ? info.color : 0x888888;
}

export function updateRaycaster(scene, chunkInstancedMeshes, getActiveBlockFn, BLOCK_TYPES) {
  raycaster.setFromCamera(CENTER, camera);
  const nearbyMeshes = [];
  
  const camX = Math.round(camera.position.x);
  const camY = Math.round(camera.position.y);
  const camZ = Math.round(camera.position.z);
  for (let dx = -8; dx <= 8; dx++) {
    for (let dy = -5; dy <= 5; dy++) {
      for (let dz = -8; dz <= 8; dz++) {
        const entry = blockMap.get(blockKey(camX+dx, camY+dy, camZ+dz));
        if (entry && entry.mesh) nearbyMeshes.push(entry.mesh);
      }
    }
  }
  
  const [pcx, pcz] = worldToChunk(camera.position.x, camera.position.z);
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      const ck = chunkKey(pcx+dx, pcz+dz);
      const meshMap = chunkInstancedMeshes.get(ck);
      if (meshMap) {
        for (const im of Object.values(meshMap)) nearbyMeshes.push(im);
      }
    }
  }
  
  const hits = raycaster.intersectObjects(nearbyMeshes);
  if (hits.length > 0) {
    const hit = hits[0];
    let hitPos;
    if (hit.object.isInstancedMesh) {
      const m = new THREE.Matrix4();
      hit.object.getMatrixAt(hit.instanceId, m);
      hitPos = new THREE.Vector3().setFromMatrixPosition(m);
    } else {
      hitPos = hit.object.position.clone();
    }
    highlightMesh.position.copy(hitPos);
    highlightMesh.visible = true;
    const normal = hit.face.normal.clone().round();
    const placePos = hitPos.clone().add(normal);
    const active = getActiveBlockFn();
    if (active) {
      ghostMat.color.setHex(getBlockMaterialColor(active));
      ghostMesh.position.copy(placePos);
      ghostMesh.visible = true;
    } else {
      ghostMesh.visible = false;
    }
    targetedBlock = { mesh: hit.object, position: hitPos, placePos, normal };
  } else {
    highlightMesh.visible = false;
    ghostMesh.visible = false;
    targetedBlock = null;
  }
}


export function handleBreak(e, heldItemType) {
  if (!targetedBlock) return;
  const pos = targetedBlock.position;
  const entry = blockMap.get(blockKey(pos.x, pos.y, pos.z));
  const blockType = entry ? entry.type : null;
  if (!canBreakBlock(blockType, heldItemType)) {
    const ch = document.getElementById('crosshair');
    if (ch) { ch.style.color = '#f55'; setTimeout(() => ch.style.color = 'white', 200); }
    return;
  }
  const dropped = removeBlock(pos.x, pos.y, pos.z);
  if (dropped) {
    const drop = BLOCK_DROPS[dropped];
    if (drop) giveItem(drop, 1);
    if (dropped === 'leaves' && Math.random() < 0.12) giveItem('log', 1);
    const [bcx, bcz] = worldToChunk(pos.x, pos.z);
    buildChunkMesh(bcx, bcz);
  }
}

export function handlePlace(e, activeBlock) {
  if (!targetedBlock) return;
  if (!activeBlock) return;
  const np = targetedBlock.placePos;
  const cp = camera.position;
  const dx = Math.abs(np.x - Math.round(cp.x));
  const dz = Math.abs(np.z - Math.round(cp.z));
  const dy = np.y - Math.floor(cp.y) + 1;
  if (!(dx <= 0 && dz <= 0 && dy >= 0 && dy <= 1) && !hasBlock(np.x, np.y, np.z)) {
    addBlockImmediate(np.x, np.y, np.z, activeBlock);
  }
}
