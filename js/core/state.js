import * as THREE from 'three';
import { scene } from './scene.js';
import { blockMaterials } from '../world/blocks.js';
import { BLOCK_TYPES } from './game.js';

// =====================================================================
// ESTADO GLOBAL DEL MUNDO
// =====================================================================
export const blockMap = new Map();           // key -> { type, mesh }
export const chunkInstancedMeshes = new Map(); // chunkKey -> { type -> InstancedMesh }
export const pendingChunkRebuild = new Set();
export const playerModified = new Set();      // keys de bloques modificados por jugador
export const loadedChunks = new Map();        // chunkKey -> Set de keys de bloques

// Constantes de chunks
export const CHUNK_SIZE = 16;
export const RENDER_DIST = 2;
export const UNLOAD_DIST = 4;

// =====================================================================
// INVENTARIO Y HOTBAR
// =====================================================================
export const HOTBAR_SIZE = 9;
export const INV_SIZE = 27;
export const hotbar = Array.from({ length: HOTBAR_SIZE }, () => ({ type: null, count: 0 }));
export const invGrid = Array.from({ length: INV_SIZE }, () => ({ type: null, count: 0 }));
export let activeHotbarSlot = 0;
export let inventoryOpen = false;
export let heldItem = null;  // item que se arrastra en inventario

// Función para modificar el slot activo
export function setActiveHotbarSlot(slot) {
  activeHotbarSlot = Math.max(0, Math.min(HOTBAR_SIZE - 1, slot));
}

export function setInventoryOpen(open) {
  inventoryOpen = open;
}

export function setHeldItem(item) {
  heldItem = item;
}

// =====================================================================
// CRAFTEO
// =====================================================================
export const craftGrid = Array.from({ length: 9 }, () => ({ type: null, count: 0 }));

// =====================================================================
// UTILIDADES DE COORDENADAS
// =====================================================================
export function blockKey(x, y, z) {
  return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
}

export function worldToChunk(wx, wz) {
  return [Math.floor(wx / CHUNK_SIZE), Math.floor(wz / CHUNK_SIZE)];
}

export function chunkKey(cx, cz) {
  return `${cx},${cz}`;
}

// =====================================================================
// OPERACIONES DE BLOQUES (con actualización de chunks)
// =====================================================================
// Añadir bloque en el mapa (sin mesh individual)
export function addBlock(x, y, z, type) {
  const key = blockKey(x, y, z);
  if (blockMap.has(key)) return;
  blockMap.set(key, { type });
}

// Añadir bloque con mesh individual (para colocaciones manuales)
export function addBlockImmediate(x, y, z, type) {
  const key = blockKey(x, y, z);
  if (blockMap.has(key)) return;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), blockMaterials[type]);
  mesh.position.set(Math.round(x), Math.round(y), Math.round(z));
  mesh.userData.blockType = type;
  scene.add(mesh);
  blockMap.set(key, { type, mesh });
  playerModified.add(key);
  // Marcar chunk para reconstruir instancias
  const [cx, cz] = worldToChunk(x, z);
  pendingChunkRebuild.add(chunkKey(cx, cz));
}

// Eliminar bloque
export function removeBlock(x, y, z) {
  const key = blockKey(x, y, z);
  const entry = blockMap.get(key);
  if (!entry) return null;
  const type = entry.type;
  if (BLOCK_TYPES[type] && BLOCK_TYPES[type].unbreakable) return null;
  if (entry.mesh) scene.remove(entry.mesh);
  blockMap.delete(key);
  playerModified.add(key);
  const [cx, cz] = worldToChunk(x, z);
  pendingChunkRebuild.add(chunkKey(cx, cz));
  return type;
}

export function hasBlock(x, y, z) {
  return blockMap.has(blockKey(x, y, z));
}