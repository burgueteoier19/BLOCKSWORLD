import * as THREE from 'three';
import { camera } from '../core/scene.js';
import { GAME_MODE } from '../core/game.js';
import { hasBlock } from '../core/state.js';
import { damagePlayer, onLand } from './health.js';

// Constantes físicas (solo para modo supervivencia)
const RADIUS = 0.30;
const PLAYER_HEIGHT = 1.62;
const GRAVITY = 28.0;
const JUMP_SPEED = 8.4;
const WALK_SPEED = 4.8;
const MAX_FALL = 22.0;
const STEP_HEIGHT = 0.6;

// Estado dinámico
export let velocity = new THREE.Vector3();
export let canJump = false;
export let lastFallY = null;

// Funciones auxiliares de colisión
function solidAt(x, y, z) {
  return hasBlock(Math.floor(x), Math.floor(y), Math.floor(z));
}

function aabbCorners(px, pz) {
  const m = 0.02;
  return [
    [px - RADIUS + m, pz - RADIUS + m],
    [px + RADIUS - m, pz - RADIUS + m],
    [px - RADIUS + m, pz + RADIUS - m],
    [px + RADIUS - m, pz + RADIUS - m],
  ];
}

function overlapY(px, py, pz) {
  const feet = py - PLAYER_HEIGHT;
  const head = py - 0.05;
  const corners = aabbCorners(px, pz);
  for (let scanY = Math.floor(feet); scanY <= Math.floor(head); scanY++) {
    for (const [cx2, cz2] of corners) {
      if (solidAt(cx2, scanY, cz2)) return true;
    }
  }
  return false;
}

// Movimiento en X con step-up
function resolveX(dx) {
  camera.position.x += dx;
  const x = camera.position.x;
  const y0 = camera.position.y - PLAYER_HEIGHT + 0.01;
  const y1 = camera.position.y - 0.05;
  const zp = camera.position.z;
  const zOffsets = [-RADIUS + 0.03, 0, RADIUS - 0.03];
  let hit = false;
  if (dx > 0) {
    const rx = x + RADIUS;
    outer: for (let fy = y0; fy <= y1 + 0.01; fy += Math.max((y1 - y0) / 3, 0.01)) {
      for (const oz of zOffsets) {
        if (solidAt(rx, fy, zp + oz)) { hit = true; break outer; }
      }
    }
    if (hit) {
      const stepTop = Math.floor(camera.position.y - PLAYER_HEIGHT + STEP_HEIGHT) + 1;
      const feetAfterStep = stepTop;
      if (feetAfterStep - (camera.position.y - PLAYER_HEIGHT) <= STEP_HEIGHT && canJump) {
        let canStep = true;
        for (const oz of zOffsets) {
          if (solidAt(rx, feetAfterStep, zp + oz) || solidAt(rx, feetAfterStep + 1, zp + oz)) {
            canStep = false; break;
          }
        }
        if (canStep) { camera.position.y = feetAfterStep + PLAYER_HEIGHT; return; }
      }
      camera.position.x = Math.floor(rx) - RADIUS - 0.002;
    }
  } else if (dx < 0) {
    const lx = x - RADIUS;
    outer: for (let fy = y0; fy <= y1 + 0.01; fy += Math.max((y1 - y0) / 3, 0.01)) {
      for (const oz of zOffsets) {
        if (solidAt(lx, fy, zp + oz)) { hit = true; break outer; }
      }
    }
    if (hit) {
      const stepTop = Math.floor(camera.position.y - PLAYER_HEIGHT + STEP_HEIGHT) + 1;
      const feetAfterStep = stepTop;
      if (feetAfterStep - (camera.position.y - PLAYER_HEIGHT) <= STEP_HEIGHT && canJump) {
        let canStep = true;
        for (const oz of zOffsets) {
          if (solidAt(lx, feetAfterStep, zp + oz) || solidAt(lx, feetAfterStep + 1, zp + oz)) {
            canStep = false; break;
          }
        }
        if (canStep) { camera.position.y = feetAfterStep + PLAYER_HEIGHT; return; }
      }
      camera.position.x = Math.floor(lx) + 1 + RADIUS + 0.002;
    }
  }
}

