import * as THREE from 'three';
import { camera, renderer, scene, getClock } from './core/scene.js';
import { FPSControls } from './core/controls.js';
import { setGameMode, GAME_MODE, BLOCK_TYPES, canBreakBlock, BLOCK_DROPS } from './core/game.js';
import { 
  blockMap, chunkInstancedMeshes, pendingChunkRebuild, playerModified, loadedChunks,
  CHUNK_SIZE, RENDER_DIST, UNLOAD_DIST, hotbar, activeHotbarSlot, inventoryOpen, heldItem,
  setInventoryOpen, setActiveHotbarSlot, blockKey, worldToChunk, chunkKey, addBlock, addBlockImmediate, removeBlock, hasBlock
} from './core/state.js';
import { generateChunk, unloadChunk, buildChunkMesh } from './world/chunks.js';
import { move, velocity, canJump, lastFallY } from './player/movement.js';
import { damagePlayer, healPlayer, renderHealthBar, updateInvincible } from './player/health.js';
import { updateRaycaster, handleBreak, handlePlace } from './player/interaction.js';
import { getActiveBlock, giveItem, renderHotbar} from './inventory/inventory.js';
import { openInventory, closeInventory, renderInventoryUI, renderCraftGrid, initInventoryUI } from './inventory/ui.js';
import { getHeight } from './world/terrain.js';

// Configuración inicial
const clock = getClock();
let frameCount = 0;
let lastFPSTime = performance.now();

// Controles
const controls = new FPSControls(camera, renderer.domElement);
const overlay = document.getElementById('overlay');

// Botones de modo
document.getElementById('btn-survival').addEventListener('click', () => {
  setGameMode('survival');
  controls.lock();
});
document.getElementById('btn-creative').addEventListener('click', () => {
  setGameMode('creative');
  controls.lock();
});

controls.addEventListener('lock', () => { overlay.style.display = 'none'; });
controls.addEventListener('unlock', () => { if (!inventoryOpen) overlay.style.display = 'flex'; });

// Variables de entrada
const keys = {};

// Inicializar UI
initInventoryUI();
renderHotbar();
renderHealthBar();

// Generar chunks iniciales
function generateInitialChunks() {
  const [pcx, pcz] = worldToChunk(0, 0);
  for (let dx = -RENDER_DIST; dx <= RENDER_DIST; dx++) {
    for (let dz = -RENDER_DIST; dz <= RENDER_DIST; dz++) {
      generateChunk(pcx + dx, pcz + dz);
    }
  }
}
generateInitialChunks();

// Bucle de actualización de chunks
let chunkUpdateTimer = 0;
const CHUNK_UPDATE_INTERVAL = 0.25;

function updateChunks(delta) {
  chunkUpdateTimer += delta;
  if (chunkUpdateTimer < CHUNK_UPDATE_INTERVAL) return;
  chunkUpdateTimer = 0;

  const [pcx, pcz] = worldToChunk(camera.position.x, camera.position.z);
  for (let dx = -RENDER_DIST; dx <= RENDER_DIST; dx++) {
    for (let dz = -RENDER_DIST; dz <= RENDER_DIST; dz++) {
      const ck = chunkKey(pcx + dx, pcz + dz);
      if (!loadedChunks.has(ck)) {
        generateChunk(pcx + dx, pcz + dz);
        return;
      }
    }
  }
  for (const ck of loadedChunks.keys()) {
    const [cx, cz] = ck.split(',').map(Number);
    if (Math.abs(cx - pcx) > UNLOAD_DIST || Math.abs(cz - pcz) > UNLOAD_DIST) {
      unloadChunk(cx, cz);
      return;
    }
  }
  document.getElementById('chunk-info').textContent = `Chunk: ${pcx}, ${pcz} | Bloques: ${blockMap.size}`;
}

// Eventos de teclado
document.addEventListener('keydown', (e) => {
  if (!inventoryOpen) keys[e.code] = true;
  const num = parseInt(e.key);
  if (num >= 1 && num <= 9) {
    setActiveHotbarSlot(num - 1);
    renderHotbar();
  }
  if (e.code === 'KeyE') {
    if (inventoryOpen) closeInventory();
    else openInventory();
  }
  if (e.code === 'Escape' && inventoryOpen) closeInventory();
});
document.addEventListener('keyup', (e) => { keys[e.code] = false; });
document.addEventListener('wheel', (e) => {
  if (!controls.isLocked || inventoryOpen) return;
  let newSlot = activeHotbarSlot;
  if (e.deltaY > 0) newSlot = (newSlot + 1) % 9;
  else newSlot = (newSlot - 1 + 9) % 9;
  setActiveHotbarSlot(newSlot);
  renderHotbar();
});

// Eventos de ratón
document.addEventListener('mousedown', (e) => {
  if (!controls.isLocked || inventoryOpen) return;
  const heldType = hotbar[activeHotbarSlot].type;
  if (e.button === 0) handleBreak(e, heldType);
  if (e.button === 2) handlePlace(e, getActiveBlock());
});
document.addEventListener('contextmenu', (e) => e.preventDefault());

// HUD
function updateHUD() {
  frameCount++;
  const now = performance.now();
  if (now - lastFPSTime >= 500) {
    document.getElementById('fps').textContent = 'FPS: ' + Math.round(frameCount / ((now - lastFPSTime) / 1000));
    frameCount = 0;
    lastFPSTime = now;
  }
  const p = camera.position;
  document.getElementById('pos').textContent = `Pos: ${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}`;
}

// Animación principal
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  updateInvincible(delta);

  if (controls.isLocked && !inventoryOpen) {
    move(delta, keys);
    updateChunks(delta);
    updateRaycaster(scene, chunkInstancedMeshes, getActiveBlock, BLOCK_TYPES);
  }
  updateHUD();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});