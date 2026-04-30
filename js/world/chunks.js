import * as THREE from 'three';
import { scene } from '../core/scene.js';
import { blockGeo, blockMaterials } from './blocks.js';
import { getHeight, pseudoRand } from './terrain.js';
import { 
  blockMap, chunkInstancedMeshes, pendingChunkRebuild, playerModified, loadedChunks,
  CHUNK_SIZE, blockKey, worldToChunk, chunkKey, addBlock, addBlockImmediate, hasBlock
} from '../core/state.js';
import { BLOCK_TYPES } from '../core/game.js';

// Construir malla de instancias para un chunk
export function buildChunkMesh(cx, cz) {
  const ck = chunkKey(cx, cz);
  // Eliminar instancias anteriores
  if (chunkInstancedMeshes.has(ck)) {
    for (const im of Object.values(chunkInstancedMeshes.get(ck))) {
      scene.remove(im);
      im.dispose();
    }
    chunkInstancedMeshes.delete(ck);
  }

  const byType = {};
  const x0 = cx * CHUNK_SIZE;
  const z0 = cz * CHUNK_SIZE;
  const dummy = new THREE.Object3D();

  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const wx = x0 + lx;
      const wz = z0 + lz;
      for (let y = -6; y <= 20; y++) {
        const key = blockKey(wx, y, wz);
        const entry = blockMap.get(key);
        if (!entry || entry.mesh) continue; // omitir bloques individuales
        const type = entry.type;
        if (!byType[type]) byType[type] = [];
        byType[type].push([wx, y, wz]);
      }
    }
  }

  const meshMap = {};
  for (const [type, positions] of Object.entries(byType)) {
    if (!blockMaterials[type]) continue;
    const im = new THREE.InstancedMesh(blockGeo, blockMaterials[type], positions.length);
    im.userData.isChunkMesh = true;
    im.userData.chunkKey = ck;
    positions.forEach(([px, py, pz], i) => {
      dummy.position.set(px, py, pz);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
      if (!im.userData.positions) im.userData.positions = [];
      im.userData.positions.push(blockKey(px, py, pz));
    });
    im.instanceMatrix.needsUpdate = true;
    scene.add(im);
    meshMap[type] = im;
  }
  chunkInstancedMeshes.set(ck, meshMap);
}

// Función para colocar árboles
function placeTree(x, z, blockKeys) {
  const h = getHeight(x, z) + 1;
  const trunkH = pseudoRand(x, z, 7) < 0.5 ? 4 : 5;
  for (let y = h; y < h + trunkH; y++) {
    const key = blockKey(x, y, z);
    if (!playerModified.has(key)) {
      addBlock(x, y, z, 'log');
      if (blockKeys) blockKeys.add(key);
    }
  }
  const top = h + trunkH;
  for (let ly = top - 1; ly <= top + 1; ly++) {
    const r = ly === top + 1 ? 1 : 2;
    for (let lx = -r; lx <= r; lx++) {
      for (let lz = -r; lz <= r; lz++) {
        if (Math.abs(lx) === r && Math.abs(lz) === r) continue;
        const key = blockKey(x + lx, ly, z + lz);
        if (!hasBlock(x + lx, ly, z + lz) && !playerModified.has(key)) {
          addBlock(x + lx, ly, z + lz, 'leaves');
          if (blockKeys) blockKeys.add(key);
        }
      }
    }
  }
}

// Generar un chunk completo
export function generateChunk(cx, cz) {
  const ck = chunkKey(cx, cz);
  if (loadedChunks.has(ck)) return;

  const blockKeys = new Set();
  const trees = [];

  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const wx = cx * CHUNK_SIZE + lx;
      const wz = cz * CHUNK_SIZE + lz;
      const h = getHeight(wx, wz);

      // Bedrock en y = -6
      const bedrockKey = blockKey(wx, -6, wz);
      if (!playerModified.has(bedrockKey)) {
        addBlock(wx, -6, wz, 'bedrock');
        blockKeys.add(bedrockKey);
      }

      // Capas de terreno
      for (let y = -5; y <= h; y++) {
        const key = blockKey(wx, y, wz);
        if (playerModified.has(key)) continue;
        let type;
        if (y === h) type = 'grass';
        else if (y > h - 3) type = 'dirt';
        else {
          const r = pseudoRand(wx, wz * 100 + y, 1);
          const depth = h - y;
          if      (r < 0.035 && depth >= 2)  type = 'coal';
          else if (r < 0.050 && depth >= 5)  type = 'iron_ore';
          else if (r < 0.060 && depth >= 8)  type = 'lapis_ore';
          else if (r < 0.068 && depth >= 10) type = 'gold_ore';
          else if (r < 0.073 && depth >= 12) type = 'redstone_ore';
          else if (r < 0.077 && depth >= 14) type = 'emerald_ore';
          else if (r < 0.080 && depth >= 16) type = 'diamond_ore';
          else type = 'stone';
        }
        addBlock(wx, y, wz, type);
        blockKeys.add(key);
      }

      // Arena en zonas bajas
      if (h < -1) {
        for (let y = h + 1; y <= -1; y++) {
          const key = blockKey(wx, y, wz);
          if (!playerModified.has(key)) {
            addBlock(wx, y, wz, 'sand');
            blockKeys.add(key);
          }
        }
      }

      // Árboles
      if (h >= 0 && pseudoRand(wx, wz, 42) < 0.03) trees.push([wx, wz]);

      // Grava ocasional
      if (h >= 0 && pseudoRand(wx, wz, 99) < 0.015) {
        const gravelKey = blockKey(wx, h, wz);
        if (!playerModified.has(gravelKey) && blockMap.has(gravelKey)) {
          // Reemplazar el bloque existente por grava
          const existing = blockMap.get(gravelKey);
          if (existing.mesh) scene.remove(existing.mesh);
          blockMap.delete(gravelKey);
          addBlock(wx, h, wz, 'gravel');
          blockKeys.add(gravelKey);
        }
      }
    }
  }

  // Colocar árboles
  for (const [tx, tz] of trees) placeTree(tx, tz, blockKeys);

  loadedChunks.set(ck, blockKeys);
  buildChunkMesh(cx, cz);
}

// Descargar chunk
export function unloadChunk(cx, cz) {
  const ck = chunkKey(cx, cz);
  const keys = loadedChunks.get(ck);
  if (!keys) return;
  if (chunkInstancedMeshes.has(ck)) {
    for (const im of Object.values(chunkInstancedMeshes.get(ck))) {
      scene.remove(im);
      im.dispose();
    }
    chunkInstancedMeshes.delete(ck);
  }
  for (const key of keys) {
    if (playerModified.has(key)) continue;
    const entry = blockMap.get(key);
    if (entry) {
      if (entry.mesh) scene.remove(entry.mesh);
      blockMap.delete(key);
    }
  }
  loadedChunks.delete(ck);
}