function resolveZ(dz) {
  camera.position.z += dz;
  const z = camera.position.z;
  const y0 = camera.position.y - PLAYER_HEIGHT + 0.01;
  const y1 = camera.position.y - 0.05;
  const xp = camera.position.x;
  const xOffsets = [-RADIUS + 0.03, 0, RADIUS - 0.03];
  let hit = false;
  if (dz > 0) {
    const fz = z + RADIUS;
    outer: for (let fy = y0; fy <= y1 + 0.01; fy += Math.max((y1 - y0) / 3, 0.01)) {
      for (const ox of xOffsets) {
        if (solidAt(xp + ox, fy, fz)) { hit = true; break outer; }
      }
    }
    if (hit) {
      const stepTop = Math.floor(camera.position.y - PLAYER_HEIGHT + STEP_HEIGHT) + 1;
      if (stepTop - (camera.position.y - PLAYER_HEIGHT) <= STEP_HEIGHT && canJump) {
        let canStep = true;
        for (const ox of xOffsets) {
          if (solidAt(xp + ox, stepTop, fz) || solidAt(xp + ox, stepTop + 1, fz)) { canStep = false; break; }
        }
        if (canStep) { camera.position.y = stepTop + PLAYER_HEIGHT; return; }
      }
      camera.position.z = Math.floor(fz) - RADIUS - 0.002;
    }
  } else if (dz < 0) {
    const bz = z - RADIUS;
    outer: for (let fy = y0; fy <= y1 + 0.01; fy += Math.max((y1 - y0) / 3, 0.01)) {
      for (const ox of xOffsets) {
        if (solidAt(xp + ox, fy, bz)) { hit = true; break outer; }
      }
    }
    if (hit) {
      const stepTop = Math.floor(camera.position.y - PLAYER_HEIGHT + STEP_HEIGHT) + 1;
      if (stepTop - (camera.position.y - PLAYER_HEIGHT) <= STEP_HEIGHT && canJump) {
        let canStep = true;
        for (const ox of xOffsets) {
          if (solidAt(xp + ox, stepTop, bz) || solidAt(xp + ox, stepTop + 1, bz)) { canStep = false; break; }
        }
        if (canStep) { camera.position.y = stepTop + PLAYER_HEIGHT; return; }
      }
      camera.position.z = Math.floor(bz) + 1 + RADIUS + 0.002;
    }
  }
}

function resolveY(dy) {
  camera.position.y += dy;
  const cx = camera.position.x;
  const cz = camera.position.z;
  const corners = aabbCorners(cx, cz);
  if (dy <= 0) {
    const feetY = camera.position.y - PLAYER_HEIGHT;
    let groundTop = -Infinity;
    for (const [bx, bz2] of corners) {
      for (let scan = 0; scan <= 2; scan++) {
        const by = Math.floor(feetY) - scan;
        if (solidAt(bx, by, bz2)) { groundTop = Math.max(groundTop, by + 1); break; }
      }
    }
    if (groundTop > -Infinity && feetY < groundTop + 0.02) {
      if (GAME_MODE === 'survival' && lastFallY !== null) {
        const fallDist = lastFallY - groundTop;
        if (fallDist > 3.5) damagePlayer(Math.floor(fallDist - 3));
      }
      camera.position.y = groundTop + PLAYER_HEIGHT;
      velocity.y = 0;
      canJump = true;
      lastFallY = null;
    }
  }
  if (dy > 0) {
    const headY = camera.position.y - 0.01;
    for (const [bx, bz2] of corners) {
      if (solidAt(bx, headY, bz2)) {
        camera.position.y = Math.floor(headY) - 0.01;
        velocity.y = 0;
        break;
      }
    }
  }
}

// Movimiento principal (llamado desde main.js)
export function move(delta, keys) {
  if (GAME_MODE === 'creative') {
    const spd = 14 * delta;
    const fwd = new THREE.Vector3();
    const right = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    right.crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
    if (keys['KeyW']) camera.position.addScaledVector(fwd, spd);
    if (keys['KeyS']) camera.position.addScaledVector(fwd, -spd);
    if (keys['KeyA']) camera.position.addScaledVector(right, -spd);
    if (keys['KeyD']) camera.position.addScaledVector(right, spd);
    if (keys['Space']) camera.position.y += spd;
    if (keys['ShiftLeft'] || keys['ShiftRight']) camera.position.y -= spd;
    return;
  }

  // Movimiento horizontal
  const fwd = new THREE.Vector3();
  const right = new THREE.Vector3();
  camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
  right.crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();

  let moveX = 0, moveZ = 0;
  if (keys['KeyW']) { moveX += fwd.x; moveZ += fwd.z; }
  if (keys['KeyS']) { moveX -= fwd.x; moveZ -= fwd.z; }
  if (keys['KeyA']) { moveX -= right.x; moveZ -= right.z; }
  if (keys['KeyD']) { moveX += right.x; moveZ += right.z; }
  const hlen = Math.sqrt(moveX * moveX + moveZ * moveZ);
  if (hlen > 0) { moveX /= hlen; moveZ /= hlen; }

  velocity.y -= GRAVITY * delta;
  velocity.y = Math.max(velocity.y, -MAX_FALL);

  if (keys['Space'] && canJump) {
    velocity.y = JUMP_SPEED;
    canJump = false;
    lastFallY = null;
  }

  if (velocity.y < -0.5 && lastFallY === null) lastFallY = camera.position.y - PLAYER_HEIGHT;
  if (canJump) lastFallY = null;

  const SUBSTEPS = 4;
  const sd = delta / SUBSTEPS;
  const dx = moveX * WALK_SPEED * sd;
  const dz = moveZ * WALK_SPEED * sd;
  const dy = velocity.y * sd;

  for (let s = 0; s < SUBSTEPS; s++) {
    resolveX(dx);
    resolveZ(dz);
    resolveY(dy);
  }
}

export function resetVelocity() {
  velocity = new THREE.Vector3(0, 0, 0);
  canJump = false;
  velocity.y = 0;
}